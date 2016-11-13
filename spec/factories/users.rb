FactoryGirl.define do
  factory :student, class: User do |f|
    pw = Faker::Number.number(16)
    f.password pw
    f.password_confirmation pw
    f.name { Faker::Name.first_name }
    f.email { Faker::Internet.email }
  end
  factory :staff, class: User do |f|
    pw = Faker::Number.number(16)
    f.password pw
    f.password_confirmation pw
    f.name { Faker::Name.first_name }
    f.email { Faker::Internet.email }
    f.admin true
  end
end
