class Course < ActiveRecord::Base
  has_many :teaching_team_members
  has_many :teachers, through: :teaching_team_members, class_name: 'User', source: :user
  accepts_nested_attributes_for :teaching_team_members, reject_if: proc { |attributes| attributes[:user_id].blank? }

  has_and_belongs_to_many :students, class_name: 'User'

  has_many :assignments, dependent: :destroy
  has_many :audit_items

  validates :title, presence: true
  validates :teaching_team_members, :length => { :minimum => 1 }

  default_scope { order(:title) }

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

  # We cannot use accepts_nested_attributes_for as this would try to create new
  # User records on initialisation and requires id rather than teacher_id,
  # clashing with cocoon as far as I can tell, so we roll our own
  #
  # See also http://www.krisdigital.com/blog/2016/02/03/rails-adding-existing-records-with-nested-form-and-has_many-through/
  # for a related war story
  #
  # TODO FIXME Actually, the better solution will be to change the association into an explicit has_man through: association via a new TeachingTeamMember model
  # This should make cocoon work out of the box, with accepts_nested_attributes_for for the new model. It also opens up future possibilities for associating
  # different access rights with different TeachingTeamMembers (e.g., only allowing some of them to override marks or configure tools, etc.)
  #
  #def teachers_attributes=(attributes)
  #  attributes.each do |a|
      # Each a will be a key--value pair. We only care about the value partial
  #    value = a[1]

  #    if (value['_destroy'] && value['_destroy'] != 'false')
        # We're meant to remove this record from our association, using it's id field where available
  #      if (value['id'])
  #        teachers.delete(User.find(value['id']))
  #      end
  #    else
#
#      end
#    end

#        .map { | attr |  UATParameter.new(attr[1]['name'], attr[1]['type'].to_i, attr[1]['construct'], true) }

#  end
end
