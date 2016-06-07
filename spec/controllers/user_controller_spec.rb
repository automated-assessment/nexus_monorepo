require 'rails_helper'

RSpec.describe UserController, type: :controller do
  describe 'GET #profile' do
    it 'returns http success when logged in' do
      sign_in
      get :profile
      expect(response).to have_http_status(:success)
    end
  end
  describe 'GET #enrol' do
    let(:s) { create(:student) }
    let(:c) { create(:course) }
    before(:each) do
      sign_in s
      get :enrol, id: c.id
    end
    it 'enrols the user to the course' do
      expect(s.enrolled_in? c.id).not_to be_nil
    end
    it 'redirects to course page for a valid course id' do
      expect(response).to redirect_to(c)
    end
  end
  describe 'GET #unenrol' do
    let(:s) { create(:student) }
    let(:c) { create(:course) }
    before(:each) do
      sign_in s
    end
    it 'unenrols the user from the course' do
      get :unenrol, id: c.id
      expect(s.enrolled_in? c.id).to be_nil
    end
    it 'is idempotent' do
      get :unenrol, id: c.id
      get :unenrol, id: c.id
      expect(s.enrolled_in? c.id).to be_nil
    end
    it 'redirects to courses index' do
      get :unenrol, id: c.id
      expect(response).to redirect_to(:all_courses)
    end
  end
end
