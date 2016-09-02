require 'csv'

class Submission < ActiveRecord::Base
  belongs_to :assignment
  belongs_to :user
  has_many :intermediate_marks
  has_many :feedback_items
  has_many :audit_items

  validates :assignment, presence: true
  validates :user, presence: true

  default_scope { order(:submitted).reverse_order }

  before_create do
    @de = DeadlineExtension.find_by(assignment: assignment, user: user)
    if @de.present?
      self.late = @de.extendeddeadline.past?
    else
      self.late = assignment.deadline.past?
    end

    self.submitted = DateTime.now.utc
    self.attempt_number = user.submissions_for(assignment.id).count + 1
  end

  after_create do
    log("Submission id #{id} created.")
    # Create intermediate marks for all tools with weight >0%
    assignment.marking_tool_contexts.each do |mtc|
      IntermediateMark.create(marking_tool_id: mtc.marking_tool.id,
                              submission_id: id) if mtc.weight > 0
    end
  end

  def pending?
    mark.nil?
  end

  def report_extraction_error!
    self.mark = 0
    self.extraction_error = true
    save!
  end

  def calculate_final_mark_if_possible
    return if intermediate_marks.any?(&:pending?)
    log('All Marking Tools have reported. Calculating final mark...')
    final_mark = 0
    intermediate_marks.each do |im|
      final_mark += im.mark * assignment.marking_tool_contexts.find_by(marking_tool_id: im.marking_tool_id).weight / 100
    end
    final_mark = final_mark.floor
    log("Calculated final mark as #{final_mark}")
    if mark_override
      log('Did not set final mark as mark override has been used', 'Warn')
      return
    end
    if late
      self.mark = [assignment.late_cap, final_mark].min
      log("Mark has been capped at #{[assignment.late_cap, final_mark].min} due to being submitted late") if final_mark > assignment.late_cap
    else
      self.mark = final_mark
    end
    save!
  end

  def augmented_clone_url
    url = repourl.dup
    return 'ERR' if url.index('//').nil?
    if studentrepo
      auth = user.githubtoken
      url.insert(url.index('//') + 2, "#{auth}@")
    else
      auth = "#{Rails.configuration.ghe_user}:#{Rails.configuration.ghe_password}"
      url.insert(url.index('//') + 2, "#{auth}@")
    end
    url
  end

  def ensure_enrolled!
    if (!current_user.enrolled_in?(assignment.course.id))
      current_user.courses << assignment.course.id
      flash[:info] = "We've auto-enrolled you into course #{assignment.course.id} to which this assignment belongs."
      log("Auto-enrolling user #{current_user.name} to assignment.")
    end
  end

  def log(body, level = 'info')
    AuditItem.create!(submission: self,
                      body: body,
                      level: level)
  end
end
