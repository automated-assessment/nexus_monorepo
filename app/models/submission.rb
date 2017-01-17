require 'csv'

class Submission < ActiveRecord::Base
  serialize :workflow, Hash

  belongs_to :assignment
  belongs_to :user
  has_many :intermediate_marks, dependent: :destroy
  has_many :feedback_items, dependent: :destroy
  has_many :audit_items, dependent: :destroy

  validates :assignment, presence: true
  validates :user, presence: true

  default_scope { order(:submitted).reverse_order }

  before_create do
    @de = DeadlineExtension.find_by(assignment: assignment, user: user)
    self.late = if @de.present?
                  @de.extendeddeadline.past?
                else
                  assignment.deadline.past?
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
    return 'ERR' if repourl.nil? || repourl.index('//').nil?
    url = repourl.dup
    auth = if studentrepo
             user.githubtoken
           else
             "#{Rails.configuration.ghe_user}:#{Rails.configuration.ghe_password}"
           end
    url.insert(url.index('//') + 2, "#{auth}@")
    url
  end

  def ensure_enrolled!
    unless user.enrolled_in? assignment.course.id
      assignment.course.log("Auto-enrolling user #{user.name} on submission to assignment #{assignment.title}.")

      user.courses << assignment.course
      true
    end

    false
  end

  def log(body, level = 'info')
    AuditItem.create!(submission: self,
                      body: body,
                      level: level)
  end

  def failed_submission?
    failed || !git_success || extraction_error
  end

  def self.failed_submissions
    where('failed=? OR git_success=? OR extraction_error=?', true, false, true)
  end
end
