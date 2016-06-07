Rails.application.routes.draw do
  ### Devise
  devise_for :users, skip: [:sessions, :registrations]
  devise_scope :user do
    get 'user/register' => 'devise/registrations#new', as: :new_user_registration
    post 'user/register' => 'devise/registrations#create', as: :user_registration
    patch 'user' => 'devise/registrations#update'
    put 'user' => 'devise/registrations#update'
    delete 'user' => 'devise/registrations#destroy'

    get 'user/login' => 'devise/sessions#new', as: :new_user_session
    post 'user/login' => 'devise/sessions#create', as: :user_session
    get 'user/logout' => 'devise/sessions#destroy', as: :destroy_user_session
  end

  ### Users
  get 'user/profile' => 'user#profile', as: :user_profile
  get 'user/enrol/:id' => 'user#enrol', as: :enrol
  get 'user/unenrol/:id' => 'user#unenrol', as: :unenrol

  ### Courses
  get 'courses' => 'course#mine', as: :my_courses
  post 'courses/create' => 'course#create', as: :create_course
  get 'courses/new' => 'course#new', as: :new_course
  get 'courses/all' => 'course#index', as: :all_courses
  get 'courses/:id' => 'course#show', as: :course
  get 'courses/:id/list' => 'course#enrolment_list', as: :enrolment_list

  ### Assignments
  get 'assignments' => 'assignment#mine', as: :my_assignments
  get 'assignments/:id' => 'assignment#show', as: :assignment
  post 'assignments/create' => 'assignment#create', as: :create_assignment
  get 'assignments/new/:cid' => 'assignment#new', as: :new_assignment

  ### Submissions
  get 'submissions' => 'submission#mine', as: :my_submissions
  get 'submissions/:id' => 'submission#show', as: :submission
  post 'submissions/create' => 'submission#create', as: :create_submission
  get 'submissions/new/:aid' => 'submission#new', as: :new_submission

  ### Access Tokens
  get 'tokens/new' => 'access_token#new', as: :new_access_token
  post 'tokens/create' => 'access_token#create', as: :create_access_token
  get 'tokens/revoke/:id' => 'access_token#revoke', as: :revoke_access_token
  get 'tokens/destroy/:id' => 'access_token#destroy', as: :destroy_access_token

  ### Marking Tools
  get 'marking_tools/new' => 'marking_tool#new', as: :new_marking_tool
  post 'marking_tools/create' => 'marking_tool#create', as: :create_marking_tool

  ### Static Pages
  get 'pages/landing'

  ### Error pages
  match '/401', to: 'errors#unauthorized', via: :all
  match '/403', to: 'errors#forbidden', via: :all
  match '/404', to: 'errors#file_not_found', via: :all
  match '/422', to: 'errors#unprocessable', via: :all
  match '/500', to: 'errors#internal_server_error', via: :all

  ### Admin Panel
  get 'admin' => 'pages#admin_panel', as: :admin_panel

  ### Webhooks
  post 'report_mark/:sid/:tool_uid' => 'intermediate_mark#report', as: :report_mark
  post 'report_feedback/:sid/:tool_uid' => 'feedback_item#report', as: :report_feedback

  ### Root
  root 'pages#landing'
end
