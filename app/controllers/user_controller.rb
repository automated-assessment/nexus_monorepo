class UserController < ApplicationController
  include ApplicationHelper
  before_action :authenticate_user!

  def enrol
    cid = params[:id]
    unless current_user.enrolled_in?(cid)
      c = Course.find(cid)
      current_user.courses << c
    end
    redirect_to c
  end

  def unenrol
    cid = params[:id]
    if current_user.enrolled_in?(cid)
      current_user.courses.delete(cid)
      flash[:info] = 'Unenrolled successfully!'
    end
    redirect_to all_courses_path
  end

  def grant_admin
    return unless authenticate_admin!
    @user = User.find(params[:id])
    @user.admin = true
    @user.save

    flash[:error] = 'Error making user admin' if @user.errors.any?

    redirect_to user_list_path
  end

  def revoke_admin
    return unless authenticate_admin!
    @user = User.find(params[:id])
    if @user.eql?(current_user)
      flash[:error] = 'You cannot revoke your own admin rights'
      redirect_to user_list_path
      return
    end
    @user.admin = false
    @user.save

    flash[:error] = 'Error revoking admin priviliges' if @user.errors.any?

    redirect_to user_list_path
  end
end
