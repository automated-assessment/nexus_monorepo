class AddDefaultsToBooleanColumns < ActiveRecord::Migration
  def change
    change_column :marking_tools, :requires_config, :boolean, default: false
    change_column :marking_tool_contexts, :configured, :boolean, default: false
  end
end
