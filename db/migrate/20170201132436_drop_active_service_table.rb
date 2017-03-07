class DropActiveServiceTable < ActiveRecord::Migration
  def change
    remove_index :active_services, :assignment_id
    drop_table :active_services
  end
end
