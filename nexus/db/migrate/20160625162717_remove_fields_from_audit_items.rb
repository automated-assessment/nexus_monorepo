class RemoveFieldsFromAuditItems < ActiveRecord::Migration
  def change
    remove_column :audit_items, :intermediate_mark_id
    remove_column :audit_items, :feedback_item_id
  end
end
