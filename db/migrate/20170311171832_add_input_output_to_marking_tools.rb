class AddInputOutputToMarkingTools < ActiveRecord::Migration
  def change
    add_column :marking_tools, :input, :string, default: nil
    add_column :marking_tools, :output, :string, default: nil
  end
end
