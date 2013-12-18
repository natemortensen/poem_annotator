class Annotation < ActiveRecord::Base
	belongs_to :user
	belongs_to :poem

	def users_match?(current_user)
		current_user == user ? 1 : 0
	end
end
