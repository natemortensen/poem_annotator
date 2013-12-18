json.extract! @annotation, :annotate_id, :annotate_context, :content, :created_at
json.annotate_editable @annotation.users_match?(current_user)
json.user_image @annotation.user.image
json.user_name @annotation.user.name