class RemoveCreatedByFromAuditItems < ActiveRecord::Migration
  def change
    remove_column :audit_items, :created_by
  end
end
