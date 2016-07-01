Rails.application.routes.draw do
  ### Devise
  devise_for :users, skip: [:sessions, :registrations], controllers: { omniauth_callbacks: 'callbacks' }
  devise_scope :user do
    get 'users/login' => 'devise/sessions#new', as: :new_user_session
    get 'users/logout' => 'devise/sessions#destroy', as: :destroy_user_session
    post 'users/login' => 'devise/sessions#create', as: :user_session
  end

  ### Users
  get 'user/enrol/:id' => 'user#enrol', as: :enrol
  get 'user/unenrol/:id' => 'user#unenrol', as: :unenrol
  get 'userlist' => 'pages#user_list', as: :user_list
  get 'user/grant_admin/:id' => 'user#grant_admin', as: :user_grant_admin
  get 'user/revoke_admin/:id' => 'user#revoke_admin', as: :user_revoke_admin

  ### Courses
  get 'courses' => 'course#mine', as: :my_courses
  post 'courses/create' => 'course#create', as: :create_course
  get 'courses/new' => 'course#new', as: :new_course
  get 'courses/all' => 'course#index', as: :all_courses
  get 'courses/:id' => 'course#show', as: :course
  get 'courses/:id/list' => 'course#enrolment_list', as: :enrolment_list
  get 'courses/:id/edit' => 'course#edit', as: :edit_course
  patch 'courses/:id' => 'course#update', as: :update_course

  ### Assignments
  get 'assignments' => 'assignment#mine', as: :my_assignments
  get 'assignments/:id' => 'assignment#show', as: :assignment
  get 'assignments/:id/quick_config_confirm' => 'assignment#quick_config_confirm', as: :assignment_quick_config_confirm
  get 'assignments/:id/configure_tools' => 'assignment#configure_tools', as: :assignment_configure_tools
  post 'assignments/create' => 'assignment#create', as: :create_assignment
  get 'assignments/new/:cid' => 'assignment#new', as: :new_assignment
  get 'assignments/:id/edit' => 'assignment#edit', as: :edit_assignment
  patch 'assignments/:id' => 'assignment#update', as: :update_assignment
  get 'assignments/:id/export_submissions_data' => 'assignment#export_submissions_data', as: :assignment_export_submissions_data
  get 'assignments/:id/deadline_extensions' => 'assignment#show_deadline_extensions', as: :assignment_deadline_extensions

  ### Deadline Extensions
  get 'assignments/:aid/deadline_extensions/new' => 'deadline_extension#new', as: :new_deadline_extension
  post 'deadline_extensions/create' => 'deadline_extension#create', as: :create_deadline_extension
  get 'deadline_extensions/:id/edit' => 'deadline_extension#edit', as: :edit_deadline_extension
  patch 'deadline_extensions/:id/update' => 'deadline_extension#update', as: :update_deadline_extension
  get 'deadline_extensions/:id/destroy' => 'deadline_extension#destroy', as: :destroy_deadline_extension

  ### Submissions
  get 'submissions' => 'submission#mine', as: :my_submissions
  get 'submissions/:id' => 'submission#show', as: :submission
  post 'submissions/create/zip' => 'submission#create_zip', as: :create_zip_submission
  post 'submissions/create/git' => 'submission#create_git', as: :create_git_submission
  post 'submissions/create/ide' => 'submission#create_ide', as: :create_ide_submission
  get 'submissions/new/:aid' => 'submission#new', as: :new_submission
  get 'submissions/:id/edit_mark' => 'submission#edit_mark', as: :edit_mark_for_submission
  patch 'submissions/:id/override' => 'submission#override', as: :override_submission

  ### Access Tokens
  get 'tokens/new' => 'access_token#new', as: :new_access_token
  post 'tokens/create' => 'access_token#create', as: :create_access_token
  get 'tokens/revoke/:id' => 'access_token#revoke', as: :revoke_access_token
  get 'tokens/destroy/:id' => 'access_token#destroy', as: :destroy_access_token

  ### Marking Tools
  get 'marking_tools/new' => 'marking_tool#new', as: :new_marking_tool
  post 'marking_tools/create' => 'marking_tool#create', as: :create_marking_tool

  ### Audit Items
  get 'audit_items/all' => 'audit_item#all', as: :all_audit_items

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
