class CallbacksController < Devise::OmniauthCallbacksController
  include ApplicationHelper

  def github
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if (@user)
      sign_in_and_redirect @user
    else
      redirect_to(error_url '500')
    end
  end
end
