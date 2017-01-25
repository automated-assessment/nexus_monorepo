class ServiceRelationship < ActiveRecord::Base
  belongs_to :parent, class_name: 'ActiveService'
  belongs_to :child, class_name: 'ActiveService'
end
