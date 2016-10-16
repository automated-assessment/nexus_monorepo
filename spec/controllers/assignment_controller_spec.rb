require 'rails_helper'

RSpec.describe AssignmentController, type: :controller do
  let(:c) { create(:course) }
  let(:s) { create(:student) }
  let(:t) { create(:staff) }
  let(:a) { create(:assignment) }

  describe 'GET #new' do
    describe 'without admin permissions' do
      it 'returns a 302 status code' do
        sign_in s
        get :new, cid: c.id
        expect(response).to have_http_status 302
      end
    end

    describe 'with admin permissions' do
      describe 'with a valid associated course' do
        it 'instantiates a new assignment with valid default fields' do
          sign_in t
          assignment = FactoryGirl.build(:assignment)
          allow(Assignment).to receive_message_chain(:new).and_return(assignment)
          get :new, cid: c.id
          expect(assigns(:assignment)).to eq assignment
          expect(assignment.course_id).to eq c.id
          expect(assignment.start).to be_truthy
          expect(assignment.deadline).to be_truthy
          expect(assignment.latedeadline).to be_truthy
          expect(assignment.max_attempts).to eq 0
          expect(assignment.allow_late).to be true
          expect(assignment.late_cap).to eq 40
          expect(assignment.allow_zip).to be true
          expect(assignment.allow_git).to be true
          expect(assignment.allow_ide).to be true
        end
      end
      describe 'with an invalid associated course' do
        it 'returns a 400 status code' do
          sign_in t
          assignment = FactoryGirl.build(:assignment)
          allow(Assignment).to receive_message_chain(:new).and_return(assignment)
          get :new, cid: c.id + 1
          expect(response).to have_http_status 400
        end
      end
    end
  end

  describe 'POST #create' do
    describe 'without admin permissions' do
      it 'redirects and return a 302 status code' do
        sign_in s
        post :create, assignment: {
          title: a.title,
          description: a.description,
          start: a.start,
          deadline: a.deadline,
          allow_late: a.allow_late,
          late_cap: a.late_cap,
          latedeadline: a.latedeadline,
          course_id: c.id,
          allow_zip: a.allow_zip,
          allow_git: a.allow_git,
          allow_ide: a.allow_ide
        }
        expect(response).to have_http_status 302
      end
    end
    describe 'with admin permissions' do
      it 'creates a new assignment and redirects to assignment page' do
        sign_in t
        post :create, assignment: {
          title: a.title,
          description: a.description,
          start: a.start,
          deadline: a.deadline,
          allow_late: a.allow_late,
          late_cap: a.late_cap,
          latedeadline: a.latedeadline,
          course_id: c.id,
          allow_zip: a.allow_zip,
          allow_git: a.allow_git,
          allow_ide: a.allow_ide
        }
        expect(response).to have_http_status 302
        assignment = Assignment.find_by(id: a.id)
        expect(assignment).to be_truthy
      end
    end
  end

  describe 'GET #edit' do
  end

  describe 'POST #update' do
  end

  describe 'GET #show' do
    describe 'with a valid assignment id' do
      it 'shows the assignment with the given id' do
        sign_in s
        get :show, id: a.id
        expect(response).to have_http_status 200
        expect(response).to render_template(:show)
      end
    end
    describe 'with an invalid assignment id' do
      it 'returns a 400 error code' do
        sign_in s
        get :show, id: a.id + 1
        expect(response).to have_http_status 400
      end
    end
  end

  describe 'GET #show_deadline_extensions' do
  end

  describe 'GET #quick_config_confirm' do
  end

  describe 'GET #configure_tools' do
  end

  describe 'GET #export_submissions_data' do
  end

  describe 'GET #list_submissions' do
  end
end
