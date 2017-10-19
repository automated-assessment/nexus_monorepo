class MarkingTool < ActiveRecord::Base
  has_many :marking_tool_contexts
  has_many :assignments, through: :marking_tool_contexts
  has_many :intermediate_marks
  has_many :audit_items

  validates :name, presence: true
  validates :uid, presence: true
  validates :url, presence: true
  validates :config_url, presence: true, if: 'requires_config?'

  scope :configurable, -> { where(requires_config: true) }

  after_create do
    log("Marking Tool (#{name}) created.")
  end

  def log(body, level = 'info')
    AuditItem.create!(marking_tool: self,
                      body: body,
                      level: level)
  end
end
