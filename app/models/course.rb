class Course < ActiveRecord::Base
  belongs_to :teacher, class_name: 'User'
  has_and_belongs_to_many :students, class_name: 'User'
  has_many :assignments

  validates :title, presence: true
  validates :teacher, presence: true
  validate :teacher_cannot_be_student, unless: 'teacher.nil?'

  default_scope { order(:title) }

  def teacher_cannot_be_student
    errors.add(:teacher, 'teacher cannot be a student') unless teacher.admin?
  end
end
