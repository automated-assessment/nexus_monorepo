class SendSubmissionJob < ActiveJob::Base
  queue_as :nexus_submissions

  def perform(submission_id)
    @submission = Submission.find(submission_id)
    @submission.log("Triggered submission job")
  end
end
