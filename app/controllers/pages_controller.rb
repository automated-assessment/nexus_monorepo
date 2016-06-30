class PagesController < ApplicationController
  include ApplicationHelper

  def landing
  end

  def admin_panel
    return unless authenticate_admin!
    @access_tokens = AccessToken.all
    @marking_tools = MarkingTool.all
  end
end
