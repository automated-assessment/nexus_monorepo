class AddUidToMarkingTools < ActiveRecord::Migration
  def change
    add_column :marking_tools, :uid, :string
    add_index :marking_tools, :uid, unique: true
  end
end
