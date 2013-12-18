json.array!(@annotations) do |annotation|
  json.extract! annotation, :annotate_id, :annotate_context, :content
  json.annotate_editable annotation.users_match?(current_user)
  json.user_image annotation.user.image
  json.user_name annotation.user.name
end
