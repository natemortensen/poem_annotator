class AnnotationsController < ApplicationController
  before_action :set_annotation

  # GET /annotations
  # GET /annotations.json
  def index
    @annotations = @poem.annotations
    respond_to do |format|
      format.json { render action: 'index', locals: {current_user: current_user} }
    end
  end

  # GET /annotations/1
  # GET /annotations/1.json
  def show
  end

  # POST /annotations
  # POST /annotations.json
  def create
    @annotation = @poem.annotations.build annotation_params.merge(user: current_user)

    respond_to do |format|
      if @annotation.save
        format.json { render action: 'show', status: :created, locals: {current_user: current_user} }
      else
        format.json { render json: @annotation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /annotations/1
  # PATCH/PUT /annotations/1.json
  def update
    respond_to do |format|
      if @annotation.update(annotation_params)
        format.json { head :no_content }
      else
        format.json { render json: @annotation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /annotations/1
  # DELETE /annotations/1.json
  def destroy
    current_user.annotations.find_by_annotate_id(params[:id]).destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_annotation
      @annotation = Annotation.find_by_annotate_id(params[:id])
      @poem = Poem.find_by_id(params[:poem_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def annotation_params
      params.require(:annotation).permit(:annotate_id, :annotate_context, :content)
    end
end
