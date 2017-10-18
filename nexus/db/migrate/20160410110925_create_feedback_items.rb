class CreateFeedbackItems < ActiveRecord::Migration
  def change
    create_table :feedback_items do |t|
      t.text :body
      t.belongs_to :submission, index: true
      t.belongs_to :marking_tool

      t.timestamps null: false
    end
  end
end
