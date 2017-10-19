class CreateDeadlineExtensions < ActiveRecord::Migration
  def change
    create_table :deadline_extensions do |t|
      t.belongs_to :user, index: true, foreign_key: true
      t.belongs_to :assignment, index: true, foreign_key: true
      t.datetime :extendeddeadline

      t.timestamps null: false
    end
  end
end
