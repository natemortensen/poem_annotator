class CreateAnnotations < ActiveRecord::Migration
  def change
    create_table :annotations do |t|
      t.string :annotate_id
      t.text :annotate_context
      t.text :content
      t.integer :user_id

      t.timestamps
    end
  end
end
