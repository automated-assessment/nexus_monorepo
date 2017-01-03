class CreateMarkingToolContextHierarchies < ActiveRecord::Migration
  def change
    create_table :marking_tool_context_hierarchies, id: false do |t|
      t.integer :ancestor_id, null: false
      t.integer :descendant_id, null: false
      t.integer :generations, null: false
    end

    add_index :marking_tool_context_hierarchies, [:ancestor_id, :descendant_id, :generations],
      unique: true,
      name: "marking_tool_context_anc_desc_idx"

    add_index :marking_tool_context_hierarchies, [:descendant_id],
      name: "marking_tool_context_desc_idx"
  end
end
