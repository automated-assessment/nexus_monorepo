class AssignmentController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/git_utils'

  before_action :authenticate_user!

  def mine
  end

  def show
    @assignment = Assignment.find(params[:id])
  end

  def show_deadline_extensions
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])
  end

  def quick_config_confirm
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])
  end

  def configure_tools
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])

    # augment template URLs with parameters
    params = {
      aid: @assignment.id
    }
    @tools_with_augmented_urls = []
    @assignment.marking_tools.configurable.each do |t|
      @tools_with_augmented_urls << { tool: t, augmented_url: t.config_url % params }
    end
  end

  def new
    return unless authenticate_admin!
    @assignment = Assignment.new
    @assignment.course = Course.find(params[:cid])
    @assignment.marking_tool_contexts.build
  end

  def create
    return unless authenticate_admin!
    @assignment = Assignment.new(assignment_params)
    @assignment.save!

    unless GitUtils.setup_remote_assignment_repo!(@assignment)
      flash[:error] = 'Error creating repository for assignment!'
      redirect_to action: 'new', cid: @assignment.course.id
      @assignment.destroy
      return
    end

    if @assignment.marking_tools.configurable.any?
      redirect_to action: 'quick_config_confirm', id: @assignment.id
    else
      redirect_to action: 'show', id: @assignment.id
    end
  end

  def edit
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])
  end

  def update
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])
    if @assignment.update_attributes(assignment_params)
      flash[:success] = 'Assignment updated'
      redirect_to @assignment
    else
      render 'edit'
    end
  end

  def export_submissions_data
    return unless authenticate_admin!
    @assignment = Assignment.find(params[:id])
    headers['Content-Disposition'] = "attachment; filename=\"submissions-data-export.csv\""
    headers['Content-Type'] ||= 'text/csv'
  end

  def list_submissions
    return unless authenticate_admin!

    @assignment = Assignment.find(params[:id])
    # Get all users who have made submissions to this assignment
    @users = User.joins(:submissions).where(submissions: {assignment_id: params[:id]}).distinct.order(:name) || {}
  end

  private

  def assignment_params
    params.require(:assignment).permit(:title,
                                       :description,
                                       :start,
                                       :deadline,
                                       :allow_late,
                                       :late_cap,
                                       :latedeadline,
                                       :max_attempts,
                                       :course_id,
                                       :allow_zip,
                                       :allow_git,
                                       :allow_ide,
                                       marking_tool_contexts_attributes: [:weight, :context, :marking_tool_id])
  end
end
