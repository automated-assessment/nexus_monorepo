class AssignmentController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_user!

  def mine
  end

  def show
    @assignment = Assignment.find(params[:id])
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

    redirect_to action: 'show', id: @assignment.id
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
