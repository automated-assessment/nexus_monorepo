class AddOverrideFlagToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :mark_override, :boolean
  end
end
