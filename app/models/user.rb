class User < ActiveRecord::Base
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
  devise :database_authenticatable, :rememberable, :trackable, :validatable, :omniauthable

  def self.from_omniauth(auth)
    user_by_uid = find_or_create_authed_user(auth)

    logger.tagged('user-login')
          .debug { "OAuth login request. Found user #{user_by_uid.uid} (#{user_by_uid.name}) with email #{user_by_uid.email}.\nEmail from OAuth request was #{auth.info.email}." }

    if (user_by_uid.email != auth.info.email)
      # We assume that this is a login that was broken by GHE shutdown and try to recover it
      logger.tagged('user-login')
            .warn { "Email mismatch detected: #{user_by_uid.uid}." }
      user_by_uid.log("Email mismatch detected: Email is #{user_by_uid.email}, but was expecting #{auth.info.email} from OAuth request.", 'error')

      return update_user_records(user_by_uid, auth)
    else
      return user_by_uid
    end
  end

  def self.update_user_records(user_by_uid, auth)
    # 1. TODO Could add a check for date range for when user object was created

    # 2. Find alternative user by email (students cannot actually change their email address registered on GHE!)
    user_by_email = where(provider: auth.provider, email: auth.info.email)

    # 3. Correct user data
    if (user_by_email)
      logger.tagged('user-login')
            .debug { "Found alternative user object with correct email address: #{user_by_email.uid} (#{user_by_email.name})." }

      # 3.1.1 Mark currently found user's user id as invalid
      logger.tagged('user-login')
            .warn { "Resetting uid of user #{user_by_uid.uid} (#{user_by_uid.name}) with email #{user_by_uid.email} to 'INCONSISTENT'." }
      user_by_uid.log("Resetting uid from #{user_by_uid.uid} to 'INCONSISTENT'.", 'warning')
      user_by_uid.uid = 'INCONSISTENT'
      user_by_uid.save!

      # 3.1.2 Update alternative user's user id with GHE data
      logger.tagged('user-login')
            .warn { "Changing uid of user #{user_by_email.uid} (#{user_by_email.name}) to #{auth.uid} to adjust to GHE data." }
      user_by_email.log("Updating uid from #{user_by_email.uid} to #{auth.uid} to adjust to GHE data.", 'warning')
      user_by_email.uid = auth.uid
      user_by_email.save!

      # 3.1.3 Return alternative user
      return user_by_email
    else
      # Given that users cannot actually change their email addresses on GHE,
      # this can only mean that a new user registered but was assigned an ID
      # from someone else. We need to create a new user record for this user
      # and then fix the record we found by accicent.
      logger.tagged('user-login')
            .debug { "Found no alternative user object. Creating new one." }

      # 3.2.1 Mark currently found user's user id as invalid
      logger.tagged('user-login')
            .warn { "Resetting uid of user #{user_by_uid.uid} (#{user_by_uid.name}) with email #{user_by_uid.email} to 'INCONSISTENT'." }
      user_by_uid.log("Resetting uid from #{user_by_uid.uid} to 'INCONSISTENT'.", 'warning')
      user_by_uid.uid = 'INCONSISTENT'
      user_by_uid.save!

      # 3.2.2 Try creating a user again
      new_user_object = find_or_create_authed_user(auth)
      logger.tagged('user-login')
            .warn { "Created new user object: #{new_user_object.uid} (#{new_user_object.name}) with email #{new_user_object.email}." }

      # 3.2.3 Double check email, just in case
      unless (new_user_object.email != auth.info.email)
        logger.tagged('user-login')
              .warn { "Switched to new user object #{new_user_object.uid} (#{new_user_object.name})." }

        return new_user_object
      else
        # Something has gone seriously wrong
        logger.tagged('user-login')
              .fatal { "New user object still doesn't have correct email address: Should be #{auth.info.email}, but is #{new_user_object.email}." }

        return nil
      end
    end
  end

  def self.find_or_create_authed_user(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.email = auth.info.email
      user.name = auth.info.name
      user.ghe_login = auth.extra.raw_info.login if auth.extra.raw_info.login
      user.githubtoken = auth.credentials.token
      user.ghe_profile_url = auth.extra.raw_info.html_url if auth.extra.raw_info.html_url
      user.password = Devise.friendly_token[0, 20]
    end
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
