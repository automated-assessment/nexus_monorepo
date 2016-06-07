require 'rails_helper'

RSpec.describe CourseController, type: :controller do
  let(:c) { create(:course) }
  let(:s) { create(:student) }
  let(:t) { create(:staff) }
  describe 'GET #index' do
    it 'returns http success when logged in' do
      sign_in s
      get :index
      expect(response).to have_http_status(:success)
    end
  end
  describe 'GET #mine' do
    it 'returns http success when logged in' do
      sign_in s
      get :mine
      expect(response).to have_http_status(:success)
    end
  end
  describe 'GET #show' do
    it 'returns http success when logged in for a valid course' do
      sign_in s
      get :show, id: c.id
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET #enrolment_list' do
    it 'returns http success when logged in for a valid course' do
      sign_in s
      get :enrolment_list, id: c.id
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET #new' do
    it 'returns http success when logged in as a memeber of staff' do
      sign_in t
      get :new
      expect(response).to have_http_status(:success)
    end
    it 'returns http unauthorized when logged in as a student' do
      sign_in s
      get :new
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST #create' do
    it 'returns http found when authorized and with valid parameters' do
      sign_in t
      post :create, course: attributes_for(:course)
      expect(response).to have_http_status(:found)
    end
    it 'raises error when logged in as a student' do
      sign_in s
      expect { post :create, course: attributes_for(:course) }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
