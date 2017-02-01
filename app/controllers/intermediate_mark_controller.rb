class IntermediateMarkController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/workflow_utils'
  require_relative '../lib/submission_utils'
  skip_before_action :verify_authenticity_token, only: [:report]

  def report
    (render_unauthorized_json && return) unless verify_access_token_header
    @submission = Submission.find(params[:sid])
    tool_uid = params[:tool_uid]
    mark = params[:mark]

    @marking_tool = MarkingTool.find_by!(uid: tool_uid)
    @intermediate_mark = @submission.intermediate_marks.find_by!(marking_tool_id: @marking_tool.id)

    if @intermediate_mark.pending?
      render json: { response: 'Mark received successfully!' }.to_json

      @submission.log("Mark #{mark} received from #{@marking_tool.name}")
      @intermediate_mark.mark = mark
      @intermediate_mark.save!

      WorkflowUtils.trim_workflow!(@submission, @marking_tool.uid)
      marking_tool_context = @submission.assignment.marking_tool_contexts.where(marking_tool_id: @marking_tool.id)[0]

      if mark >= marking_tool_context.condition
        @submission.log("#{@marking_tool.name}'s condition of #{marking_tool_context.condition} met.")
        @submission.save
        SubmissionUtils.notify_tools!(@submission)
      else
        @submission.log("#{@marking_tool.name}'s condition of #{marking_tool_context.condition} not met.")
        @submission.log('Rest of intermediate marks being set to 0')
        @submission.intermediate_marks.each do |im|
          unless im.mark
            im.mark = 0
            im.save!
          end
        end
        @submission.save!
      end
    else
      render json: { response: 'Mark for this tool and submission has already been received.' }.to_json,
             status: 409
    end
  rescue ActiveRecord::RecordNotFound
    render json: { response: 'Could not find matching record(s) for request.' }.to_json,
           status: 404
  end
end
