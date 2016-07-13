class PagesController < ApplicationController
  include ApplicationHelper

  def landing
  end

  def admin_panel
    return unless authenticate_admin!
    @access_tokens = AccessToken.all
    @marking_tools = MarkingTool.all
    @user_count = User.all.count
    @failed_submissions_count = Submission.where(failed: true).count
  end

  def user_list
    return unless authenticate_admin!
    @users = User.all
  end
end
