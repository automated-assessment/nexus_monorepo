class ActiveService < ActiveRecord::Base
  has_and_belongs_to_many :parents, class_name: 'ActiveService', join_table: :service_relationships, foreign_key: :child_id, association_foreign_key: :parent_id
  has_and_belongs_to_many :children, class_name: 'ActiveService', join_table: :service_relationships, foreign_key: :parent_id, association_foreign_key: :child_id
  belongs_to :assignment

  def add_child(active_service)
    children << active_service
    active_service.parents << self
  end
end
