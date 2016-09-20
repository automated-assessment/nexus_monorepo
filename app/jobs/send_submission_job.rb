require 'net/http'
require 'uri'

class SendSubmissionJob < ActiveJob::Base
  queue_as Rails.configuration.rabbit_mq_qname

  def perform(submission_id, marking_tool_id)
    @submission = Submission.find(submission_id)
    @marking_tool = MarkingTool.find(marking_tool_id)

    uri = URI.parse(@marking_tool.url)
    @submission.log("Notifying #{@marking_tool.name} at #{uri}...", "Debug")

    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

    req.body = build_json_payload

    res = http.request(req)

    if (res.code =~ /2../) then
      # Successfully handed submission over to tool
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}", "Success")
    else
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}: #{res.body}", "Error")
      record_fail!
    end

  rescue => e
    @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
    record_fail!
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

  def record_fail!
    if (@submission) then
      @submission.log("Recording failure of submission", "Debug")
      @submission.failed = true
      @submission.save!
    end
  end
end
