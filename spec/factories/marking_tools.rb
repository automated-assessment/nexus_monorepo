FactoryGirl.define do
  factory :marking_tool do
    name { "#{Faker::App.name} v#{Faker::App.version}" }
    uid { "#{name.downcase[/[a-z].../].gsub(/[^[a-z]]/, '')}-#{SecureRandom.hex(2)}" }
    description { Faker::Company.catch_phrase }
    url { Faker::Internet.url + '/?submission=%{sid}&assignment=%{aid}' }
  end
end
