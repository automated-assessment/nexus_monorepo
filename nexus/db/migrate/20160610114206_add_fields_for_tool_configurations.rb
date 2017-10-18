class AddFieldsForToolConfigurations < ActiveRecord::Migration
  def change
    add_column :marking_tool_contexts, :configured, :boolean
    add_column :marking_tools, :requires_config, :boolean
    add_column :marking_tools, :config_url, :text
  end
end
