class CourseController < ApplicationController
  include ApplicationHelper
  require_relative '../lib/git_utils'

  before_action :authenticate_user!
  before_action :authenticate_admin!, except: [:index, :mine, :show, :enrolment_list, :edit, :update, :destroy]

  def index
    @courses = Course.all.order(:title)
  end

  def mine
  end

  def show
    @course = return_course!
  end

  def enrolment_list
    @course = return_course!
    authenticate_can_administrate!(@course)
  end

  def new
    @course = Course.new
    @course.teachers << current_user
  end

  def create
    @course = Course.new(course_params)
    @course.save!

    current_user.courses << @course

    redirect_to action: 'show', id: @course.id
  end

  def edit
    @course = return_course!
    authenticate_can_administrate!(@course)
  end

  def update
    @course = return_course!
    return unless authenticate_can_administrate!(@course)
    if @course.update_attributes(course_params)
      flash[:success] = 'Course updated'
      redirect_to @course
    else
      render 'edit'
    end
  end

  def destroy
    course = return_course!
    return unless authenticate_can_administrate!(course)

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
    redirect_to all_courses_url
  end

  private

  def course_params
    params.require(:course).permit(:title,
                                   :description,
                                   teaching_team_members_attributes: [:id, :user_id, :_destroy])
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
