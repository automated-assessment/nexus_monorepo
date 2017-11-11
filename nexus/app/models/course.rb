class Course < ActiveRecord::Base
  has_and_belongs_to_many :teachers, class_name: 'User', join_table: 'course_teaching_teams'
  has_and_belongs_to_many :students, class_name: 'User'
  has_many :assignments, dependent: :destroy
  has_many :audit_items

  validates :title, presence: true
  validates :teachers, :length => { :minimum => 1 }

  default_scope { order(:title) }

  after_create do
    log("Course id #{id} (#{title}) created.")
  end

  after_update do
    log("Course id #{id} updated.")
  end

  def log(body, level = 'info')
    AuditItem.create!(course: self,
                      body: body,
                      level: level)
  end
end
