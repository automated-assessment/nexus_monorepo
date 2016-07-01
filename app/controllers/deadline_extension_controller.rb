class DeadlineExtensionController < ApplicationController
  include ApplicationHelper

  def create
    return unless authenticate_admin!
    @deadline_extension = DeadlineExtension.new(deadline_extension_params)

    if @deadline_extension.save
      flash[:success] = 'Deadline extension created!'
      redirect_to assignment_deadline_extensions_path(id: @deadline_extension.assignment.id)
    else
      flash[:error] = 'Error creating deadline extension'
      redirect_to action: 'new'
    end
  end

  def edit
    @deadline_extension = DeadlineExtension.find(params[:id])
  end

  def update
    return unless authenticate_admin!
    @deadline_extension = DeadlineExtension.find(params[:id])
    if @deadline_extension.update_attributes(deadline_extension_params)
      flash[:success] = 'Deadline extension updated'
      redirect_to assignment_deadline_extensions_path(id: @deadline_extension.assignment.id)
    else
      render 'edit'
    end
  end

  def destroy
    return unless authenticate_admin!
    @deadline_extension = DeadlineExtension.find(params[:id])

    @aid = @deadline_extension.assignment.id

    if @deadline_extension.destroy
      flash[:success] = 'Deadline extension revoked'
    else
      flash[:error] = 'Error revoking deadline extension'
    end
    redirect_to assignment_deadline_extensions_path(id: @aid)
  end

  def new
    return unless authenticate_admin!
    @deadline_extension = DeadlineExtension.new(assignment_id: params[:aid])
  end

  private

  def deadline_extension_params
    params.require(:deadline_extension).permit(:user_id, :assignment_id, :extendeddeadline)
  end
end
