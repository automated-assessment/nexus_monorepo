class FeedbackItem < ActiveRecord::Base
  belongs_to :submission
  belongs_to :marking_tool

  validates :body, presence: true

  default_scope { order(created_at: :desc) }
end
