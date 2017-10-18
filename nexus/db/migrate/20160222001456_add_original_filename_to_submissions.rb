class AddOriginalFilenameToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :original_filename, :string
  end
end
