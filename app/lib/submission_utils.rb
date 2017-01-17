require 'zip'

class SubmissionUtils
  require_relative '../lib/git_utils'

  class << self
    def unzip!(submission)
      file_blacklist = Regexp.union(
        [
          %r{(.*\/)?\.git(\/.*)?}, # i.e. **/.git/* possibly with nothing at the end
          %r{(.*\/)?\.DS_Store(\/.*)?}, # i.e. **/.DS_Store/* possibly with nothing at the end
          %r{(.*\/)?\.gitignore}, # i.e. **/.gitignore
          %r{(.*\/)?\.gitmodules},
          %r{(.*\/)?__MACOSX(\/.*)?}
        ]
      )
      output_path = Rails.root.join('var', 'submissions', 'code', submission.id.to_s)
      Dir.mkdir output_path unless File.exist? output_path
      Zip::File.open(Rails.root.join('var', 'submissions', 'uploads', "#{submission.user.id}_#{submission.id}.zip")) do |zip_file|
        zip_file.each do |entry|
          if file_blacklist.match(entry.name)
            submission.log("Ignored #{entry.name} because of blacklisting", 'Debug')
          else
            entry_name = output_path.join(entry.name)
            # Ensure the target directory exists even for zip files which do not contain them as separate items
            FileUtils.mkdir_p File.dirname(entry_name)

            entry.extract(entry_name)
            submission.log("Extracted #{entry.name}", 'Debug')
          end
        end
      end
      submission.log('Extraction successful', 'Success')
      submission.extraction_error = false
      submission.save!

      return true
    rescue StandardError
      submission.log("Extraction failed: #{$ERROR_INFO.message}", 'Error')
      submission.report_extraction_error!
      return false
    end

    def notify_tools!(submission)
      # Assume this is all going to go well
      submission.failed = false
      submission.save!
      # Get workflow
      workflow = submission.workflow
      binding.pry
      # invoke each of the parentless nodes
      # submission.assignment.marking_tools.each do |mt|
      #   begin
      #     SendSubmissionJob.perform_later submission.id, mt.id
      #   rescue => e
      #     submission.log("Error trying to submit to #{mt.name}: #{e.class} #{e.message}", 'Error')
      #     submission.failed = true
      #     submission.save!
      #   end
      # end
    end

    def remark!(submission, user, flash)
      if submission.mark_override
        submission.log("Request to remark by user #{user.name} refused as mark has been manually overridden.", 'Warning')
        flash[:warning] = 'Mark manually overridden so no remarking initiated.'
        return false
      end

      # Really, in this case we should reprocess :-)
      if submission.failed_submission?
        flash[:error] = 'Submission has a failure state, needs reprocessing.'
        return false
      end

      submission.log("Submitting for remarking on behalf of #{user.name}.", 'Info')

      # Reset existing marks, if any
      submission.transaction do
        unless submission.pending?
          submission.log("Resetting overall mark of #{submission.mark}", 'Info')
          submission.mark = nil
          submission.save!
        end

        submission.intermediate_marks.each do |im|
          next if im.pending?
          mktool_name = submission.assignment.marking_tool_contexts.find_by(marking_tool_id: im.marking_tool_id).marking_tool.name
          submission.log("Resetting mark of #{im.mark} for #{mktool_name}", 'Info')
          im.mark = nil
          im.save!
        end

        submission.feedback_items.destroy_all.each do |fi|
          submission.log("Removing feedback from #{fi.marking_tool.name}. Feedback was #{fi.body}", 'Info')
        end
      end

      # resubmit!
      return re_notify_tools!(submission, user, flash)
    rescue StandardError => e
      Rails.logger.error { "Error remarking: #{e.inspect}." }
      submission.log("Error remarking: #{e.inspect}.", 'Error')
      return false
    end

    def resubmit!(submission, user, flash)
      if submission.git_success && submission.failed
        return re_notify_tools!(submission, user, flash)
      else
        if submission.extraction_error
          # Need to first unzip the submission
          submission.log("Reattempting to unzip submission files on behalf of #{user.name}.")
          unless unzip!(submission)
            flash[:warning] = 'ZIP extraction still failing, there may be an issue with the ZIP file. Check submission log for details.'
            return false
          end
        end

        return re_git!(submission, user, flash)
      end

      # We didn't know what to do with this submission, so let caller know this is still failed
      false
    end

    def re_notify_tools!(submission, user, flash)
      submission.log("Resending submission to all marking tools at request of #{user.name}.")

      notify_tools!(submission)

      flash[:warning] = 'Resending still caused failures. Check submission log for details.' if submission.failed?

      !submission.failed?
    end

    def re_git!(submission, user, flash)
      submission.log("Reattempting to store submission files on Git on behalf of #{user.name}.")

      push_and_notify_tools!(submission, flash)

      flash[:warning] = 'Failed to store submission in git again.' unless submission.git_success

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

    # Check if the given submission (which must be saved and not sent to Git yet) contains any files
    def empty?(submission)
      Dir.glob(File.join(GitUtils.gen_repo_path(submission), '**', '*')).reject { |fname| File.directory?(fname) }.empty?
    end
  end
end
