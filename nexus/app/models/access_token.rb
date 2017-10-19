class AccessToken < ActiveRecord::Base
  has_many :audit_items
  before_create :generate_token

  after_create do
    log("Access token (#{description}) created.")
  end

  def log(body, level = 'info')
    AuditItem.create!(access_token: self,
                      body: body,
                      level: level)
  end

  private

  def generate_token
    self.access_token = SecureRandom.base64(32)
  end
end
