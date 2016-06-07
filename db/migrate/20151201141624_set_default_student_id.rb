class SetDefaultStudentId < ActiveRecord::Migration
  def change
    change_column_default :users, :studentID, ""
  end
end
