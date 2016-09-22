class PagesController < ApplicationController
  include ApplicationHelper

  def landing
  end

  def admin_panel
    return unless authenticate_admin!
    @access_tokens = AccessToken.all
    @marking_tools = MarkingTool.all
    @user_count = User.all.count
    # It would almost be worth bumping to Rails 5 just so we can use their or method
    @failed_submissions_count = (Submission.where(failed: true).count + Submission.where(git_success: false).count)
  end

  def user_list
    return unless authenticate_admin!
    @users = User.all
  end
end
