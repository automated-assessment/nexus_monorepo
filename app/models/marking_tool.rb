class MarkingTool < ActiveRecord::Base
  has_many :marking_tool_contexts
  has_many :assignments, through: :marking_tool_contexts
  has_many :intermediate_marks

  validates :name, presence: true
  validates :uid, presence: true
  validates :url, presence: true
  validates :requires_config, presence: true
  validates :config_url, presence: true, if: 'requires_config?'
end
