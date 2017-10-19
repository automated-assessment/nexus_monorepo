class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.string :name
      t.text :description
      t.datetime :start
      t.datetime :deadline
      t.boolean :allow_late
      t.references :course, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
