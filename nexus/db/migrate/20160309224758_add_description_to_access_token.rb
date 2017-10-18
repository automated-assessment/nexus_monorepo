class AddDescriptionToAccessToken < ActiveRecord::Migration
  def change
    add_column :access_tokens, :description, :text
  end
end
