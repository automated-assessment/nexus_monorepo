class AddCappedMarkToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :late_cap, :float
  end
end
