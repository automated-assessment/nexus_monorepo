class AddParameterstringToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :parameter_string, :string
  end
end
