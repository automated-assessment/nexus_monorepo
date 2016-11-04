require 'rails_helper'
RSpec.describe User, type: :model do
  describe 'model validations' do
    it 'has a valid factory' do
      expect(build(:student)).to be_valid
    end
    it 'is invalid without an email' do
      expect(build(:student, email: nil)).not_to be_valid
    end
    # TODO This should be here
    #it 'is invalid without a name' do
    #  expect(build(:student, name: nil)).not_to be_valid
    #end
    it 'duplicate emails are invalid' do
      create(:student, email: 'alice@example.com')
      expect(build(:student, email: 'alice@example.com')).not_to be_valid
    end
  end

  describe 'methods' do
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
