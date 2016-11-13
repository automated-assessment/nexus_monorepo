class User < ActiveRecord::Base
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
  devise :database_authenticatable, :rememberable, :trackable, :validatable, :omniauthable

  def self.from_omniauth(auth)
    # Now searching by email as this seems to be the more robust indicator of identity
    user = where(provider: auth.provider, email: auth.info.email).first_or_create do |u|
      u.provider = auth.provider
      u.uid = auth.uid
      u.email = auth.info.email
      u.name = auth.info.name
      u.ghe_login = auth.extra.raw_info.login if auth.extra.raw_info.login
      u.githubtoken = auth.credentials.token
      u.ghe_profile_url = auth.extra.raw_info.html_url if auth.extra.raw_info.html_url
      u.password = Devise.friendly_token[0, 20]
    end

    # Update GHE information that might change over time
    # Not updating ghe login, hoping that the first one will have the k number :-)
    # uid might change if there's another data outage and backup mess-up
    user.uid = auth.uid
    # token might change if users revoke authorization on GHE and then re-authorize
    user.githubtoken = auth.credentials.token

    user
  end

  has_and_belongs_to_many :courses
  has_many :assignments, through: :courses
  has_many :submissions
  has_many :audit_items

  after_create do
    log("User id #{id} (uid #{uid}) '#{name}' created.")
  end

  def enrolled_in?(id)
    courses.find_by(id: id)
  end

  def submissions_for(aid)
    submissions.where(assignment_id: aid).all || {}
  end

  def log(body, level = 'info')
    AuditItem.create!(user: self,
                      body: body,
                      level: level)
  end
end
