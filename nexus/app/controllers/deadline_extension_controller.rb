class DeadlineExtensionController < ApplicationController
  include ApplicationHelper

  def create
    @deadline_extension = DeadlineExtension.new(deadline_extension_params)
    if @deadline_extension.save
      return unless authenticate_can_administrate!(@deadline_extension.assignment.course)

      flash[:success] = 'Deadline extension created!'
      redirect_to assignment_deadline_extensions_path(id: @deadline_extension.assignment.id)
      @deadline_extension.assignment.log("Deadline Extension created for #{@deadline_extension.user.name} until #{strftime_uk @deadline_extension.extendeddeadline}")
    else
      render 'new'
    end
  end

  def edit
    @deadline_extension = DeadlineExtension.find(params[:id])
    authenticate_can_administrate!(@deadline_extension.assignment.course) if @deadline_extension
  end

  def update
    @deadline_extension = DeadlineExtension.find(params[:id])
    if @deadline_extension.update_attributes(deadline_extension_params)
      return unless authenticate_can_administrate!(@deadline_extension.assignment.course)

      flash[:success] = 'Deadline extension updated'
      redirect_to assignment_deadline_extensions_path(id: @deadline_extension.assignment.id)
      @deadline_extension.assignment.log("Deadline Extension updated for #{@deadline_extension.user.name} until #{strftime_uk @deadline_extension.extendeddeadline}")
    else
      render 'edit'
    end
  end

  def destroy
    @deadline_extension = DeadlineExtension.find(params[:id])
    if @deadline_extension
      return unless authenticate_can_administrate!(@deadline_extension.assignment.course)

      @assignment = @deadline_extension.assignment

      if @deadline_extension.destroy
        flash[:success] = 'Deadline extension revoked'
        @assignment.log("Deadline Extension revoked for #{@deadline_extension.user.name}")
      else
        flash[:error] = 'Error revoking deadline extension'
      end
      redirect_to assignment_deadline_extensions_path(id: @assignment.id)
    end
  end

  def new
    @deadline_extension = DeadlineExtension.new(assignment_id: params[:aid])
    authenticate_can_administrate!(@deadline_extension.assignment.course) if @deadline_extension
  end

  private

  def deadline_extension_params
    params.require(:deadline_extension).permit(:user_id, :assignment_id, :extendeddeadline)
  end
end
