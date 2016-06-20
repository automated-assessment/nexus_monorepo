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

      setup_local_repository!(submission)
    end

    def setup_local_repository!(submission)
      submission.log!('=== Git ===')
      repo_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")

      submission.log!("Using dir: #{repo_path}")
      submission.log!('Initialising git repo...')
      repo = Git.init(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')
      submission.log!('Committing files...')
      repo.add(all: true)
      repo.commit('Submission made via Nexus')
      submission.log!("Commit SHA: #{repo.log[0].sha}")
      submission.commithash = repo.log[0].sha.to_s
      submission.save!

      setup_remote_repository!(submission)
    end

    def setup_remote_repository!(submission)
      submission.log!('=== Remote Git ===')
      submission.log!('Creating remote repo...')
      repo_name = "submissions-#{submission.assignment.id}-#{submission.id}"
      repo_desc = "Automatically created on #{DateTime.now.utc} by Nexus after submission \##{submission.id} made for assignment \##{submission.assignment.id} by user \##{submission.user.id} (#{submission.user.full_name})"
      res = Octokit.create_repository(repo_name,
                                      organization: 'ppa-dev',
                                      private: true,
                                      has_issues: false,
                                      has_wiki: false,
                                      description: repo_desc)
      submission.log!("Repo created at: #{res.html_url}")
      submission.repourl = res.clone_url
      submission.save!

      push_submission_to_github!(submission)
    end

    def push_submission_to_github!(submission)
      repo_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
      repo = Git.init(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')

      repo.add_remote('origin', submission.repourl)
      repo.push

      notify_tools!(submission)
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
