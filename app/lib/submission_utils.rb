require 'zip'

class SubmissionUtils
  #require_relative "submission_msg"

  class << self

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
          SendSubmissionJob.perform_later submission.id, mt.id
        rescue => e
          submission.log("Error trying to submit to #{mt.name}: #{e.class} #{e.message}", "Error")
          submission.failed = true
          submission.save!
        end
      end
    end

    def resubmit!(submission, user)
      if submission.git_success
        if submission.failed
          return re_notify_tools!(submission, user)
        end
      else
        return re_git!(submission, user)
      end

      # We didn't know what to do with this submission, so let caller know this is still failed
      false
    end

    def re_notify_tools!(submission, user)
      # Pretend it's no longer a failed submission
      submission.failed = false
      submission.save!

      submission.log("Resending submission to all marking tools at request of #{user.name}.")

      SubmissionUtils.notify_tools!(submission)

      !submission.failed?
    end

    def re_git!(submission, user)
      # TODO Implementation missing
      false
    end
  end
end
