class PagesController < ApplicationController
  def landing
  end

  def admin_panel
    @access_tokens = AccessToken.all
    @marking_tools = MarkingTool.all
  end
end
