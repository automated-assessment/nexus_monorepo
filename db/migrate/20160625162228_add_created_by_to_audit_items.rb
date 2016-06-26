class AddCreatedByToAuditItems < ActiveRecord::Migration
  def change
    add_column :audit_items, :created_by, :string
  end
end
