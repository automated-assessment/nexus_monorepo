FactoryGirl.define do
  factory :course do
    title { Faker::Hacker.adjective.capitalize + ' ' + Faker::Hacker.noun.capitalize + ' ' + Faker::Hacker.ingverb.capitalize }
    description { Faker::Lorem.paragraph(12) }
    association :teacher, factory: :staff
  end
end
