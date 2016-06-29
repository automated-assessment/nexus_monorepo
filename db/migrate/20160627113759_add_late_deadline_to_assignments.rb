class AddLateDeadlineToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :latedeadline, :datetime
  end
end
