class AddFailedToSubmission < ActiveRecord::Migration
  def change
    add_column :submissions, :failed, :boolean
  end
end
