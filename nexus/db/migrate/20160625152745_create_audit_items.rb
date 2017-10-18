class CreateAuditItems < ActiveRecord::Migration
  def change
    create_table :audit_items do |t|
      t.text :body
      t.string :level
      t.belongs_to :access_token, index: true, foreign_key: true
      t.belongs_to :assignment, index: true, foreign_key: true
      t.belongs_to :course, index: true, foreign_key: true
      t.belongs_to :feedback_item, index: true, foreign_key: true
      t.belongs_to :intermediate_mark, index: true, foreign_key: true
      t.belongs_to :marking_tool, index: true, foreign_key: true
      t.belongs_to :submission, index: true, foreign_key: true
      t.belongs_to :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
