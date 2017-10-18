class IntermediateMark < ActiveRecord::Base
  belongs_to :marking_tool
  belongs_to :submission

  after_save :notify_submission, on: :update

  def pending?
    mark.nil?
  end

  protected

  def notify_submission
    submission.calculate_final_mark_if_possible
  end
end
