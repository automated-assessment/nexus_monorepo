class Course < ActiveRecord::Base
  belongs_to :teacher, class_name: 'User'
  has_and_belongs_to_many :students, class_name: 'User'
  has_many :assignments, dependent: :destroy
  has_many :audit_items

  validates :title, presence: true
  validates :teacher, presence: true
  validate :teacher_cannot_be_student

  default_scope { order(:title) }

  after_create do
    log("Course id #{id} (#{title}) created.")
  end

  after_update do
    log("Course id #{id} updated.")
  end

  def teacher_cannot_be_student
    if teacher
      errors.add(:error, 'teacher cannot be a student') unless teacher.admin?
    end
  end

  def log(body, level = 'info')
    AuditItem.create!(course: self,
                      body: body,
                      level: level)
  end
end
