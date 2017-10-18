class RemoveDependsOnFromMarkingToolContext < ActiveRecord::Migration
  def change
    remove_column :marking_tool_contexts, :depends_on
  end
end
