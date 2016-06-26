class AuditItem < ActiveRecord::Base
  belongs_to :access_token
  belongs_to :assignment
  belongs_to :course
  belongs_to :feedback_item
  belongs_to :intermediate_mark
  belongs_to :marking_tool
  belongs_to :submission
  belongs_to :user

  validates :body, presence: true

  default_scope { reorder(timestamp: :desc) }
  scope :asc, -> { reorder(timestamp: :asc) }

  before_create do
    self.timestamp = DateTime.now.utc
    self.level = 'info' if level.nil?
  end
end
