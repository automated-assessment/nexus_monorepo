class CreateTeachingTeamMembers < ActiveRecord::Migration
  def change
    create_table :teaching_team_members do |t|
      t.integer :course_id, null: false
      t.integer :user_id, null: false

      t.timestamps null: false
    end
  end
end
