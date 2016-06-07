require 'rails_helper'

RSpec.describe CourseHelper, type: :helper do
  describe '#user_can_administrate' do
    let(:s) { create(:student) }
    let(:t) { create(:staff) }
    let(:t2) { create(:staff) }
    let(:a) { create(:admin) }
    let(:c) { create(:course, teacher: t) }

    it 'returns true for admins' do
      expect(user_can_administrate(c, a)).to be true
    end
    it 'returns true for the teacher' do
      expect(user_can_administrate(c, t)).to be true
    end
    it 'returns false for other teachers' do
      expect(user_can_administrate(c, t2)).to be false
    end
    it 'returns false for students' do
      expect(user_can_administrate(c, s)).to be false
    end
  end
end
