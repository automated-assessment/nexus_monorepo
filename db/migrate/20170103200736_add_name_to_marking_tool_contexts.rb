class AddNameToMarkingToolContexts < ActiveRecord::Migration
  def change
    add_column :marking_tool_contexts, :name, :string
  end
end
