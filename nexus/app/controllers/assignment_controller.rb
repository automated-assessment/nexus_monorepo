class AssignmentController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/git_utils'
  require_relative '../lib/workflow_utils'

  before_action :authenticate_user!
  before_action :authenticate_admin!, except: [:mine, :show]

  def mine
  end

  def show
    @assignment = return_assignment!
  end

  def show_deadline_extensions
    @assignment = return_assignment!
  end

  def quick_config_confirm
    @assignment = return_assignment!
  end

  def configure_tools
    @assignment = return_assignment!

    if @assignment
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
    @assignment.description_string = @assignment.description
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
    if @assignment.is_unique == true
      uri = URI.parse('http://unique-assignment-tool:3009/param_upload_finish')

        Net::HTTP.start(uri.host, uri.port) do |http|
          req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

          req.body = {
            aid: @assignment.id
          }.to_json

          Rails.logger.info "DEBUG!!: Body to send to UAT: " + req.body.to_s
          res = http.request(req)
        end
    end
  end

  def edit
    @assignment = return_assignment!
  end

  def update
    @assignment = return_assignment!
    if @assignment
      if @assignment.update_attributes(assignment_params)
        @assignment.description_string = @assignment.description
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
    repo_was_deleted = GitUtils.delete_remote_assignment_repo!(assignment)
    if repo_was_deleted
      course = assignment.course
      course.log("Assignment #{assignment.id} deleted by #{current_user.name}")
      Assignment.destroy(assignment.id)
      flash[:success] = 'Assignment deleted successfully'
    else
      flash[:error] = 'Assignment was not deleted. Please try again'
    end
    redirect_to course
  end

  def export_submissions_data
    @assignment = return_assignment!
    if @assignment
      headers['Content-Disposition'] = 'attachment; filename="submissions-data-export.csv"'
      headers['Content-Type'] ||= 'text/csv'
    end
  end

  def list_submissions
    @assignment = return_assignment!

    if @assignment
      # Get all users who have made submissions to this assignment
      @users = User.joins(:submissions).where(submissions: { assignment_id: params[:id] }).distinct.order(:name) || {}
    end
  end

  def list_ordered_submissions
    @assignment = return_assignment!
  end

  def prepare_submission_repush
    @assignment = return_assignment!
  end

  def submission_repush
    @assignment = return_assignment!
    if @assignment
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
                                       :description_string,
                                       :feedback_only,
                                       :late_cap,
                                       :latedeadline,
                                       :max_attempts,
                                       :course_id,
                                       :allow_zip,
                                       :allow_git,
                                       :allow_ide,
                                       :active_services,
                                       marking_tool_contexts_attributes: [:weight, :context, :marking_tool_id, :condition, :_destroy])
  end

  def return_assignment!
    assignment = Assignment.find_by(id: params[:id])
    if (caller[0].index("edit") != nil)
      assignment.description = assignment.description_string
    elsif (assignment.is_unique == true)
      Rails.logger.info 'Assignment is unique, requesting generation for description'

      uri = URI.parse('http://unique-assignment-tool:3009/desc_gen')

      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')

        req.body = {
          aid: assignment.id,
          studentid: current_user.id,
          is_unique: assignment.is_unique,
          description_string: assignment.description_string
        }.to_json

        res = http.request(req)
        Rails.logger.info res.body
        if res.code =~ /2../
          Rails.logger.info 'Success on generating description for unique assignment'
          assignment.description = res.body
        else
          Rails.logger.info 'Error on generating description for unique assignment'
          assignment.description = 'ERROR: Error on generation of description. Get in contact with your lecturer for further details.'
        end
      end
    end
    Rails.logger.info 'Done if-else check on unique assignment check'
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
end
