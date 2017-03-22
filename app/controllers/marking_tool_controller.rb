class MarkingToolController < ApplicationController
  include ApplicationHelper

  def create
    return unless authenticate_admin!
    @marking_tool = MarkingTool.new(marking_tool_params)
    @marking_tool.save!
    redirect_to admin_panel_path
  end

  def new
    return unless authenticate_admin!
    @marking_tool = MarkingTool.new
  end

  def destroy
    return unless authenticate_admin!
    MarkingTool.delete(params[:id])
    redirect_to admin_panel_path
  end

  private

  def marking_tool_params
    params.require(:marking_tool).permit(:name,
                                         :uid,
                                         :description,
                                         :url,
                                         :input,
                                         :output,
                                         :access_token,
                                         :requires_config,
                                         :config_url)
  end
end
