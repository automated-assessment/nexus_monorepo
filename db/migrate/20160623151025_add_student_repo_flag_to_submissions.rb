class AddStudentRepoFlagToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :studentrepo, :boolean
  end
end
