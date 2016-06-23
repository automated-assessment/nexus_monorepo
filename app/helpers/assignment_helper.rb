module AssignmentHelper
  def user_can_submit(assignment, user = current_user)
    return true if assignment.max_attempts == 0
    Submission.where(assignment: assignment, user: user).size < assignment.max_attempts
  end
end
