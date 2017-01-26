class IntermediateMarkController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/workflow_utils'
  require_relative '../lib/submission_utils'
  skip_before_action :verify_authenticity_token, only: [:report]

  def report
    (render_unauthorized_json && return) unless verify_access_token_header
    @submission = Submission.find(params[:sid])
    tool_uid = params[:tool_uid]
    @marking_tool = MarkingTool.find_by!(uid: tool_uid)
    @active_service = ActiveService.find_by(assignment_id: @submission.assignment.id,
                                            marking_tool_uid: tool_uid)
    @intermediate_mark = @submission.intermediate_marks.find_by!(marking_tool_id: @marking_tool.id)
    mark = params[:mark]
    if @intermediate_mark.pending?
      render json: { response: 'Mark received successfully!' }.to_json

      @submission.log("Mark #{mark} received from #{@marking_tool.name}")
      @intermediate_mark.mark = mark
      @intermediate_mark.save!
      @submission.active_services.delete(@active_service)
      if mark >= @active_service.condition
        to_invoke = WorkflowUtils.next_services_to_invoke(@active_service)
        to_invoke.each { |i| @submission.active_services << i }
        @submission.log("#{@active_service.marking_tool_uid}'s condition of #{@active_service.condition} met.")
        @submission.save
        SubmissionUtils.notify_tools!(@submission)
      else
        @submission.log("#{@active_service.marking_tool_uid}'s condition of #{@active_service.condition} not met.")
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
