require 'rails_helper'
RSpec.describe User, type: :model do
  describe 'model validations' do
    it 'has a valid factory' do
      expect(build(:student)).to be_valid
    end
    it 'is invalid without an email' do
      expect(build(:student, email: nil)).not_to be_valid
    end
    it 'is invalid without a first name' do
      expect(build(:student, first_name: nil)).not_to be_valid
    end
    it 'is invalid without a last name' do
      expect(build(:student, last_name: nil)).not_to be_valid
    end
    it 'has a level defaulting to "student"' do
      user = build(:student)
      expect(user.level).to eq('student')
    end
    it 'duplicate emails are invalid' do
      create(:student, email: 'alice@example.com')
      expect(build(:student, email: 'alice@example.com')).not_to be_valid
    end
    it 'duplicate student IDs are invalid' do
      create(:student, student_id: '12312312')
      expect(build(:student, student_id: '12312312')).not_to be_valid
    end
  end
  describe 'methods' do
    describe '#full_name' do
      it 'returns user\'s full name as a string' do
        user = build(:student, first_name: 'Adam', last_name: 'Smith')
        expect(user.full_name).to eq('Adam Smith')
      end
    end
    describe '#level_string' do
      it 'returns "Student" for level 0' do
        user = build(:student)
        expect(user.level_string).to eq('Student')
      end
      it 'returns "Teaching Staff" for level 1' do
        user = build(:staff)
        expect(user.level_string).to eq('Teaching Staff')
      end
      it 'returns "Administrator" for level 2' do
        user = build(:admin)
        expect(user.level_string).to eq('Administrator')
      end
    end
    describe '#enrolled_in?' do
      it 'returns not nil if enrolled' do
        c = create(:course)
        s = create(:student)
        s.courses << c
        expect(s.enrolled_in? c.id).not_to be_nil
      end
      it 'returns nil if not enrolled' do
        c = create(:course)
        s = create(:student)
        expect(s.enrolled_in? c.id).to be_nil
      end
    end
  end
end
