class DeadlineExtension < ActiveRecord::Base
  belongs_to :student, class_name: 'User'
  belongs_to :assignment

  validates :extendeddeadline, presence: true
end
