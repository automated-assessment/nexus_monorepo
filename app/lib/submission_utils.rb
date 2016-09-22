require 'zip'

class SubmissionUtils
  require_relative '../lib/git_utils'

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
      # Assume this is all going to go well
      submission.failed = false
      submission.save!

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

    def resubmit!(submission, user, flash)
      if submission.git_success
        if submission.failed
          return re_notify_tools!(submission, user, flash)
        end
      else
        return re_git!(submission, user, flash)
      end

      # We didn't know what to do with this submission, so let caller know this is still failed
      false
    end

    def re_notify_tools!(submission, user, flash)
      submission.log("Resending submission to all marking tools at request of #{user.name}.")

      notify_tools!(submission)

      flash[:warning] = "Resending still caused failures." if submission.failed?

      !submission.failed?
    end

    def re_git!(submission, user, flash)
      # TODO May have to unzip files first for zip submissions

      submission.log("Reattempting to store submission files on Git on behalf of #{user.name}.")

      push_and_notify_tools!(submission, flash)

      flash[:warning] = "Failed to store submission in git again." unless submission.git_success

      submission.git_success
    end

    def push_and_notify_tools!(submission, flash)
      GitUtils.push!(submission)

      auto_enrol_if_needed!(submission, flash)

      SubmissionUtils.notify_tools!(submission) if submission.git_success
    end

    def auto_enrol_if_needed!(submission, flash)
      flash[:info] = "We've auto-enrolled you into course #{submission.assignment.course.id} to which this assignment belongs." if submission.ensure_enrolled!
    end
  end
end
