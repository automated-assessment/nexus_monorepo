class CallbacksController < Devise::OmniauthCallbacksController
  include ApplicationHelper

  def github
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user
      sign_in_and_redirect @user
    else
      redirect_to error_url '500', status: 500
    end
  end

  def github_com
    omniauth_data = request.env['omniauth.auth']

    authenticate_user!

    current_user.associate_github_com_data(omniauth_data)

    flash[:success] = 'Successfully associated your github.com profile.'
    redirect_to '/'
  end
end
