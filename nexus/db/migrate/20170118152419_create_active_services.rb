class CreateActiveServices < ActiveRecord::Migration
  def change
    create_table :active_services do |t|
      t.belongs_to :assignment, index: true
      t.string :marking_tool_uid
      t.timestamps null: false
    end
  end
end
