class CreateServiceRelationships < ActiveRecord::Migration
  def change
    create_table :service_relationships do |t|
      t.integer :parent_id
      t.integer :child_id
      t.timestamps null: false
    end
  end
end
