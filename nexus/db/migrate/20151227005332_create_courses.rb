class CreateCourses < ActiveRecord::Migration
  def change
    create_table :courses do |t|
      t.string :title, null: false
      t.string :description
      t.belongs_to :user

      t.timestamps null: false
    end
  end
end
