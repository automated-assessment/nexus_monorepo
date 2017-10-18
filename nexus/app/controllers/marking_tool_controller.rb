class MarkingToolController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_admin!

  def create
    @marking_tool = MarkingTool.new(marking_tool_params)
    @marking_tool.save!
    redirect_to admin_panel_path
  end

  def new
    @marking_tool = MarkingTool.new
  end

  def edit
    @marking_tool = return_marking_tool!
  end

  def update
    marking_tool = return_marking_tool!

    if marking_tool.update_attributes(marking_tool_params)
      flash[:success] = 'Marking Tool updated'
      redirect_to admin_panel_path
    else
      flash[:error] = marking_tool.errors.full_messages[0]
      redirect_to edit_marking_tool_path(marking_tool)
    end
  end

  def destroy
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

  def return_marking_tool!
    marking_tool = MarkingTool.find_by(id: params[:id])
    unless marking_tool
      flash.now[:error] = "Marking Tool #{params[:id]} does not exist"
      render 'admin_panel', status: 404
    end
    marking_tool
  end
end
