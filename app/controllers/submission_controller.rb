class SubmissionController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/submission_utils'
  require_relative '../lib/git_utils'

  before_action :authenticate_user!, except: [:report_mark]

  def show
    @submission = Submission.find(params[:id])
    # Only allow original submitter or admin users to see a submission
    unless (is_admin? || (is_user? @submission.user))
      @submission.log("Illegal attempt to access submission by user #{current_user.name} when submitting user was #{@submission.user.name}. Refusing access.", "Warning")
      redirect_to '/401'
      return
    end

    flash.now[:error] = "There was a problem completely uploading your submission. Your files are likely still on the system and can be recovered. Please contact your course leader and tell them your submission id, which is #{@submission.id}." unless @submission.git_success
  end

  def new
    @submission = Submission.new
    @submission.failed = false
    @submission.assignment = Assignment.find(params[:aid])
    return unless allowed_to_submit

    if @submission.assignment.allow_git
      if current_user.githubtoken
        @client = Octokit::Client.new(access_token: current_user.githubtoken)
        @repo_list = []
        @client.repos(current_user.ghe_login, sort: 'updated', per_page: '100').each do |r|
          @repo_list << [r.full_name, r.clone_url]
        end
      else
        flash.now[:warning] = 'Git submission disabled as there is no GitHub token stored for your user'
        @submission.assignment.allow_git = false
      end
    end
  end

  def create_zip
    return unless create_submission(false)

    uploaded_file = params[:submission][:code]

    if uploaded_file.content_type != 'application/zip'
      redirect_to '/422'
      return
    end

    @submission.original_filename = uploaded_file.original_filename

    File.open(Rails.root.join('var', 'submissions', 'uploads', save_file_name(@submission)), 'wb') do |file|
      file.write(uploaded_file.read)
      @submission.saved_filename = save_file_name(@submission)
      # From here, we will be able to recover the submission (assuming there is no inherent issue with the zip file)
      # TODO: Still need to implement recovery from extraction issues
      @submission.save!
      @submission.log("Saved submission as #{save_file_name(@submission)} (original filename #{uploaded_file.original_filename})")
    end

    if (SubmissionUtils.unzip!(@submission))
      SubmissionUtils.push_and_notify_tools!(@submission, flash)
    end

    redirect_to action: 'show', id: @submission.id
  end

  def create_git
    return unless create_submission(true)

    unless (GitUtils.has_valid_repo?(@submission))
      redirect_to new_submission_path(aid: @submission.assignment.id)
      flash[:error] = "Branch or SHA don't exist in Git repository indicated. Please make sure you provide the correct information."
      return
    end

    # Record the fact that we have a safe git copy
    @submission.git_success = true
    @submission.save!

    SubmissionUtils.auto_enrol_if_needed!(@submission, flash)

    SubmissionUtils.notify_tools!(@submission) if @submission.git_success

    redirect_to action: 'show', id: @submission.id
  end

  def create_ide
    return unless create_submission(false)

    submitted_files = params[:data]

    output_path = Rails.root.join('var', 'submissions', 'code', "#{@submission.id}")
    Dir.mkdir output_path unless File.exist? output_path

    submitted_files.each do |file|
      filename = file[:filename]
      code = file[:code]

      # Cannot log to submission yet, so just keep track on the console (which will make its way into a proper log)
      puts "Creating file '#{filename}' from Web IDE for submission #{@submission.id}"

      File.open(File.join(output_path, filename), 'w') do |f|
        f.puts code
      end
    end

    # We can recover from here onward, so it is safe to save the submission
    @submission.save!

    SubmissionUtils.push_and_notify_tools!(@submission, flash)

    render json: { data: 'OK!', redirect: submission_url(id: @submission.id) }, status: 200, content_type: 'text/json'
  rescue StandardError => e
    render json: { data: 'Error!' }, status: 500, content_type: 'text/json'
    @submission.log("Error creating submission: #{e.class} #{e.message}", "Error")
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

  def list_failed
    return unless authenticate_admin!
    @submissions = Submission.failed_submissions
  end

  def resend
    return unless authenticate_admin!
    @submission = Submission.find(params[:id])

    if (SubmissionUtils.resubmit!(@submission, current_user, flash)) then
      redirect_to action: 'show', id: @submission.id
    else
      redirect_to action: 'list_failed'
    end
  end

  def resend_all
    return unless authenticate_admin!

    submissions = Submission.failed_submissions
    submissions.each do |sub|
      SubmissionUtils.resubmit!(sub, current_user, flash)
    end

    redirect_to action: 'list_failed'
  end

  private

  # Create a new submission from URL parameters, set its studentrepo field as
  # per the param, and return whether the submission would be acceptable.
  def create_submission(studentrepo)
    @submission = Submission.new(submission_params)
    @submission.user = current_user
    @submission.studentrepo = studentrepo
    # By default, assume things will go wrong
    @submission.git_success = false
    @submission.failed = true

    return allowed_to_submit
  end

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
