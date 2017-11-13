class RemoveTeacherIdFromCourse < ActiveRecord::Migration
  def change
    remove_column :courses, :teacher_id, :integer
  end
end
