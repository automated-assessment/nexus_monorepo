class AddRepoUrlToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :repourl, :string
  end
end
