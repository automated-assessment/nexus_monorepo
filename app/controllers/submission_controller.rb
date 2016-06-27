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
    return unless allowed_to_submit
  end

  def create_zip
    @submission = Submission.new(submission_params)
    @submission.user = current_user
    return unless allowed_to_submit

    @submission.studentrepo = false

    uploaded_file = params[:submission][:code]

    if uploaded_file.content_type != 'application/zip'
      redirect_to '/422'
      return
    end

    @submission.original_filename = uploaded_file.original_filename
    @submission.save!

    File.open(Rails.root.join('var', 'submissions', 'uploads', save_file_name(@submission)), 'wb') do |file|
      file.write(uploaded_file.read)
      @submission.saved_filename = save_file_name(@submission)
      @submission.save!
      @submission.log("Saved submission as #{save_file_name(@submission)} (original filename #{uploaded_file.original_filename})")
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
    return unless allowed_to_submit

    @submission.studentrepo = true
    @submission.save!

    SubmissionUtils.notify_tools!(@submission)

    redirect_to action: 'show', id: @submission.id
  end

  private

  def allowed_to_submit
    if user_can_submit_to(@submission.assignment)
      return true
    else
      redirect_to(@submission.assignment, flash: { warning: 'You have reached the maximum amount of attempts for this assignment.' })
      return false
    end
  end

  def save_file_name(submission)
    "#{submission.user.id}_#{submission.id}.zip"
  end

  def submission_params
    params.require(:submission).permit(:assignment_id, :repourl, :gitbranch, :commithash)
  end
end
