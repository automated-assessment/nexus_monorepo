class AssignmentController < ApplicationController
  include ApplicationHelper
  require 'yaml'
  require 'net/http'
  require 'json'
  require_relative '../lib/git_utils'
  require_relative '../lib/workflow_utils'

  before_action :authenticate_user!
  before_action :authenticate_admin!, except: [:mine, :show, :show_deadline_extensions, :quick_config_confirm, :configure_tools, :new, :create, :create_from_git, :edit, :update, :destroy, :export_submissions_data, :list_submissions, :list_ordered_submissions, :prepare_submission_repush, :submission_repush]

  # skip_before_action :authenticate_admin!
  # skip_before_action :authenticate_user!
  # skip_before_action :verify_authenticity_token

  skip_before_action :authenticate_admin!, only: [:create_from_git, :edit_from_git, :new_from_git]
  skip_before_action :authenticate_user!, only: [:create_from_git, :edit_from_git, :new_from_git]
  skip_before_action :verify_authenticity_token, only: [:create_from_git, :edit_from_git, :new_from_git]

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
    tmp_path = GitUtils.clone_tmp_assignment(repo_url)

    assignment_config = GitUtils.get_assignment_config_from_path(tmp_path)
    grader_config = GitUtils.get_grader_config_from_path(tmp_path)
    
    formatted_config = GitUtils.convert_assignment_config_format(assignment_config, grader_config)

    @assignment = Assignment.new(formatted_config)
    if @assignment
      return unless authenticate_can_administrate!(@assignment.course)
      
      unless @assignment.save
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
      configure_graders(grader_config, @assignment)

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
          puts "response #{res.body}"
          puts JSON.parse(res.body)
        rescue => e
          puts "failed #{e}"
        end
      end
    }
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
    end
    # There is also a third special case where repository is not 'this' and sha is 'latest'.
    # We will not handle such case and in that case, sha will have to be specified manually.
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
