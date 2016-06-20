class ModifyUserFields < ActiveRecord::Migration
  def change
    remove_column :users, :first_name
    remove_column :users, :last_name
    remove_column :users, :title
    remove_column :users, :student_id
    remove_column :users, :level
    add_column :users, :name, :text
    add_column :users, :admin, :boolean, default: false
  end
end
