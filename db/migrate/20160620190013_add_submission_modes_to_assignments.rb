class AddSubmissionModesToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :allow_zip, :boolean
    add_column :assignments, :allow_git, :boolean
    add_column :assignments, :allow_ide, :boolean
  end
end
