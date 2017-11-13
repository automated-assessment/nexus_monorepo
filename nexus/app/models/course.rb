class Course < ActiveRecord::Base
  has_many :teaching_team_members
  has_many :teachers, through: :teaching_team_members, class_name: 'User', source: :user
  accepts_nested_attributes_for :teaching_team_members, reject_if: proc { |attributes| attributes[:user_id].blank? }

  has_and_belongs_to_many :students, class_name: 'User'

  has_many :assignments, dependent: :destroy
  has_many :audit_items

  validates :title, presence: true
  validates :teaching_team_members, :length => { :minimum => 1 }

  after_create do
    log("Course id #{id} (#{title}) created.")
  end

  after_update do
    log("Course id #{id} updated.")
  end

  def taught_by?(user)
    teachers.exists?(user.id)
  end

  def log(body, level = 'info')
    AuditItem.create!(course: self,
                      body: body,
                      level: level)
  end
end
