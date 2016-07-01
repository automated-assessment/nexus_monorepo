class DeadlineExtension < ActiveRecord::Base
  belongs_to :user
  belongs_to :assignment

  validates :extendeddeadline, presence: true
  validate :extension_must_be_temporally_after_deadline
  validate :not_duplicate?

  def extension_must_be_temporally_after_deadline
    errors.add(:extendeddeadline, 'Must be after the regular deadline') if extendeddeadline < assignment.deadline
  end

  def not_duplicate?
    errors.add(:user, 'already has an extension for this assignment') unless DeadlineExtension.where(user: user, assignment: assignment).empty?
  end
end
