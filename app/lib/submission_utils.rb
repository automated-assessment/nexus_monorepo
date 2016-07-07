require 'zip'

class SubmissionUtils
  require_relative "submission_msg"

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
          SubmissionMsg.new(submission, mt).submit!
        rescue StandardError => e
          submission.log("Error trying to submit to #{mt.name}: #{e.class} #{e.message}", "Error")
        end
      end
    end
  end
end
