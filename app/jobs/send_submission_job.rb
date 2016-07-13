class SendSubmissionJob < ActiveJob::Base
  queue_as :nexus_submissions

  def perform(submission_id, marking_tool_id)
    @submission = Submission.find(submission_id)
    @marking_tool = MarkingTool.find(marking_tool_id)
    @submission.log("Triggered submission job for #{@marking_tool.name}")
  rescue => e
    @submission.log("Exception in handling submission: #{e.class} #{e.message}", "Error")
    # TODO Handle this issue so that either the job is enqueued again or the submission is marked as in need of resending
  end
end
