require 'rails_helper'

RSpec.describe CourseController, type: :controller do
  let(:c) { create(:course) }
  let(:s) { create(:student) }
  let(:t) { create(:staff) }
  describe 'GET #index' do
    it 'returns http success when logged in' do
      sign_in s
      get :index
      expect(response).to have_http_status :success
    end
  end
  describe 'GET #mine' do
    describe 'when logged in as a student' do
      it 'returns HTTP success' do
        sign_in s
        get :mine
        expect(response).to have_http_status :success
      end
    end
    describe 'when not logged in' do
      it 'redirects to the log in page' do
        get :mine
        expect(response).to have_http_status :redirect
        expect(response).to redirect_to new_user_session_path
      end
    end
  end

  describe 'GET #show' do
    describe 'with a valid course' do
      it 'returns HTTP success' do
        sign_in s
        get :show, id: c.id
        expect(response).to have_http_status(:success)
      end
    end
    describe 'with an invalid course' do
      it 'returns HTTP not found' do
        sign_in s
        get :show, id: c.id + 1
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'GET #enrolment_list' do
    describe 'without admin permissions' do
      it 'redirects and returns a 302 status code' do
        sign_in s
        get :enrolment_list, id: c.id
        expect(response).to have_http_status :redirect
      end
    end

    describe 'with admin permissions' do
      describe 'with a valid course' do
        it 'returns http success' do
          sign_in t
          get :enrolment_list, id: c.id
          expect(response).to have_http_status :success
        end
      end

      describe 'with an invalid course' do
        it 'returns HTTP not found' do
          sign_in t
          get :enrolment_list, id: c.id + 1
          expect(response).to have_http_status :not_found
        end
      end
    end
  end

  describe 'GET #new' do
    describe 'with admin permissions' do
      it 'returns HTTP success' do
        sign_in t
        get :new
        expect(response).to have_http_status :success
      end
    end

    describe 'without admin permissions' do
      it 'redirects and returns a 302 status code' do
        sign_in s
        get :new
        expect(response).to have_http_status :redirect
      end
    end
  end

  describe 'GET #edit' do
    describe 'with admin permissions' do
      describe 'with valid course id' do
        it 'returns the associated course' do
          sign_in t
          get :edit, id: c.id
          expect(response).to have_http_status :success
        end
      end

      describe 'with invalid course' do
        it 'sets the error flash and returns a 404 status code' do
          sign_in t
          get :edit, id: c.id + 1
          expect(response).to have_http_status :not_found
          expect(flash[:error]).not_to be_nil
        end
      end
    end

    describe 'without admin permissions' do
      it 'redirects and returns a 302 status code' do
        sign_in s
        get :edit, id: c.id
        expect(response).to have_http_status :redirect
      end
    end
  end

  describe 'POST #create' do
    describe 'with admin permissions' do
      describe 'with valid parameters' do
        it 'returns HTTP found' do
          sign_in t
          post :create, course: attributes_for(:course)
          expect(response).to have_http_status :found
        end
      end
    end

    describe 'without admin permissions' do
      it 'redirects and returns a 302 status code' do
        sign_in s
        post :create, course: attributes_for(:course)
        expect(response).to have_http_status :redirect
      end
    end
  end
end
