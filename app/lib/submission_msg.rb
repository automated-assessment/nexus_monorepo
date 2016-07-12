require 'bunny'
require 'net/http'
require 'uri'

# FIXME This isn't working as we cannot consume from Rails directly. Need to send this to some other thread. Consider using ActiveJob instead.
# See http://guides.rubyonrails.org/active_job_basics.html for details

class SubmissionMsg

  QUEUE_NAME = Rails.configuration.rabbit_mq_qname

  def initialize (submission, marking_tool, retry_cnt=0)
    submission.log("Creating submission message for sending to #{marking_tool.name} at retry count #{retry_cnt}")
    @submission = submission
    @marking_tool = marking_tool
    @retry_cnt = retry_cnt
    @processed = false
    @failed = false
    submission.log("Successfully created submission message for sending to #{marking_tool.name} at retry count #{retry_cnt}")
  end

  # Send this message to the queue to be processed
  def submit!
    @submission.log("Submitting to queue for marking with #{@marking_tool.name}")

    ch = SubmissionMsg.mq_connection.create_channel
    q  = ch.queue(QUEUE_NAME, :durable => true, :auto_delete => false)
    x  = ch.default_exchange

    x.publish(self.to_json, :routing_key => q.name)

    ch.close

    @submission.log("Submitted to queue for marking with #{@marking_tool.name}")
  rescue StandardError => e
    @submission.log("Error submitting to queue for marking with #{@marking_tool.name}: #{e.class} #{e.message}", "Error")
  end

  def process!
    return if @processed
    @processed = true
    # Assume we will fail
    @failed = true

    uri = URI.parse(@marking_tool.url)
    @submission.log("Notifying #{@marking_tool.name} at #{uri}...")

    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

    req.body = self.build_json_payload

    res = http.request(req)

    if ((res.code >= 200) && (res.code < 300)) then
      # Successfully handed submission over to tool
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}")
      @failed = false
    else
      @submission.log("Received #{res.code} #{res.message} from #{@marking_tool.name}", "Error")
    end

  rescue Net::ReadTimeout => e
    @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
  rescue SocketError => e
    @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
  rescue StandardError => e
    @submission.log("Error notifying #{@marking_tool.name}: #{e.class} #{e.message}", 'Error')
  end

  def retry_if_needed!
    if (@processed && @failed) then
      if (@retry_cnt < Rails.configuration.max_submission_retries) then
        # TODO Consider simply rejecting the message instead (and relying on implicit resubmission)
        self.create_retried_msg.submit!
      else
        # TODO Send email or use other form of active notification
        @submission.log("Exceeded number of retries when trying to send to #{@marking_tool.name}", "Error")
      end
    end
  end

  def create_retried_msg
    SubmissionMsg.new(@submission, @marking_tool, @retry_cnt + 1)
  end

  def to_json
    {
      sid: @submission.id,
      mt_id: @marking_tool.uid,
      retry_cnt: @retry_cnt
    }.to_json
  end

  def self.from_json(json_string)
    mp = JSON.parse(json_string)
    SubmissionMsg.new(Submission.find(mp["sid"]), MarkingTool.find(mp["mt_id"]), mp["retry_cnt"])
  end

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

  # Get a connection to use to send SubmissionMsg instances through.
  # If needed, first initialise the bunny framework and connect to rabbitmq
  def self.mq_connection
    unless (@conn) then
      # Create the connection if we haven't got one yet.
      @conn = Bunny.new(:host => Rails.configuration.rabbit_mq_host,
                         :port => Rails.configuration.rabbit_mq_port)
      @conn.start

      # TODO: When do we close the connection?

      initialise_consumers!(@conn)
    end

    @conn
  end

  def self.initialise_consumers!(conn)
    (1..Rails.configuration.number_consumers).each do
      initialise_consumer!(conn)
    end
  end

  def self.initialise_consumer!(conn)
    ch = conn.create_channel
    q  = ch.queue(QUEUE_NAME, :durable => true, :auto_delete => false)
    x  = ch.default_exchange

    q.subscribe(:manual_ack => true) do |delivery_info, metadata, payload|
      puts "Starting to handle submission message"
      msg = SubmissionMessage.from_json(payload)

      msg.process!

      msg.retry_if_needed!

      ch.ack(delivery_info.delivery_tag)
    end

    ch.close
  end
end
