class CourseController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_user!

  def index
    @courses = Course.all
  end

  def mine
  end

  def show
    @course = Course.find(params[:id])
  end

  def enrolment_list
    return unless authenticate_admin!
    @course = Course.find(params[:id])
  end

  def new
    return unless authenticate_admin!
    @course = Course.new
  end

  def create
    return unless authenticate_admin!
    @course = Course.new(course_params)
    @course.teacher = current_user

    @course.save!

    current_user.courses << @course

    redirect_to action: 'show', id: @course.id
  end

  def edit
    return unless authenticate_admin!
    @course = Course.find(params[:id])
  end

  def update
    return unless authenticate_admin!
    @course = Course.find(params[:id])
    if @course.update_attributes(course_params)
      flash[:success] = 'Course updated'
      redirect_to @course
    else
      render 'edit'
    end
  end

  private

  def course_params
    params.require(:course).permit(:title, :description)
  end
end
