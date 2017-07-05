require 'net/http'
require 'uri'
require 'json'

class SendSubmissionJob < ActiveJob::Base
  queue_as Rails.configuration.rabbit_mq_qname

  rescue_from(StandardError) do |e|
    Rails.logger.error "Encountered exception when trying to run submission job: #{e.inspect}."
  end

  def perform(submission_id, marking_tool)
    Rails.logger.debug 'Actually inside SendSubmissionJob.perform.'
    @submission = Submission.find(submission_id)

    uri = URI.parse(marking_tool.url)
    @submission.log("Notifying #{marking_tool.name} at #{uri}...", 'Debug')
    Net::HTTP.start(uri.host, uri.port) do |http|
      req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

      req.body = build_json_payload(marking_tool.uid)
      res = http.request(req)

      if res.code =~ /2../
        # Successfully handed submission over to tool
        @submission.log("Received #{res.code} #{res.message} from #{marking_tool.name}", 'Success')
      else
        @submission.log("Received #{res.code} #{res.message} from #{marking_tool.name}: #{res.body}", 'Error')
        record_fail!
      end
    end

  rescue StandardError => e
    Rails.logger.error "Error in SendSubmissionJob: #{e.class} #{e.message}"
    unless @submission.nil? || marking_tool.nil?
      @submission.log("Error notifying #{marking_tool.name}: #{e.class} #{e.message}", 'Error')
    end
    record_fail!
    Rails.logger.error "Error backtrace was: #{e.backtrace}"
  end

  private

  def build_json_payload(marking_tool_uid)
    nextservices = []
    if @submission.assignment.dataflow[marking_tool_uid]
      nextservices = @submission.assignment.dataflow[marking_tool_uid]
    end
    payload = {
      student: @submission.user.name,
      studentuid: @submission.user.id,
      studentemail: @submission.user.email, # This will only have a value for a user registered via GHE
      sid: @submission.id,
      aid: @submission.assignment.id,
      is_unique: @submission.assignment.is_unique,
      description_string: @submission.assignment.description_string,
      cloneurl: @submission.augmented_clone_url,
      branch: @submission.gitbranch,
      sha: @submission.commithash,
      nextservices: nextservices
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
