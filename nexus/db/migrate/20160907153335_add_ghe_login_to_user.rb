class AddGheLoginToUser < ActiveRecord::Migration
  def change
    add_column :users, :ghe_login, :string
  end
end
