class AccessTokenController < ApplicationController
  include ApplicationHelper
  before_action :authenticate_admin!

  def create
    @access_token = AccessToken.new(access_token_params)
    @access_token.save!
    redirect_to admin_panel_path
  end

  def destroy
    AccessToken.find(params[:id]).destroy
    flash[:success] = 'Access Token Revoked!'
    redirect_to admin_panel_path
  end

  def new
    @access_token = AccessToken.new
  end

  def revoke
    @access_token = AccessToken.find(params[:id])
  end

  private

  def access_token_params
    params.require(:access_token).permit(:description)
  end
end
