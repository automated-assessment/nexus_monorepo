class AddMaxAttemptsToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :max_attempts, :integer
  end
end
