class AuditItemController < ApplicationController
  def all
    @audit_items = AuditItem.all
  end
end
