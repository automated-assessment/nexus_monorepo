require 'rails_helper'

RSpec.describe Assignment, type: :model do
  describe 'model validations' do
    it 'has a valid factory' do
      expect(build(:assignment)).to be_valid
    end
    it 'is invalid without a title' do
      expect(build(:assignment, title: nil)).not_to be_valid
    end
    it 'is invalid without a start date' do
      expect(build(:assignment, start: nil, deadline: nil)).not_to be_valid
    end
    it 'is invalid without a deadline' do
      expect(build(:assignment, deadline: nil)).not_to be_valid
    end
    it 'is invalid without an associated course' do
      expect(build(:assignment, course: nil)).not_to be_valid
    end
    it 'is invalid with a deadline that is before the start date' do
      t = DateTime.now.utc
      expect(build(:assignment, start: t, deadline: t.ago(3600))).not_to be_valid
    end
  end
end
