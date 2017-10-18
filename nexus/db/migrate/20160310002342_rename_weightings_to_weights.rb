class RenameWeightingsToWeights < ActiveRecord::Migration
  def change
    rename_column :marking_tool_contexts, :weighting, :weight
  end
end
