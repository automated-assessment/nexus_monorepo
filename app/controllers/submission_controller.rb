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
      redirect_to(error_url '401')
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

    unless zip_file?(uploaded_file)
      logger.info "Rejecting supposed ZIP upload: #{uploaded_file.original_filename} of MIME type #{uploaded_file.content_type}"
      redirect_to(error_url '422')
      return
    end

    @submission.original_filename = uploaded_file.original_filename

    # Need to save the submission here so that save_file_name has access to its id
    # But if doing so, need to delete the submission again if copying the upload file goes wrong
    @submission.save!

    begin
      File.open(Rails.root.join('var', 'submissions', 'uploads', save_file_name(@submission)), 'wb') do |file|
        file.write(uploaded_file.read)
        @submission.saved_filename = save_file_name(@submission)
        # From here, we will be able to recover the submission (assuming there is no inherent issue with the zip file)
        @submission.save!
        @submission.log("Saved submission as #{save_file_name(@submission)} (original filename #{uploaded_file.original_filename})")
      end

    rescue StandardError => e
      # At this point, we need to remove the submission if anything goes wrong because we won't be able to recover yet
      logger.error "Error copying uploaded zip file for #{current_user.name}: #{e.inspect}."

      @submission.destroy
      redirect_to(error_url '500')
      return
    end

    if (SubmissionUtils.unzip!(@submission))
      unless (SubmissionUtils.empty?(@submission))
        SubmissionUtils.push_and_notify_tools!(@submission, flash)
      else
        logger.info "Rejecting empty submission #{@submission.id} from user #{current_user.name}."
        @submission.destroy
        flash[:error] = "You have made an empty submission. Please ensure there is at least one file that is not a directory inside your ZIP file."
        redirect_to(error_url '422')
        return
      end
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

    # Need to save submission here so we can have an ID
    # If things go wrong before the safe point, we need to destroy it again.
    @submission.save!

    submitted_files = params[:data]
    unless submitted_files.nil?
        begin
        output_path = Rails.root.join('var', 'submissions', 'code', "#{@submission.id}")
        Dir.mkdir output_path unless File.exist? output_path

        submitted_files.each do |file|
          filename = file[:filename]
          code = file[:code]

          # Keep track on the console in case we will end up destroying the submission
          logger.debug {"Creating file '#{filename}' from Web IDE for submission #{@submission.id} in #{output_path}"}
          @submission.log("Creating file '#{filename}' from Web IDE in #{output_path}", 'Debug')

          File.open(File.join(output_path, filename), 'w') do |f|
            f.puts code
          end
        end

      rescue StandardError => e
        # At this point, we need to remove the submission if anything goes wrong because we won't be able to recover yet
        logger.error "Error copying files from Web IDE for #{current_user.name}: #{e.inspect}."

        @submission.destroy
        render json: { data: 'Error!', message: "There was an internal server error processing your uploaded files. Your submission could not be accepted at this time. Please contact your course leader." },
               status: 500, content_type: 'text/json'
        return
      end
    end
    # We can recover from here onward, so it is safe to keep the submission
    unless ((submitted_files.nil?) || (SubmissionUtils.empty?(@submission)))
      SubmissionUtils.push_and_notify_tools!(@submission, flash)
    else
      logger.info "Rejecting empty submission #{@submission.id} from user #{current_user.name}."
      @submission.destroy
      render json: { data: 'Error!', message: "You have attempted to make an empty submission. Please include at least one file in your submission." }, status: 422, content_type: 'text/json'
      return
    end

    render json: { data: 'OK!', redirect: submission_url(id: @submission.id) }, status: 200, content_type: 'text/json'
  rescue StandardError => e
    render json: { data: 'Error!', message: "An internal server error has occurred when processing your submission. Please contact the course leader." }, status: 500, content_type: 'text/json'

    @submission.log("Error creating submission for user #{current_user.name}: #{e.class} #{e.message}", "Error") if (@submission.persisted?)
    logger.error "Error creating submission for user #{current_user.name}: #{e.class} #{e.message}"
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

  def zip_file?(file)
    (file.content_type == 'application/zip') ||
    (file.content_type == 'multipart/x-zip') ||
    (file.content_type == 'application/x-zip-compressed') ||
    (file.original_filename.end_with? ".zip" && (file.content_type == 'application/x-compressed'))
  end

  # Create a new submission from URL parameters, set its studentrepo field as
  # per the param, and return whether the submission would be acceptable.
  def create_submission(studentrepo)
    @submission = Submission.new(submission_params)
    @submission.user = current_user
    @submission.studentrepo = studentrepo
    # By default, assume things will go wrong
    # TODO As a result of this, submissions might briefly show up in the fail queue even if they aren't failed, especially when we decide to switch to worker-based gitting
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
