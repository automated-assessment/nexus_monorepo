class AddFeedbackOnlyToAssignment < ActiveRecord::Migration
  def change
    add_column :assignments, :feedback_only, :boolean, default: false
  end
end
