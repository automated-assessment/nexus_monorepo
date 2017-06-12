class PagesController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_admin!, except: :landing

  def landing
  end

  def admin_panel
    return unless authenticate_admin!
    @access_tokens = AccessToken.all
    @marking_tools = all_marking_tools
    @user_count = User.all.count
    @failed_submissions_count = Submission.failed_submissions.count
  end

  def user_list
    return unless authenticate_admin!
    @users = User.all
  end
end
