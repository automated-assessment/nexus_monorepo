class DropServiceRelationShip < ActiveRecord::Migration
  def change
    drop_table :service_relationships
  end
end
