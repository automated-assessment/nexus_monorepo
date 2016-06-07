class CourseStudentsRelation < ActiveRecord::Migration
  def change
    create_table :students_courses, id: false do |t|
      t.belongs_to :user, index: true
      t.belongs_to :course, index: true
    end
  end
end
