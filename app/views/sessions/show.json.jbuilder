json.extract! @current_user, :id, :email, :password_digest, :session_token, :created_at, :updated_at

json.authoredPosts @current_user.authored_posts do |post|
	json.extract! post, :id, :body, :author_id, :receiver_id, :created_at, :updated_at
	json.author post.find_author, :email
	json.comments post.comments do |comment|
		json.extract! comment, :id, :body, :author_id, :post_id, :created_at, :updated_at
		json.author comment.find_author, :email
	end
end

json.receivedPosts @current_user.received_posts do |post|
	json.extract! post, :id, :body, :author_id, :receiver_id, :created_at, :updated_at
	json.author post.find_author, :email
	json.comments post.comments do |comment|
		json.extract! comment, :id, :body, :author_id, :post_id, :created_at, :updated_at
		json.author comment.find_author, :email
	end
end

json.outgoingRequests @current_user.outgoing_requests do |request|
	json.extract! request, :id, :requestor_id, :requestee_id, :created_at, :updated_at, :status
	json.requestor request.find_requestor, :email
end

json.incomingRequests @current_user.incoming_requests do |request|
	json.extract! request, :id, :requestor_id, :requestee_id, :created_at, :updated_at, :status
	json.requestor request.find_requestor, :email
end

json.allFriends @all_friends do |friend|
	json.extract! friend, :id, :email, :password_digest, :session_token, :created_at, :updated_at
	json.receivedPosts friend.received_posts do |post|
		json.extract! post, :id, :body, :author_id, :receiver_id, :created_at, :updated_at
		json.author post.find_author, :email
	end
	json.authoredPosts friend.authored_posts do |post|
		json.extract! post, :id, :body, :author_id, :receiver_id, :created_at, :updated_at
		json.author post.find_author, :email
	end
end