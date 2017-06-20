class AddConditionToMarkingToolContexts < ActiveRecord::Migration
  def change
    add_column :marking_tool_contexts, :condition, :integer
  end
end
