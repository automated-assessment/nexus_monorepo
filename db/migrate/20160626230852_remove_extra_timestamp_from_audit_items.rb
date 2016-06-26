class RemoveExtraTimestampFromAuditItems < ActiveRecord::Migration
  def change
    remove_column :audit_items, :updated_at
  end
end
