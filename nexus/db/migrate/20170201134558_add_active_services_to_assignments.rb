class AddActiveServicesToAssignments < ActiveRecord::Migration
  def change
    add_column :assignments, :active_services, :text
  end
end
