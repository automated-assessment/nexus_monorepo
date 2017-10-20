class RemoveParameterstringFromAssignment < ActiveRecord::Migration
  def change
    remove_column :assignments, :parameter_string, :string
  end
end
