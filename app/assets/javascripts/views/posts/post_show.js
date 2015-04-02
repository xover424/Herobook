FacebookApp.Views.PostShow = Backbone.CompositeView.extend({
  template: JST['posts/show'],

  events: {
    'click button.delete-post': 'destroyPost',
    'click button.add-comment':'submitComment',
    'click button.like-post':'likePost',
    'click button.unlike-post':'unlikePost'

  },

  initialize: function(options) {
    this.user = options.user;
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model.likes(), 'add destroy', this.render);
    this.listenTo(this.model.comments(), 'add', this.addComment);
    this.listenTo(this.model.comments(), 'destroy', this.removeComment);
    console.log(this.model.comments());

  },

  render: function() {
    var content = this.template({post: this.model, user: this.user});
    this.$el.html(content);
    this.renderCommentForm();
    this.renderComments();
    return this;
  },

  renderCommentForm: function() {
    var commentFormView = new FacebookApp.Views.CommentForm({model: this.model});
    this.$('.comment-form').html(commentFormView.render().$el);
  },

/////////////////////

  removeComment: function(comment) {
    var subviewToRemove = _.findWhere(this.subviews('.comments'), {model: comment});
    this.removeSubview('.comments', subviewToRemove);
  },

  addComment: function(comment) {
    var commentShowView = new FacebookApp.Views.CommentShow({model: comment, collection: this.model.comments(), user: this.user, post: this.model});
    this.addSubview('.comments', commentShowView);
  },

  renderComments: function() {
    this.emptySubviewContainer('.comments');
    this.model.comments().each(this.addComment.bind(this));
  },

//////////////////////

  submitComment: function(event) {
    event.preventDefault();
    var that = this;
    var commentBody = this.$('input').val();
    var comment = new FacebookApp.Models.Comment({'body': commentBody, 'post_id': this.model.get('id')});
    comment.save({}, {
      success: function() {
        that.model.comments().add(comment, {merge: true}); //Add to the comments of the post
        FacebookApp.Models.currentUser.comments().add(comment, {merge: true});
        FacebookApp.Models.currentUser.posts().get(comment.get('post_id')).comments().add(comment, {merge: true});
        FacebookApp.Models.currentUser.newsfeedCommentedPosts().add(that.model, {merge: true});
        that.user.newsfeedCommentedPosts().add(that.model, {merge: true});
      }
    });
  },

  destroyPost: function(event) {
    event.preventDefault();
    var that = this;
    this.model.destroy({
      success: function() {
        FacebookApp.Models.currentUser.posts().remove(that.model);
        that.user.posts().remove(that.model);
      }
    });
  },

  likePost: function(event) {
    event.preventDefault();
    var like = new FacebookApp.Models.Like({'author_id': FacebookApp.Models.currentUser.get('id'), 'likeable_id': this.model.get('id'), 'likeable_type': 'Post'});
    var that = this;
    like.save({}, {
      success: function() {
        that.model.likes().add(like, {merge: true});
        FacebookApp.Models.currentUser.likes().add(like, {merge: true});
        FacebookApp.Models.currentUser.posts().get(like.get('likeable_id')).likes().add(like, {merge: true});
        that.model.set('likeStatus', 'liked');
        FacebookApp.Models.currentUser.posts().get(like.get('likeable_id')).set('likeStatus', 'liked');
        that.render();
      }
    });
  },

  unlikePost: function(event) {
    event.preventDefault();
    var like = this.model.likes().findWhere({author_id: FacebookApp.Models.currentUser.get('id')});
    var that = this;
    like.destroy({
      success: function() {
          that.model.set('likeStatus', 'unliked');
          FacebookApp.Models.currentUser.posts().get(like.get('likeable_id')).likes().remove(like, {merge: true});
          FacebookApp.Models.currentUser.posts().get(like.get('likeable_id')).set('likeStatus', 'unliked');
          FacebookApp.Models.currentUser.likes().remove(like, {merge: true});
          that.render();
      }
    });
  }


})
