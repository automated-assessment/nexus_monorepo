class AccessTokenController < ApplicationController
  include ApplicationHelper

  def create
    return unless authenticate_admin!
    @access_token = AccessToken.new(access_token_params)
    @access_token.save!
    redirect_to admin_panel_path
  end

  def destroy
    return unless authenticate_admin!
    AccessToken.find(params[:id]).destroy
    flash[:success] = 'Access Token Revoked!'
    redirect_to admin_panel_path
  end

  def new
    return unless authenticate_admin!
    @access_token = AccessToken.new
  end

  def revoke
    return unless authenticate_admin!
    @access_token = AccessToken.find(params[:id])
  end

  private

  def access_token_params
    params.require(:access_token).permit(:description)
  end
end
