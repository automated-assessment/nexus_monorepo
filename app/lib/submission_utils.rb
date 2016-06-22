require 'zip'
require 'net/http'
require 'uri'

class SubmissionUtils
  class << self
    def build_url_params(submission)
      params = {
        sid: submission.id,
        aid: submission.assignment.id,
        repo: submission.repourl,
        branch: submission.gitbranch,
        sha: submission.commithash
      }
      params.each { |k, v| params[k] = URI.escape(v.to_s) }
      params
    end

    def unzip!(submission)
      submission.log!('=== Extraction ===')
      begin
        submission.log!("Attempting to unzip submission from file #{submission.user.id}_#{submission.id}.zip...")
        output_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
        Dir.mkdir output_path unless File.exist? output_path
        Zip::File.open(Rails.root.join('var', 'submissions', 'uploads', "#{submission.user.id}_#{submission.id}.zip")) do |zip_file|
          zip_file.each do |entry|
            submission.log!("  - #{entry.name}", 'Debug')
            entry.extract(output_path.join("#{entry.name}"))
          end
        end
        submission.log!('Extraction successful!')

      rescue StandardError
        Rails.logger.debug $ERROR_INFO.message.to_s
        Rails.logger.debug $ERROR_INFO.backtrace.to_s
        submission.log!('Could not extract submission!', 'Error')
        submission.report_extraction_error!
      end
    end

    def notify_tools!(submission)
      submission.log!('=== Notifications ===')
      submission.assignment.marking_tools.each do |mt|
        begin
          submission.log!("Notifying #{mt.name}...")
          uri = URI.parse(mt.url % build_url_params(submission))
          submission.log!("  - Using URL #{uri}", 'Debug')

          http = Net::HTTP.new(uri.host, uri.port)
          req = Net::HTTP::Post.new(uri.request_uri)

          res = http.request(req)

          submission.log!("  - Received: #{res.code} #{res.message}")
        rescue Net::ReadTimeout
          submission.log!('  - Net::ReadTimeout :(', 'Error')
        rescue SocketError => se
          submission.log!('  - SocketError :(', 'Error')
          submission.log!("    - #{se.message}", 'Error')
        rescue StandardError => e
          submission.log!("  - #{e.class} Error:", 'Error')
          submission.log!("    - #{e.message}", 'Error')
        end
      end
      submission.log!('Tools notified!')
      submission.log!('=== Marks/Feedback ===')
    end
  end
end
