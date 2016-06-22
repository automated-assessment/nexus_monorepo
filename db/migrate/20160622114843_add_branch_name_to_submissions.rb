class AddBranchNameToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :gitbranch, :string
  end
end
