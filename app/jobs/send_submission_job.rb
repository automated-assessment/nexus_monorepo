require 'net/http'
require 'uri'

class SendSubmissionJob < ActiveJob::Base
  queue_as Rails.configuration.rabbit_mq_qname

  def perform(submission_id, marking_tool_id)
    @submission = Submission.find(submission_id)
    @marking_tool = MarkingTool.find(marking_tool_id)

    uri = URI.parse(@marking_tool.url)
    @submission.log("Notifying #{@marking_tool.name} at #{uri}...")

    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

    req.body = build_json_payload

    res = http.request(req)

    if ((res.code >= 200) && (res.code < 300)) then
      # Successfully handed submission over to tool
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}", "Sucess")
    else
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}", "Error")
    end

  rescue => e
    @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
    # TODO Handle this issue so that either the job is enqueued again or the submission is marked as in need of resending
  end

  private

  def build_json_payload
    payload = {
      student: @submission.user.name,
      sid: @submission.id,
      aid: @submission.assignment.id,
      cloneurl: @submission.augmented_clone_url,
      branch: @submission.gitbranch,
      sha: @submission.commithash
    }
    payload.to_json
  end
end
