class CreateIntermediateMarks < ActiveRecord::Migration
  def change
    create_table :intermediate_marks do |t|
      t.integer :mark
      t.belongs_to :marking_tool, index: true, foreign_key: true
      t.belongs_to :submission, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
