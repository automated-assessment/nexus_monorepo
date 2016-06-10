class AssignmentController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_user!

  def mine
  end

  def show
    @assignment = Assignment.find(params[:id])
  end

  def quick_config_confirm
    @assignment = Assignment.find(params[:id])
  end

  def configure_tools
    @assignment = Assignment.find(params[:id])

    # augment template URLs with parameters
    # TODO: extract this functionality to a helper, duplicated from submission utils
    data = {}
    data[:aid] = @assignment.id
    @tools_with_augmented_urls = []
    @assignment.marking_tools.configurable.each do |t|
      @tools_with_augmented_urls << { tool: t, augmented_url: t.config_url % data }
    end
  end

  def new
    authenticate_staff!
    @assignment = Assignment.new
    @assignment.course = Course.find(params[:cid])
    @assignment.marking_tool_contexts.build
  end

  def create
    authenticate_staff!
    @assignment = Assignment.new(assignment_params)

    @assignment.save!

    if @assignment.marking_tools.configurable.any?
      redirect_to action: 'quick_config_confirm', id: @assignment.id
    else
      redirect_to action: 'show', id: @assignment.id
    end
  end

  private

  def assignment_params
    params.require(:assignment).permit(:title,
                                       :description,
                                       :start,
                                       :deadline,
                                       :allow_late,
                                       :late_cap,
                                       :course_id,
                                       marking_tool_contexts_attributes: [:weight, :context, :marking_tool_id])
  end
end
