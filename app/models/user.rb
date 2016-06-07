class User < ActiveRecord::Base
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
  devise :database_authenticatable, :registerable, :rememberable, :trackable, :validatable

  enum level: { student: 0, staff: 1, admin: 2 }

  before_save { self.email = email.downcase }

  validates :email, presence: true,
                    format: { with: VALID_EMAIL_REGEX },
                    uniqueness: { case_sensitive: false }

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :level, presence: true
  validates :student_id, presence: true, uniqueness: true, if: :student?

  has_and_belongs_to_many :courses
  has_many :assignments, through: :courses
  has_many :submissions

  def enrolled_in?(id)
    courses.find_by(id: id)
  end

  def submissions_for(aid)
    submissions.where(assignment_id: aid).all || {}
  end

  def full_name
    "#{title}#{' ' unless title.eql?('')}#{first_name} #{last_name}"
  end

  def student?
    level == 'student'
  end

  def teacher?
    level == 'staff'
  end

  def admin?
    level == 'admin'
  end

  def level_string
    case level
    when 'student'
      'Student'
    when 'staff'
      'Teaching Staff'
    when 'admin'
      'Administrator'
    else
      'Unknown'
    end
  end

  def staff?
    level != 'student'
  end
end
