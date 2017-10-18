FactoryGirl.define do
  factory :feedback_item do
    body "<h4>Title</h4>\n<p>#{Faker::Lorem.paragraph}</p>\n"
  end
end
