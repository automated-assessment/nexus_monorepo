class ModifyTimestampingOnAuditItems < ActiveRecord::Migration
  def change
    remove_column :audit_items, :created_at
    remove_column :audit_items, :modified_at
    add_column :audit_items, :timestamp, :datetime, limit: 3
  end
end
