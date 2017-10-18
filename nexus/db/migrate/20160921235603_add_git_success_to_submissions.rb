class AddGitSuccessToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :git_success, :boolean, default: false
  end
end
