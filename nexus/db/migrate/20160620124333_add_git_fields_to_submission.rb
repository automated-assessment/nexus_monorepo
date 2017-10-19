class AddGitFieldsToSubmission < ActiveRecord::Migration
  def change
    add_column :submissions, :repourl, :text
    add_column :submissions, :commithash, :text
  end
end
