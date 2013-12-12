json.array!(@annotations) do |annotation|
  json.extract! annotation, :annotate_id, :annotate_context, :content, :user_id
end
