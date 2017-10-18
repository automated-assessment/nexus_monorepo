class AddAttemptNumberToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :attempt_number, :integer
  end
end
