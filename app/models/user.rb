class User < ActiveRecord::Base
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
  devise :database_authenticatable, :rememberable, :trackable, :validatable, :omniauthable

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.email = auth.info.email
      user.name = auth.info.name
      user.githubtoken = auth.credentials.token
      user.password = Devise.friendly_token[0, 20]
    end
  end

  has_and_belongs_to_many :courses
  has_many :assignments, through: :courses
  has_many :submissions

  def enrolled_in?(id)
    courses.find_by(id: id)
  end

  def submissions_for(aid)
    submissions.where(assignment_id: aid).all || {}
  end
end
