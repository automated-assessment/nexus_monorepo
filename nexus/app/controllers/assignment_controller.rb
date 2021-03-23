class AssignmentController < ApplicationController
  include ApplicationHelper
  require 'yaml'
  require 'net/http'
  require 'json'
  require 'zip'
  require_relative '../lib/git_utils'
  require_relative '../lib/workflow_utils'

  before_action :authenticate_user!, except: [:edit_from_git_json]
  before_action :authenticate_admin!, except: [
    :mine,
    :show,
    :show_deadline_extensions,
    :quick_config_confirm,
    :configure_tools,
    :new,
    :new_from_git,
    :create,
    :create_from_git,
    :edit,
    :edit_from_git,
    :edit_from_git_json,
    :github_actions,
    :show_github_actions,
    :update,
    :destroy,
    :export_submissions_data,
    :list_submissions,
    :list_ordered_submissions,
    :prepare_submission_repush,
    :submission_repush
  ]

  def mine
  end

  def show
    @assignment = return_assignment!
  end

  def show_deadline_extensions
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def quick_config_confirm
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def configure_tools
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      # augment template URLs with parameters
      params = {
        aid: @assignment.id,
        sid: current_user.id,
        isUnique: @assignment.is_unique
      }
      @tools_with_augmented_urls = []
      @assignment.marking_tools.configurable.each do |t|
        @tools_with_augmented_urls << { tool: t, augmented_url: t.config_url % params }
      end
    end
  end

  def new
    @assignment = Assignment.new
    course = Course.find_by(id: params[:cid])

    if course
      return unless authenticate_can_administrate!(course)

      @assignment.course = course
      @assignment.marking_tool_contexts.build
      @assignment.active_services = {}

      # Set default values
      @assignment.start = DateTime.now
      @assignment.deadline = (DateTime.now.utc + 1.week)
      @assignment.latedeadline = (DateTime.now.utc + 8.days)

      @assignment.max_attempts = 0

      @assignment.allow_late = true
      @assignment.is_unique = false
      @assignment.late_cap = 40

      @assignment.allow_zip = true
      @assignment.allow_git = true
      @assignment.allow_ide = true
    else
      flash[:error] = 'Course with id ' + params[:cid] + ' does not exist'
      render status: 404
    end
  end

  def create
    @assignment = Assignment.new(assignment_params)
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      unless @assignment.save
        error_flash_and_cleanup!(@assignment.errors.full_messages[0])
        return
      end

      unless GitUtils.setup_remote_assignment_repo!(@assignment)
        error_flash_and_cleanup!('Error creating repository for assignment!')
        return
      end
      begin
        marking_tool_contexts = params[:assignment][:marking_tool_contexts_attributes]
        active_services = params[:assignment][:active_services]
        @assignment.active_services = WorkflowUtils.construct_workflow(marking_tool_contexts, active_services)
        @assignment.dataflow = WorkflowUtils.construct_dataflow(@assignment.active_services)
        @assignment.save!
      rescue StandardError => e
        error_flash_and_cleanup!(e.message)
        return
      end

      if @assignment.marking_tools.configurable.any?
        redirect_to action: 'quick_config_confirm', id: @assignment.id
      else
        redirect_to action: 'show', id: @assignment.id
      end
    end
  end

  def create_from_git
    # Maybe here we need to perform some sort of validation on the url
    # Or possible find some form tag in rails to have it only allow to enter url
    # Or actually both?
    repo_url = params[:repository_url]
    course = Course.find_by(id: params[:cid])

    # Clone the repository to a temporary folder
    tmp_path = nil
    begin
      tmp_path = GitUtils.clone_tmp_assignment(repo_url)
    rescue StandardError => e
      flash[:error] = "Could not clone git repo: #{e.message}"
      redirect_to action: 'new_from_git', cid: course.id
      return
    end
    
    assignment_config = nil
    grader_config = nil
    begin
      assignment_config = GitUtils.get_assignment_config_from_path(tmp_path)
      grader_config = GitUtils.get_grader_config_from_path(tmp_path)
    rescue StandardError => e
      # Cleanup
      FileUtils.rm_rf(tmp_path, secure: true) if Dir.exist?(tmp_path)

      flash[:error] = "Repository does not contain assignment.yml or grader-config.yml"
      redirect_to action: 'new_from_git', cid: course.id
      return
    end
    
    formatted_config = GitUtils.convert_assignment_config_format(course.id, assignment_config, grader_config)

    @assignment = Assignment.new(formatted_config)
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)
      
      if @assignment.save
        @assignment.log("Assignment created from Git repository #{repo_url}", 'info')
      else
        error_flash_and_cleanup_from_git!(@assignment.errors.full_messages[0])
        return
      end
      
      unless GitUtils.setup_remote_assignment_repo!(@assignment)
        error_flash_and_cleanup_from_git!('Error creating repository for assignment!')
        return
      end
      
      begin
        marking_tool_contexts = formatted_config['marking_tool_contexts_attributes']
        active_services = formatted_config['active_services']
        @assignment.active_services = WorkflowUtils.construct_workflow(marking_tool_contexts, active_services)
        @assignment.dataflow = WorkflowUtils.construct_dataflow(@assignment.active_services)
        @assignment.save!
      rescue StandardError => e
        error_flash_and_cleanup_from_git!(e.message)
        return
      end
      
      # Move assignment repository from a temporary folder to a permanent folder.
      # This also essentially deletes the temporary directory
      GitUtils.move_tmp_assignment_repo(tmp_path, @assignment)
      
      # Configure graders
      begin
        configure_graders(grader_config, @assignment)
      rescue StandardError => e
        error_flash_and_cleanup_from_git!(e.message)
        return
      end

      flash[:success] = 'Assignment successfully created from git repository. You can now add GitHub actions to your repository by clicking "Show Assignment GitHub Actions"'
      redirect_to action: 'show', id: @assignment.id
    end
  end

  def configure_graders(grader_config, assignment)
    # Temporary, need to figure out where to put this, possibly have it in the db?
    grader_config_apis = {
      'javac' => 'http://javac-tool:5000/foo/configuration',
      'rng' => 'http://rng-tool:3000/foo/configuration',
      'conf' => 'http://config-tool:3000/foo/configuration',
      'iotool' => 'http://io-grader:5000/foo/configuration',
      'junit' => 'http://junit-grader:5000/foo/configuration'
      # 'cppiograder' => 'http://localhost:3008/foo/configuration',
      # 'cppcompilation' => 'http://localhost:3007/foo/configuration',
      # 'cppunit' => 'http://localhost:3015/foo/configuration'
    }

    grader_config.each { |grader|
      unless grader['configuration'].nil?
        begin
          uri = URI(grader_config_apis[grader['name']])
          http = Net::HTTP.new(uri.host, uri.port)
          req = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
          req.body = format_grader_config(@assignment, grader['configuration'])
          res = http.request(req)
          # Temporary commenting because graders return 'Cannot POST' even
          # though you actually can and they do get cofngiured
          # raise res.body unless res.code.to_i < 400
          assignment.log("Configured #{grader['name']} grader", 'info')
        rescue StandardError => e
          assignment.log("Failed to configure #{grader['name']} grader", 'error')
          raise "Failed to configure grader #{grader['name']}: #{e.message}"
          return
        end
      end
    }

    # Mark all graders as configured
    @assignment.marking_tool_contexts.each do |marking_tool|
      marking_tool.configured = true
      marking_tool.save!
    end
  end

  # Get the origin url and latest commit sha of the repo in which an assignment is defined
  def get_assignment_git_repo_url_and_sha(assignment)
    assignment_path = GitUtils.gen_assignment_path(assignment)
    g = Git.open(assignment_path, :log => Logger.new(STDOUT))
    return {
      'url' => g.remote('origin').url,
      'sha' => g.object('HEAD').sha
    }
  end

  # Grader configurations in a git repo can have special values: 'this' for
  # repository and 'latest' for sha. This function converts those special values
  # to what our program already takes - a git repo URL and a sha of the commit.
  def convert_grader_special_git_parameters(parameter, assignment)
    converted_parameter = {
      'branch' => parameter['branch']
    }

    if parameter['repository'] == 'this'
      repo_details = get_assignment_git_repo_url_and_sha(assignment)

      converted_parameter['repository'] = repo_details['url']

      if parameter['sha'] == 'latest'
        converted_parameter['sha'] = repo_details['sha']
      end
    else
      # Get sha of a specified repository that is not 'this'
      if parameter['sha'] == 'latest'
        converted_parameter['repository'] = parameter['repository']
        converted_parameter['sha'] = Git.ls_remote(parameter['repository'])['head'][:sha]
      end
    end
    return converted_parameter
  end

  # Returns true if the grader config parameter is of type 'git', false otherwise
  def grader_config_parameter_is_git(parameter)
    return parameter.is_a?(Hash) &&
      parameter.key?('repository') &&
      parameter.key?('branch') &&
      parameter.key?('sha')
  end

  # Returns true if the grader config parameter has special values, false
  # otherwise. This assumes that the parameter is of type 'git'
  def grader_config_git_parameter_has_special_values(parameter)
    return parameter['repository'] == 'this' || parameter['sha'] == 'latest'
  end

  # Receives a single grader configuration in the format that it is defined in
  # an assignment git repo. Formats it for a HTTP POST request which is going to
  # be sent to the configuration endpoint for a grader. This assumes that the
  # grader is configurable.
  def format_grader_config(assignment, grader_configuration)
    # Gets an array of parameters which are of type 'git' and have special values
    git_params = grader_configuration.select { |k, v|
      grader_config_parameter_is_git(v) &&
      grader_config_git_parameter_has_special_values(v)
    }

    # Convert special values of git parameters to values that graders accept
    git_params.each do |k, v|
      grader_configuration[k] = convert_grader_special_git_parameters(v, assignment)
    end

    return {
      'aid' => assignment.id,
      'config' => grader_configuration
    }.to_json
  end
  
  def edit_from_git_json
    @assignment = Assignment.find_by(id: params[:id])
    Rails.logger.info @assignment
    unless @assignment
      render json: {
        success: false,
        error: "Assignment #{params[:id]} does not exist"
      }.to_json, status: 200
      return
    end
    @assignment.log('Received update notification from GitHub Action', 'debug')
    edit_from_git_main(true, false, 'Assignment updated.')
  end

  def edit_from_git
    @assignment = return_assignment!
    if @assignment
      edit_from_git_main(false, false, 'Assignment updated.')
    end
  end

  def edit_from_git_main(json_response, disable_pull, success_message)
    # Allow usage of the edit_from_git_json endpoint without authentication,
    # but need to authenticate for edit_from_git endpoint
    unless json_response
      return unless authenticate_can_administrate!(@assignment.course)
    end

    unless disable_pull
      # Check whether the remote repository has a different sha from what we
      # have right now. Since the json update notification receiver endpoint
      # will not need any authentication, someone could just spam it and try to
      # DDOS in this way. This is here to prevent that - no update means that
      # this function will stop here. We leave the ability to do that manually
      # when the user is authenticated - maybe something went wrong and the user
      # needs to force-update the repo.
      if json_response
        repo_up_to_date = GitUtils.assignment_repo_up_to_date!(@assignment)
        if repo_up_to_date
          handle_edit_from_git_error(json_response, 'Assignment already up to date.')
          return
        end
      end

      # Pull latest version of assignment
      unless GitUtils.pull_assignment(@assignment)
        handle_edit_from_git_error(json_response, 'Failed to pull latest version of assignment repository.')
        return
      end
    end

    begin
      assignment_config = GitUtils.get_assignment_config(@assignment)
      grader_config = GitUtils.get_grader_config(@assignment)
    rescue StandardError => e
      handle_edit_from_git_error(json_response, "assignment.yml or grader-config.yml not found in updated repository")
      return
    end

    formatted_config = GitUtils.convert_assignment_config_format(@assignment.course.id, assignment_config, grader_config)
    
    # Delete old marking tool contexts
    begin
      destroyed_contexts = @assignment.marking_tool_contexts.destroy_all
    rescue StandardError => e
      handle_edit_from_git_error(json_response, "Error removing old marking schema: #{e.message}")
      return
    end

    # Update main assignment properties
    unless @assignment.update_attributes(formatted_config)
      handle_edit_from_git_error(json_response, @assignment.errors.full_messages[0])
      return
    end

    # Update active_services and dataflow
    begin
      marking_tool_contexts = formatted_config['marking_tool_contexts_attributes']
      active_services = formatted_config['active_services']
      @assignment.active_services = WorkflowUtils.construct_workflow(marking_tool_contexts, active_services)
      @assignment.dataflow = WorkflowUtils.construct_dataflow(@assignment.active_services)
      @assignment.save!
    rescue StandardError => e
      handle_edit_from_git_error(json_response, "Error when updating active services and dataflow: #{e.message}")
      return
    end

    @assignment.log('Assignment definition updated from its Git repository', 'success')
    
    # Configure graders
    begin
      configure_graders(grader_config, @assignment)
    rescue StandardError => e
      handle_edit_from_git_error(json_response, e.message)
      return
    end

    # Remark all assignment submissions
    begin
      remark_all_submissions(@assignment, json_response)
      @assignment.log('Sent submission remarking requests to graders', 'info')
    rescue StandardError => e
      handle_edit_from_git_error(json_response, e.message)
      return
    end

    if json_response
      render json: {
        success: true,
        error: nil
      }.to_json, status: 200
      return
    else
      flash[:success] = success_message
      redirect_to @assignment
    end
  end

  def remark_all_submissions(assignment, json_response)
    remark_user = nil
    if json_response
      # If we are receiving an update notification from outside (i.e.
      # json_response is true), then there will not be a current_user, but we need
      # to specify a user for submission remarking. The solution here is to create
      # a fake user with only a 'name' method, since 'name' is the only thing that
      # is actually used from the passed in user.
      json_user = Object.new
      json_user.singleton_class.define_method(:name) do
        return 'Github Action'
      end
      remark_user = json_user
    else
      remark_user = current_user
    end
    
    # Remark all assignment submissions
    assignment.submissions.each do |submission|
      submission.active_services = submission.assignment.active_services
      submission.save!

      # We're essentially creating a mock flash here so we could reuse the
      # submission remark function exactly how it is without any changes
      remark_status = {}
      if SubmissionUtils.remark!(submission, remark_user, remark_status)
        remark_status[:success] = 'Successfully sent submission for remarking.'
      end

      # If at least one remark fails, raise an error here and do not continue
      if remark_status.key?(:error)
        raise "Failed to remark submission id #{submission.id}: #{remark_status[:error]}"
        return
      end
    end
  end

  def handle_edit_from_git_error(json_response, error_message)
    if json_response
      render json: {
        success: false,
        error: error_message
      }.to_json, status: 200
    else
      flash[:error] = error_message
      redirect_to @assignment
    end
  end

  def disconnect_from_git
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)
      GitUtils.delete_assignment_repo(@assignment)
      @assignment.log('Assignment disconnected from git repository.', 'info')
      flash[:success] = 'Assignment successfully disconnected from Git repository.'
      redirect_to @assignment
    end
  end

  def connect_to_git
    @assignment = return_assignment!
    repo_url = params[:repository_url]
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)
      begin
        GitUtils.clone_assignment(repo_url, @assignment)
      rescue StandardError => e
        error_message = "Could not clone git repo for assignment: #{e.message}"
        assignment.log(error_message, 'error')
        flash[:error] = error_message
        redirect_to action: 'connect_to_git'
        return
      end
      edit_from_git_main(false, true, 'Assignment successfully connected to Git repostory. You can now add GitHub actions to your repository by clicking "Show Assignment GitHub Actions"')
    end
  end

  def show_github_actions
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def github_actions
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      notify_action = GitUtils.gen_notify_action(root_url, @assignment)
      puts "\n notify_action: #{notify_action}\n"

      test_action = GitUtils.gen_test_action(root_url, @assignment)
      puts "\n test_action: #{test_action}\n"

      action_zip_stream = Zip::OutputStream.write_buffer do |zip|
        zip.put_next_entry '.github/workflows/notify.yml'
        zip.print notify_action
        zip.put_next_entry '.github/workflows/test.yml'
        zip.print test_action
      end
      action_zip_stream.rewind

      send_data action_zip_stream.read, type: 'application/zip',
                        disposition: 'attachment',
                        filename: 'actions.zip'
    end
  end

  def edit
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def update
    @assignment = return_assignment!

    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      if @assignment.update_attributes(assignment_params)
        flash[:success] = 'Assignment updated'
        redirect_to @assignment
      else
        flash[:error] = @assignment.errors.full_messages[0]
        render 'edit'
      end
    end
  end

  def destroy
    assignment = return_assignment!
    if assignment
      return unless authenticate_can_administrate!(assignment.course)

      repo_was_deleted = GitUtils.delete_remote_assignment_repo!(assignment)
      if repo_was_deleted
        # Deletes assignment definition repository
        GitUtils.delete_assignment_repo(assignment)

        course = assignment.course
        course.log("Assignment #{assignment.id} deleted by #{current_user.name}")
        Assignment.destroy(assignment.id)
        flash[:success] = 'Assignment deleted successfully'
      else
        flash[:error] = 'Assignment was not deleted. Please try again'
      end
      redirect_to course
    end
  end

  def export_submissions_data
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      headers['Content-Disposition'] = 'attachment; filename="submissions-data-export.csv"'
      headers['Content-Type'] ||= 'text/csv'
    end
  end

  def list_submissions
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      # Get all users who have made submissions to this assignment
      @users = User.joins(:submissions).where(submissions: { assignment_id: params[:id] }).distinct.order(:name) || {}
    end
  end

  def list_ordered_submissions
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def prepare_submission_repush
    @assignment = return_assignment!
    authenticate_can_administrate!(@assignment.course) if @assignment
  end

  def submission_repush
    @assignment = return_assignment!
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)

      min_id = params[:submissions][:min_id].to_i
      max_id = params[:submissions][:max_id].to_i

      if min_id <= max_id
        if GitUtils.repush_submission_files!(@assignment, min_id, max_id)
          flash[:success] = 'Successfully re-pushed to GHE.'
        else
          flash[:error] = 'Re-pushing to GHE failed.'
        end

        redirect_to @assignment
      else
        flash[:error] = 'First id cannot be greater than last id.'

        redirect_to assignment_prepare_submission_repush_path(id: @assignment.id)
      end
    end
  end

  private

  def assignment_params
    params.require(:assignment).permit(:title,
                                       :description,
                                       :start,
                                       :deadline,
                                       :allow_late,
                                       :is_unique,
                                       :feedback_only,
                                       :late_cap,
                                       :latedeadline,
                                       :max_attempts,
                                       :course_id,
                                       :allow_zip,
                                       :allow_git,
                                       :allow_ide,
                                       :active_services,
                                       marking_tool_contexts_attributes: [:weight, :context, :marking_tool_id, :condition, :_destroy],
                                       uat_parameters_attributes: [:name, :type, :construct, :_destroy])
  end

  def return_assignment!
    assignment = Assignment.find_by(id: params[:id])
    Rails.logger.info assignment
    unless assignment
      flash.now[:error] = "Assignment #{params[:id]} does not exist"
      render 'mine', status: 404
    end
    assignment
  end

  def error_flash_and_cleanup!(message)
    flash[:error] = message
    redirect_to action: 'new', cid: @assignment.course.id
    @assignment.destroy
  end

  def error_flash_and_cleanup_from_git!(message)
    flash[:error] = message
    redirect_to action: 'new_from_git', cid: @assignment.course.id
    @assignment.destroy
  end
end
