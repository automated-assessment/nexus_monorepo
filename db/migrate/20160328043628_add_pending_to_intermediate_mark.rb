class AddPendingToIntermediateMark < ActiveRecord::Migration
  def change
    add_column :intermediate_marks, :pending, :boolean
  end
end
