class AssignmentController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/git_utils'

  before_action :authenticate_user!

  def mine
  end

  def show
    @assignment = return_assignment!
  end

  def show_deadline_extensions
    return unless authenticate_admin!
    @assignment = return_assignment!
  end

  def quick_config_confirm
    return unless authenticate_admin!
    @assignment = return_assignment!
  end

  def configure_tools
    return unless authenticate_admin!
    @assignment = return_assignment!

    if @assignment
      # augment template URLs with parameters
      params = {
        aid: @assignment.id
      }
      @tools_with_augmented_urls = []
      @assignment.marking_tools.configurable.each do |t|
        @tools_with_augmented_urls << { tool: t, augmented_url: t.config_url % params }
      end
    end
  end

  def new
    return unless authenticate_admin!
    @assignment = Assignment.new
    course = Course.find_by(id: params[:cid])
    if course
      @assignment.course = course
      @assignment.marking_tool_contexts.build

      # Set default values
      @assignment.start = DateTime.now
      @assignment.deadline = (DateTime.now.utc + 1.week)
      @assignment.latedeadline = (DateTime.now.utc + 8.days)

      @assignment.max_attempts = 0

      @assignment.allow_late = true
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
    return unless authenticate_admin!
    @assignment = Assignment.new(assignment_params)
    unless @assignment.save
      flash[:error] = @assignment.errors.full_messages[0]
      redirect_to action: 'new', cid: @assignment.course.id
      @assignment.destroy
      return
    end

    unless GitUtils.setup_remote_assignment_repo!(@assignment)
      flash[:error] = 'Error creating repository for assignment!'
      redirect_to action: 'new', cid: @assignment.course.id
      @assignment.destroy
      return
    end

    @assignment.marking_tool_contexts.each do |mtc|
      marking_tool = MarkingTool.find_by(id: mtc.marking_tool_id)
      unless marking_tool
        flash[:error] = 'One of the marking tools selected doesn\'t exist'
        redirect_to action: 'new', cid: @assignment.course.id
        @assignment.destroy
        return nil
      end
      mtc.name = "#{@assignment.id}-#{marking_tool.uid}"
      mtc.save!
    end

    @assignment.marking_tool_contexts.each do |mtc|
      marking_tool = MarkingTool.find_by(id: mtc.marking_tool_id)
      depends_on = MarkingTool.find_by(id: mtc.depends_on)
      next unless depends_on
      if marking_tool.uid.eql? depends_on.uid
        flash[:error] = 'A marking service cannot depend on itself!'
        redirect_to action: 'new', cid: @assignment.course.id
        @assignment.destroy
        return nil
      end
      parent_node = MarkingToolContext.find_by(name: "#{@assignment.id}-#{depends_on.uid}")
      parent_node.add_child mtc
    end

    if @assignment.marking_tools.configurable.any?
      redirect_to action: 'quick_config_confirm', id: @assignment.id
    else
      redirect_to action: 'show', id: @assignment.id
    end
  end

  def edit
    return unless authenticate_admin!
    @assignment = return_assignment!
  end

  def update
    return unless authenticate_admin!
    @assignment = return_assignment!
    if @assignment
      if @assignment.update_attributes(assignment_params)
        flash[:success] = 'Assignment updated'
        redirect_to @assignment
      else
        flash[:error] = @assignment.errors.full_messages[0]
        render 'edit'
      end
    end
  end

  def export_submissions_data
    return unless authenticate_admin!
    @assignment = return_assignment!
    if @assignment
      headers['Content-Disposition'] = 'attachment; filename=\"submissions-data-export.csv\"'
      headers['Content-Type'] ||= 'text/csv'
    end
  end

  def list_submissions
    return unless authenticate_admin!

    @assignment = return_assignment!

    if @assignment
      # Get all users who have made submissions to this assignment
      @users = User.joins(:submissions).where(submissions: { assignment_id: params[:id] }).distinct.order(:name) || {}
    end
  end

  def list_ordered_submissions
    return unless authenticate_admin!
    @assignment = return_assignment!
  end

  def prepare_submission_repush
    return unless authenticate_admin!
    @assignment = return_assignment!
  end

  def submission_repush
    return unless authenticate_admin!

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
                                       :feedback_only,
                                       :late_cap,
                                       :latedeadline,
                                       :max_attempts,
                                       :course_id,
                                       :allow_zip,
                                       :allow_git,
                                       :allow_ide,
                                       marking_tool_contexts_attributes: [:weight, :context, :marking_tool_id, :depends_on, :condition])
  end

  def return_assignment!
    assignment = Assignment.find_by(id: params[:id])
    unless assignment
      flash.now[:error] = "Assignment #{params[:id]} does not exist"
      render 'mine', status: 404
    end
    assignment
  end

  def delete_assignment_and_redirect_with_error!(assignment, err_message)
    flash[:error] = err_message
    redirect_to action: 'new', cid: assignment.course.id
    assignment.destroy
  end
end
