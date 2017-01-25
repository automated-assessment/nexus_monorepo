class AddActiveServicesToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :active_services, :text
  end
end
