class FeedbackItemController < ApplicationController
  include ApplicationHelper

  skip_before_action :verify_authenticity_token, only: [:report]

  def report
    (render_unauthorized_json && return) unless verify_access_token_header

    @submission = Submission.find(params[:sid])
    @marking_tool = MarkingTool.find_by!(uid: params[:tool_uid])
    @feedback_item = FeedbackItem.find_by(submission_id: @submission.id, marking_tool_id: @marking_tool.id)

    if @feedback_item.nil?
      render json: { response: 'Feedback received successfully!' }.to_json
      @submission.log("Feedback received from #{@marking_tool.name}!")
      @feedback_item = FeedbackItem.create(submission: @submission,
                                           marking_tool: @marking_tool,
                                           body: params[:body])
    else
      render json: { response: 'Feedback for this tool and submission has already been received.' }.to_json,
             status: 409
    end
  rescue ActiveRecord::RecordNotFound
    render json: { response: 'Could not find matching record(s) for request.' }.to_json,
           status: 404
  end
end
