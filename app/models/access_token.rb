class AccessToken < ActiveRecord::Base
  before_create :generate_token

  private

  def generate_token
    self.access_token = SecureRandom.base64(32)
  end
end
