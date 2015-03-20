json.extract! @post, :id, :body, :author_id, :receiver_id, :created_at, :updated_at
json.author @post.find_author, :email
json.comments @post.comments do |comment|
	json.extract! comment, :id, :body, :author_id, :post_id, :created_at, :updated_at
	json.author comment.find_author, :email
end