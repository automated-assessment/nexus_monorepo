class CourseController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/git_utils'

  before_action :authenticate_user!

  def index
    @courses = Course.all
  end

  def mine
  end

  def show
    @course = return_course!
  end

  def enrolment_list
    return unless authenticate_admin!
    @course = return_course!
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
    @course = return_course!
  end

  def update
    return unless authenticate_admin!
    @course = return_course!
    if @course.update_attributes(course_params)
      flash[:success] = 'Course updated'
      redirect_to @course
    else
      render 'edit'
    end
  end

  def destroy
    return unless authenticate_admin!
    course = return_course!
    assignments = course.assignments

    # Delete all remote repos for all assignments before deleting
    # the assignment records themselves
    all_repos_deleted = true
    assignments.each do |assignment|
      repo_deleted = GitUtils.delete_remote_assignment_repo!(assignment)
      all_repos_deleted = false unless repo_deleted
    end

    Course.destroy(course.id)
    if all_repos_deleted
      flash[:success] = 'Course deleted successfully'
    else
      flash[:warning] = 'Course deleted successfully. However, one or more remote assignments were not removed from github'
    end
    redirect_to '/'
  end

  private

  def course_params
    params.require(:course).permit(:title, :description)
  end

  def return_course!
    course = Course.find_by(id: params[:id])
    unless course
      flash.now[:error] = "Course #{params[:id]} does not exist"
      render 'mine', status: 404
    end
    course
  end
end
