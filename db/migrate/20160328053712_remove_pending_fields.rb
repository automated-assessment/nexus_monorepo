class RemovePendingFields < ActiveRecord::Migration
  def change
    remove_column :intermediate_marks, :pending
    remove_column :submissions, :pending

  end
end
