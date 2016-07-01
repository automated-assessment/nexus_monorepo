class DeadlineExtension < ActiveRecord::Base
  belongs_to :user
  belongs_to :assignment

  validates :extendeddeadline, presence: true
end
