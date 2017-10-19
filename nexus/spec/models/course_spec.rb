require 'rails_helper'

RSpec.describe Course, type: :model do
  describe 'model validations' do
    it 'has a valid factory' do
      expect(build(:course)).to be_valid
    end
    it 'is invalid without a title' do
      expect(build(:course, title: nil)).not_to be_valid
    end
    it 'is invalid without a teacher' do
      expect(build(:course, teacher: nil)).not_to be_valid
    end
    it 'is invalid with a student as the teacher' do
      s = build(:student)
      expect(build(:course, teacher: s)).not_to be_valid
    end
  end
end
