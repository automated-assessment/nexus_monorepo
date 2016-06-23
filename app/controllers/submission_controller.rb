class SubmissionController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/submission_utils'
  require_relative '../lib/git_utils'

  before_action :authenticate_user!, except: [:report_mark]

  def show
    @submission = Submission.find(params[:id])
  end

  def new
    @submission = Submission.new
    @submission.assignment = Assignment.find(params[:aid])
  end

  def create_zip
    @submission = Submission.new(submission_params)
    @submission.user = current_user
    @submission.studentrepo = false

    uploaded_file = params[:submission][:code]

    if uploaded_file.content_type != 'application/zip'
      redirect_to '/422'
      return
    end

    @submission.original_filename = uploaded_file.original_filename
    @submission.save!

    @submission.open_log!

    File.open(Rails.root.join('var', 'submissions', 'uploads', save_file_name(@submission)), 'wb') do |file|
      file.write(uploaded_file.read)
      @submission.saved_filename = save_file_name(@submission)
      @submission.save!
      @submission.log!('=== Storage ===')
      @submission.log!("Uploaded file successfully saved as #{save_file_name(@submission)} (original filename #{uploaded_file.original_filename})")
    end

    SubmissionUtils.unzip!(@submission)

    if Submission.where(user: @submission.user).where(repourl: @submission.assignment.repourl).empty?
      GitUtils.first_time_push!(@submission)
    else
      GitUtils.subsequent_push!(@submission)
    end

    SubmissionUtils.notify_tools!(@submission)

    redirect_to action: 'show', id: @submission.id
  end

  def create_git
    @submission = Submission.new(submission_params)
    @submission.user = current_user
    @submission.studentrepo = true
    @submission.save!
    @submission.open_log!

    SubmissionUtils.notify_tools!(@submission)

    redirect_to action: 'show', id: @submission.id
  end

  private

  def save_file_name(submission)
    "#{submission.user.id}_#{submission.id}.zip"
  end

  def submission_params
    params.require(:submission).permit(:assignment_id, :repourl, :gitbranch, :commithash)
  end
end
