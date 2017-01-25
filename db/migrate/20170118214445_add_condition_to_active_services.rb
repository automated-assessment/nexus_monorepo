class AddConditionToActiveServices < ActiveRecord::Migration
  def change
    add_column :active_services, :condition, :integer
  end
end
