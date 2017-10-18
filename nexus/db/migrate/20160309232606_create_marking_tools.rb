class CreateMarkingTools < ActiveRecord::Migration
  def change
    create_table :marking_tools do |t|
      t.text :name
      t.text :description
      t.text :url

      t.timestamps null: false
    end
  end
end
