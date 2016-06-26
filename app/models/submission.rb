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
    self.submitted = DateTime.now.utc
    self.late = assignment.deadline.past?
    self.attempt_number = user.submissions_for(assignment.id).count + 1
  end

  after_create do
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
    log("Calculated final mark as #{final_mark}!")
    if late
      self.mark = [assignment.late_cap, final_mark].min
      log("Mark has been capped at #{[assignment.late_cap, final_mark].min} due to being a late submission") if final_mark > assignment.late_cap
    else
      self.mark = final_mark
    end
    save!
  end

  def log(body, level = 'info')
    AuditItem.create!(submission: self,
                      body: body,
                      level: level)
  end
end
