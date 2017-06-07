class AddDescriptionstringToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :description_string, :string
  end
end
