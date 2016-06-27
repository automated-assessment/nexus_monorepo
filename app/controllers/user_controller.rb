class UserController < ApplicationController
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
end
