class AddIsUniqueToAssignment < ActiveRecord::Migration
  def change
    add_column :assignments, :is_unique, :boolean
  end
end
