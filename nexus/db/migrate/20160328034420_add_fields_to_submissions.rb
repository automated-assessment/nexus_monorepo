class AddFieldsToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :saved_filename, :string
    add_column :submissions, :log, :text

  end
end
