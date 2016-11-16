require 'rails_helper'

RSpec.describe CourseHelper, type: :helper do
  describe '#user_can_administrate' do
    let(:s) { create(:student) }
    let(:t) { create(:staff) }
    let(:t2) { create(:staff) }
    let(:c) { create(:course, teacher: t) }

    it 'returns true for teachers' do
      expect(user_can_administrate(c, t)).to be true
    end
    it 'returns true for the teacher' do
      expect(user_can_administrate(c, t)).to be true
    end
    it 'returns false for students' do
      expect(user_can_administrate(c, s)).to be false
    end
  end
end
