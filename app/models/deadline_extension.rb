class DeadlineExtension < ActiveRecord::Base
  belongs_to :user
  belongs_to :assignment

  validates :extendeddeadline, presence: true
  validate :extension_must_be_temporally_after_deadline

  def extension_must_be_temporally_after_deadline
    errors.add(:extendeddeadline, 'Must be after the regular deadline') if extendeddeadline < assignment.deadline
  end
end
