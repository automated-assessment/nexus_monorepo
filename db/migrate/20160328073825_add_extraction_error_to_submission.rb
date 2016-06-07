class AddExtractionErrorToSubmission < ActiveRecord::Migration
  def change
    add_column :submissions, :extraction_error, :boolean, default: false
  end
end
