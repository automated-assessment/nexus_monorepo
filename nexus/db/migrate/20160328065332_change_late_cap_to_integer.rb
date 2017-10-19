class ChangeLateCapToInteger < ActiveRecord::Migration
  def change
    change_column :assignments, :late_cap,  :integer
  end
end
