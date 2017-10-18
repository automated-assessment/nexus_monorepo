require 'rails_helper'
require 'ostruct'
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
    describe '#from_omniauth' do
      auth = OpenStruct.new({
        provider: 'TEST',
        uid: 42,
        info: OpenStruct.new({
          email: 'alice@example.com',
          name:  'Alice'
        }),
        extra: OpenStruct.new({
          raw_info: OpenStruct.new({
            login: 'alice',
            html_url: 'http://TEST/alice'
          })
        }),
        credentials: OpenStruct.new({
          token: 'ABC'
        })
      })

      it 'correctly finds an existing user' do
        s = create(:student, email: 'alice@example.com', uid: 42)
        expect(User.from_omniauth(auth).equal?(s))
      end

      it 'correctly corrects inconsistent login data' do
        s1 = create(:student, email: 'alice@example.com', uid: 45)
        s2 = create(:student, email: 'bob@example.com', uid: 42)
        expect(User.from_omniauth(auth).equal?(s1))
        expect(s1.uid == 42)
        expect(s2.uid == 42)
      end

      it 'correctly creates a fresh user record' do
        s = create(:student, email: 'bob@example.com', uid: 42)
        u = User.from_omniauth(auth)
        expect(!u.equal?(s))
        expect(u.uid == 42)
        expect(u.email == 'alice@example.com')
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
