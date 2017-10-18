class AddGitHubTokenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :githubtoken, :text
  end
end
