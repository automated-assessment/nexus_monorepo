require 'zip'
require 'net/http'
require 'uri'

class SubmissionUtils
  class << self
    def augment_clone_url(submission)
      url = submission.repourl
      if submission.studentrepo
        auth = submission.user.githubtoken
        url.insert(url.index('//') + 2, "#{auth}@")
      else
        auth = "#{Rails.configuration.ghe_user}:#{Rails.configuration.ghe_password}"
        url.insert(url.index('//') + 2, "#{auth}@")
      end
      url
    end

    def build_json_payload(submission)
      payload = {
        sid: submission.id,
        aid: submission.assignment.id,
        cloneurl: augment_clone_url(submission),
        branch: submission.gitbranch,
        sha: submission.commithash
      }
      payload.to_json
    end

    def unzip!(submission)
      output_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
      Dir.mkdir output_path unless File.exist? output_path
      Zip::File.open(Rails.root.join('var', 'submissions', 'uploads', "#{submission.user.id}_#{submission.id}.zip")) do |zip_file|
        zip_file.each do |entry|
          submission.log("Extracted #{entry.name}", 'Debug')
          entry.extract(output_path.join("#{entry.name}"))
        end
      end
      submission.log('Extraction successful', 'Success')
    rescue StandardError
      submission.log("Extraction failed: #{$ERROR_INFO.message}", 'Error')
      submission.report_extraction_error!
    end

    def notify_tools!(submission)
      submission.assignment.marking_tools.each do |mt|
        begin
          submission.log("Notifying #{mt.name} at #{uri}...")
          uri = URI.parse(mt.url)

          http = Net::HTTP.new(uri.host, uri.port)
          req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

          req.body = build_json_payload(submission)

          res = http.request(req)

          submission.log("Received #{res.code} #{res.message} from #{mt.name}")
        rescue Net::ReadTimeout => e
          submission.log("Error notifying #{mt.name}: #{e.class} #{e.message}", 'Error')
        rescue SocketError => e
          submission.log("Error notifying #{mt.name}: #{e.class} #{e.message}", 'Error')
        rescue StandardError => e
          submission.log("Error notifying #{mt.name}: #{e.class} #{e.message}", 'Error')
        end
      end
    end
  end
end
