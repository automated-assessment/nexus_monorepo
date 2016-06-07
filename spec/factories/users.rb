FactoryGirl.define do
  factory :student, class: User do |f|
    pw = Faker::Number.number(16)
    f.password pw
    f.password_confirmation pw
    f.first_name { Faker::Name.first_name }
    f.last_name { Faker::Name.last_name }
    f.email { Faker::Internet.email }
    f.level 0
    f.student_id { Faker::Number.number(8).to_s + '/1' }
  end
  factory :staff, class: User do |f|
    pw = Faker::Number.number(16)
    f.password pw
    f.password_confirmation pw
    f.title { rand > 0.7 ? 'Prof.' : 'Dr.' }
    f.first_name { Faker::Name.first_name }
    f.last_name { Faker::Name.last_name }
    f.email { Faker::Internet.email }
    f.level 1
    f.student_id ''
  end
  factory :admin, class: User do |f|
    pw = Faker::Number.number(16)
    f.password pw
    f.password_confirmation pw
    f.first_name { Faker::Name.first_name }
    f.last_name { Faker::Name.last_name }
    f.email { Faker::Internet.email }
    f.level 2
    f.student_id ''
  end
end
