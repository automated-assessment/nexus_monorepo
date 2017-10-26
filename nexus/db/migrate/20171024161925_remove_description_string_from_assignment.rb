class RemoveDescriptionStringFromAssignment < ActiveRecord::Migration
  def change
    remove_column :assignments, :description_string, :string
  end
end
