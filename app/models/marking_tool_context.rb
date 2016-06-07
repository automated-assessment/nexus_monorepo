class MarkingToolContext < ActiveRecord::Base
  belongs_to :assignment
  belongs_to :marking_tool

  accepts_nested_attributes_for :marking_tool

  validates :weight, presence: true
end
