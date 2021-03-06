Herobook.Models.Post = Herobook.Models.NewsfeedItem.extend({
  urlRoot: '/posts',

  comments: function() {
    if(!this._comments) {
      this._comments = new Herobook.Collections.Comments([], {post: this});
    }
    return this._comments;
  },

  likes: function() {
    if(!this._likes) {
      this._likes = new Herobook.Collections.Likes([], {post: this});
    }
    return this._likes;
  },

  parse: function(response) {
    if(response.comments) {
      this.comments().set(response.comments, {parse: true});
      delete response.comments;
    }

    if(response.likes) {
      this.likes().set(response.likes, {parse: true});
      delete response.likes;
    }

    var d = new Date(Date.parse(response.updated_at));

    response.myDate = d;
    return response;
  }

})
