class ChangeFinalMarkToInteger < ActiveRecord::Migration
  def change
    change_column :submissions, :mark,  :integer
  end
end
