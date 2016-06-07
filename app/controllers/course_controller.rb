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
    @course = Course.find(params[:id])
  end

  def new
    authenticate_staff!
    @course = Course.new
  end

  def create
    authenticate_staff!
    @course = Course.new(course_params)
    @course.teacher = current_user

    @course.save!

    current_user.courses << @course

    redirect_to action: 'show', id: @course.id
  end

  private

  def course_params
    params.require(:course).permit(:title, :description)
  end
end
