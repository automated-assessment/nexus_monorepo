class IntermediateMarkController < ApplicationController
  include ApplicationHelper

  skip_before_action :verify_authenticity_token, only: [:report]

  def report
    (render_unauthorized_json && return) unless verify_access_token_header

    @submission = Submission.find(params[:sid])
    @marking_tool = MarkingTool.find_by!(uid: params[:tool_uid])
    @intermediate_mark = @submission.intermediate_marks.find_by!(marking_tool_id: @marking_tool.id)

    if @intermediate_mark.pending?
      render json: { response: 'Mark received successfully!' }.to_json

      @submission.log("Mark #{params[:mark]} received from #{@marking_tool.name}")
      @intermediate_mark.mark = params[:mark]
      @intermediate_mark.save!
    else
      render json: { response: 'Mark for this tool and submission has already been received.' }.to_json,
             status: 409
    end
  rescue ActiveRecord::RecordNotFound
    render json: { response: 'Could not find matching record(s) for request.' }.to_json,
           status: 404
  end
end
