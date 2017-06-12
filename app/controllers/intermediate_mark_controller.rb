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

      marking_tool_context = @submission.assignment.marking_tool_contexts.where(marking_tool_id: @marking_tool.id)[0]

      if mark >= marking_tool_context.condition
        @submission.active_services = WorkflowUtils.trim_workflow!(@submission.active_services, @marking_tool.uid)
        unless @submission.active_services.empty?
          @submission.log("#{@marking_tool.name}'s condition of #{marking_tool_context.condition} met.")
          SubmissionUtils.notify_tools!(@submission)
        end
      else
        @submission.log("#{@marking_tool.name}'s condition of #{marking_tool_context.condition} not met.")
        @submission.log('Rest of intermediate marks being set to 0')

        failed_services = WorkflowUtils.simulate_workflow(@submission.active_services, @marking_tool.uid) do |service|
          marking_tool = MarkingTool.find_by!(uid: service)
          intermediate_mark = @submission.intermediate_marks.find_by!(marking_tool_id: marking_tool.id)
          intermediate_mark.mark = 0
          intermediate_mark.save!
        end

        unless failed_services.empty?
          failed_tools = MarkingTool.where(uid: failed_services.to_a).map(&:name)
          feedback_body = other_feedback(marking_tool_context, failed_tools)
          nexus = nexus_for_feedback
          FeedbackItem.create(submission: @submission, marking_tool: nexus, body: feedback_body)
        end
      end
    else
      render json: { response: 'Mark for this tool and submission has already been received.' }.to_json,
             status: 409
    end
  rescue ActiveRecord::RecordNotFound
    render json: { response: 'Could not find matching record(s) for request.' }.to_json,
           status: 404
  end

  private

  def other_feedback(marking_tool_context, failed_marking_services)
    html = '<p class="text-info">
              A mark of 0 was awarded for the following areas:
            </p>
            <pre>'
    failed_marking_services.each do |service|
      html += "<code>#{service} </code>\n"
    end

    html += '</pre>
             <p class="text-info">'

    tool = marking_tool_context.marking_tool
    html += "This is because you scored below #{marking_tool_context.condition}%\
             for #{tool.name}.\
             </p>"
    html.html_safe
  end
end
