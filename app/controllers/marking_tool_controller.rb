class MarkingToolController < ApplicationController
  def create
    @marking_tool = MarkingTool.new(marking_tool_params)
    @marking_tool.save!
    redirect_to admin_panel_path
  end

  def new
    @marking_tool = MarkingTool.new
  end

  private

  def marking_tool_params
    params.require(:marking_tool).permit(:name, :uid, :description, :url)
  end
end
