module CourseHelper
  def user_can_administrate(course, user = current_user)
    user.admin? && course.teacher.eql?(user)
  end
end
