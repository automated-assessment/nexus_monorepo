class AddWorkflowToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :workflow, :text
  end
end
