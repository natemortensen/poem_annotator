class Poem < ActiveRecord::Base
	has_many :annotations
end
