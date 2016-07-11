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

    if current_user.githubtoken
      @client = Octokit::Client.new(access_token: current_user.githubtoken)
      @repo_list = []
      @client.repos(nil, sort: 'updated', per_page: '100').each do |r|
        @repo_list << [r.full_name, r.clone_url]
      end
    else
      flash[:warning] = 'Git submission disabled as there is no GitHub token stored for your user'
      @submission.assignment.allow_git = false
    end
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

    if Submission.where(user: @submission.user, repourl: @submission.assignment.repourl).empty?
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

  def create_ide
    @assignment = Assignment.find(params[:aid])
    @submission = Submission.new(assignment: @assignment)
    @submission.user = current_user
    return unless allowed_to_submit

    @submission.studentrepo = false
    @submission.save!

    submitted_files = params[:data]

    output_path = Rails.root.join('var', 'submissions', 'code', "#{@submission.id}")
    Dir.mkdir output_path unless File.exist? output_path

    submitted_files.each do |file|
      filename = file[:filename]
      code = file[:code]

      @submission.log("Creating file '#{filename}' from Web IDE...")

      File.open(File.join(output_path, filename), 'w') do |f|
        f.puts code
      end
    end

    if Submission.where(user: @submission.user).where(repourl: @submission.assignment.repourl).empty?
      GitUtils.first_time_push!(@submission)
    else
      GitUtils.subsequent_push!(@submission)
    end

    SubmissionUtils.notify_tools!(@submission)

    render json: { data: 'OK!', redirect: submission_url(id: @submission.id) }, status: 200, content_type: 'text/json'
  rescue StandardError => e
    render json: { data: 'Error!' }, status: 500, content_type: 'text/json'
    @submission.log("Error creating submission: #{e.class} #{e.message}")
  end

  def edit_mark
    return unless authenticate_admin!
    @submission = Submission.find(params[:id])
  end

  def override
    return unless authenticate_admin!
    @submission = Submission.find(params[:id])
    if @submission.update_attributes(submission_override_params)
      flash[:success] = 'Mark overridden successfully'
      redirect_to @submission
    else
      render 'edit_mark'
    end
    @submission.mark_override = true
    @submission.save!

    @submission.log("Mark overridden to #{@submission.mark}% by #{current_user.name}")
  end

  private

  def allowed_to_submit
    within_max_attempts && on_time
  end

  def within_max_attempts
    if @submission.assignment.max_attempts == 0 || (Submission.where(assignment: @submission.assignment, user: current_user).size < @submission.assignment.max_attempts)
      return true
    else
      redirect_to(@submission.assignment, flash: { danger: 'You have reached the maximum amount of attempts for this assignment.' })
      return false
    end
  end

  def on_time
    # check for any extensions
    @de = DeadlineExtension.find_by(assignment: @submission.assignment, user: current_user)
    if @de.present?
      if DateTime.now.utc < @de.extendeddeadline
        return true
      else
        redirect_to(@submission.assignment, flash: { danger: 'Your deadline extension for this assignment has passed.' })
        return false
      end
    end

    # check if before regular deadline
    return true if DateTime.now.utc < @submission.assignment.deadline

    # check if late submissions are allowed and we are still within the late deadline
    if @submission.assignment.allow_late
      if DateTime.now.utc < @submission.assignment.latedeadline
        return true
      else
        redirect_to(@submission.assignment, flash: { danger: 'The deadline for late submissions for this assignment has passed.' })
        return false
      end
    else
      redirect_to(@submission.assignment, flash: { danger: 'The deadline for this assignment has passed and it does not allow late submissions.' })
      return false
    end
  end

  def save_file_name(submission)
    "#{submission.user.id}_#{submission.id}.zip"
  end

  def submission_params
    params.require(:submission).permit(:assignment_id, :repourl, :gitbranch, :commithash)
  end

  def submission_override_params
    params.require(:submission).permit(:mark)
  end
end
