class CreateSubmissions < ActiveRecord::Migration
  def change
    create_table :submissions do |t|
      t.references :assignment, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.datetime :submitted
      t.boolean :late
      t.boolean :pending
      t.float :mark

      t.timestamps null: false
    end
  end
end
