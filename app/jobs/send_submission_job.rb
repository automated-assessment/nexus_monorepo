require 'net/http'
require 'uri'

class SendSubmissionJob < ActiveJob::Base
  queue_as Rails.configuration.rabbit_mq_qname

  rescue_from(StandardError) do |e|
    Rails.logger.error "Encountered exception when trying to run submission job: #{e.inspect}."
  end

  def perform(submission_id, marking_tool_id)
    Rails.logger.debug 'Actually inside SendSubmissionJob.perform.'
    @submission = Submission.find(submission_id)
    @marking_tool = MarkingTool.find(marking_tool_id)

    uri = URI.parse(@marking_tool.url)
    @submission.log("Notifying #{@marking_tool.name} at #{uri}...", 'Debug')

    Net::HTTP.start(uri.host, uri.port) do |http|
      req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

      req.body = build_json_payload

      res = http.request(req)

      if res.code =~ /2../
        # Successfully handed submission over to tool
        @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}", 'Success')
      else
        @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}: #{res.body}", 'Error')
        record_fail!
      end
    end

  rescue StandardError => e
    Rails.logger.error "Error in SendSubmissionJob: #{e.class} #{e.message}"
    unless @submission.nil? || @marking_tool.nil?
      @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
    end
    record_fail!
    Rails.logger.error "Error backtrace was: #{e.backtrace}"
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
    if @submission
      @submission.log('Recording failure of submission', 'Debug')
      @submission.failed = true
      @submission.save!
    else
      Rails.logger.error 'Failed to record failure of submission.'
    end
  end
end
