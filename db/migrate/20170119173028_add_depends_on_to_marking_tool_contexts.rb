class AddDependsOnToMarkingToolContexts < ActiveRecord::Migration
  def change
    add_column :marking_tool_contexts, :depends_on, :text
  end
end
