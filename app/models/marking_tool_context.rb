class MarkingToolContext < ActiveRecord::Base
  belongs_to :assignment
  belongs_to :marking_tool

  accepts_nested_attributes_for :marking_tool

  validates :weight, presence: true

  before_create :set_configured_flag

  has_closure_tree

  def set_configured_flag
    self.configured = true unless marking_tool.requires_config?
  end
end
