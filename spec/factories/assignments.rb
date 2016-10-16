FactoryGirl.define do
  factory :assignment do
    title { Faker::Book.title + ' ' + ('A'..'D').to_a[rand(4)] }
    description { Faker::Hacker.say_something_smart }
    start { Faker::Time.between(DateTime.now.utc - 15.days, DateTime.now.utc + 36.days).beginning_of_hour }
    deadline { Faker::Time.between(start + 2.days, start + 62.days).beginning_of_hour }
    latedeadline { Faker::Time.between(deadline + 1.days, deadline + 7.days).beginning_of_hour }
    allow_late { rand > 0.2 }
    late_cap { 40 }
    allow_zip { true }
    allow_git { true }
    allow_ide { true }
    course
  end
end
