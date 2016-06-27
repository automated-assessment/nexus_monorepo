class AddGitHubProfileUrlToUsers < ActiveRecord::Migration
  def change
    add_column :users, :ghe_profile_url, :text
  end
end
