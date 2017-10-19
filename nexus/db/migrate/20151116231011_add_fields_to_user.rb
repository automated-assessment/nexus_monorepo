class AddFieldsToUser < ActiveRecord::Migration
  def change
    add_column :users, :level, :integer, default: 0
    add_column :users, :studentID, :string
  end
end
