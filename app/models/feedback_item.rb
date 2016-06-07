class FeedbackItem < ActiveRecord::Base
  belongs_to :submission
  belongs_to :marking_tool

  validates :body, presence: true
end
