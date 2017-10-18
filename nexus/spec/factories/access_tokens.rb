FactoryGirl.define do
  factory :access_token do
    access_token SecureRandom.base64(32)
    description 'Demo Token'
  end
end
