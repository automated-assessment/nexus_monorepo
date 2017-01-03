class AddParentIdToMarkingToolContexts < ActiveRecord::Migration
  def change
    add_column :marking_tool_contexts, :parent_id, :integer
  end
end
