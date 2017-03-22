class AddAccessTokenToMarkingTools < ActiveRecord::Migration
  def change
    add_column :marking_tools, :access_token, :string
  end
end
