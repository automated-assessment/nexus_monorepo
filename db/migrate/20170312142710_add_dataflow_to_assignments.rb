class AddDataflowToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :dataflow, :text
  end
end
