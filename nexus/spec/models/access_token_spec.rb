require 'rails_helper'

RSpec.describe AccessToken, type: :model do
  describe 'model validations' do
    it 'has a valid factory' do
      expect(build(:access_token)).to be_valid
    end
    it 'generates a non-nil token automatically' do
      a = build(:access_token)
      expect(a.access_token).not_to be nil
    end
  end
end
