class AddGithubComDetailsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :github_com_token, :text
    add_column :users, :github_com_profile_url, :text
    add_column :users, :github_com_login, :string
  end
end
