class CreateMarkingToolContexts < ActiveRecord::Migration
  def change
    create_table :marking_tool_contexts do |t|
      t.belongs_to :assignment, index: true
      t.belongs_to :marking_tool, index: true
      t.text :context
      t.integer :weighting
      t.timestamps null: false
    end
  end
end
