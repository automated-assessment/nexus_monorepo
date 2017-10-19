FactoryGirl.define do
  factory :submission do
    assignment
    association :user, factory: :student
  end
end
