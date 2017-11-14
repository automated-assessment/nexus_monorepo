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
      c = build(:course)
      c.teachers.delete_all
      expect(c).not_to be_valid
    end
  end
end
