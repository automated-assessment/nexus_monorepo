class AddDefaultValueToMarkOverridden < ActiveRecord::Migration
  def change
    change_column :submissions, :mark_override, :boolean, :default => false
  end
end
