FactoryGirl.define do
  factory :course do
    title { Faker::Hacker.adjective.capitalize + ' ' + Faker::Hacker.noun.capitalize + ' ' + Faker::Hacker.ingverb.capitalize }
    description { Faker::Lorem.paragraph(12) }
    after(:build) do |course|
      course.teachers << build(:staff)
    end
  end
end
