class RenameNameInAssignmentsToTitle < ActiveRecord::Migration
  def change
    rename_column :assignments, :name, :title
  end
end
