Herobook.Views.PostShow = Backbone.CompositeView.extend({
  template: JST['posts/show'],

  tagName: 'article',

  className: 'post-feed-item',

  events: {
    'click button.delete-post': 'destroyPost',
    'click button.add-comment':'submitComment',
    'click button.like-post':'likePost',
    'click button.unlike-post':'unlikePost'
  },

  initialize: function(options) {
    this.user = options.user;
    this.posts = options.posts;
    this.feed = options.feed;
    this.isFeed = options.isFeed;
    this.lastComment = options.lastComment;
    this.isModal = options.isModal;
    this.transitioning = false;
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model.likes(), 'add remove', this.render);
    this.listenTo(this.model.comments(), 'add', this.addComment);
    this.listenTo(this.model.comments(), 'remove', this.removeComment); 
  },

  render: function() {
    var content = this.template({post: this.model, user: this.user, isFeed: this.isFeed, lastComment: this.lastComment, isModal: this.isModal});
    this.$el.html(content);
    this.renderComments();
    this.renderCommentForm();
    return this;
  },

  renderCommentForm: function() {
    var commentFormView = new Herobook.Views.CommentForm({model: this.model});
    this.$('.comment-form').html(commentFormView.render().$el);
  },

/////////////////////

  removeComment: function(comment) {
    var subviewToRemove = _.findWhere(this.subviews('.comments'), {model: comment});
    this.removeSubview('.comments', subviewToRemove);
  },

  addComment: function(comment) {
    var commentShowView = new Herobook.Views.CommentShow({model: comment, collection: this.model.comments(), user: this.user, post: this.model});
    this.addSubview('.comments', commentShowView);
  },

  renderComments: function() {
    this.emptySubviewContainer('.comments');
    this.model.comments().each(this.addComment.bind(this));
  },

//////////////////////

  submitComment: function(event) {
    event.preventDefault();
    var commentBody = this.$('input').val();
    var comment = new Herobook.Models.Comment({'body': commentBody, 'post_id': this.model.get('id')});
    var that = this;
    comment.save({}, {
      success: function() {
        that.model.comments().add(comment, {merge: true}); //Add to the comments of the post
      }
    });
  },

  destroyPost: function(event) {
    event.preventDefault();
    $article = $(event.currentTarget).parent(); //post disappears transition
    $article.addClass('disappeared'); //post disappears transition

    setTimeout(function () {
      var that = this;
      var modelID = this.model.get('id');
      this.model.destroy({
        success: function() {
          if (!that.isFeed) {
            that.posts.remove(that.model);
          } else {
            that.feed.feedPosts().remove(that.model);
          }         
        }
      });

      //Remove notification
      var notesToDestroy = Herobook.Collections.notifications.where({post_id: modelID});
      console.log("number of notes to destroy", notesToDestroy.length);
      notesToDestroy.forEach(function (notification) {
        notification.destroy({
          success: function () {
            Herobook.Collections.notifications.remove(notification);
            console.log("removing notification:", notification);
          }
        });
      });
    }.bind(this), 900);

  },

  likePost: function(event) {
    if (this.transitioning === false) {
      this.transitioning = true;
      event.preventDefault();
      var like = new Herobook.Models.Like({'author_id': Herobook.Models.currentUser.get('id'), 'likeable_id': this.model.get('id'), 'likeable_type': 'Post'});
      var that = this;
      this.model.set('likeStatus', 'liked');
      like.save({}, {
        success: function() {
          that.model.likes().add(like, {merge: true});
          that.transitioning = false;
        }
      });
    }
  },

  unlikePost: function(event) {
    if (this.transitioning === false) {
      this.transitioning = true; 
      event.preventDefault();
      var like = this.model.likes().findWhere({author_id: Herobook.Models.currentUser.get('id')});
      var that = this;
      this.model.set('likeStatus', 'unliked');
      like.destroy({
        success: function() {
            that.model.likes().remove(like);
            that.transitioning = false;
        }
      });

      //Remove notification
      Herobook.Collections.notifications.forEach(function (notification) {
        if (notification.get('class_name') == 'Post Like' && notification.get('post_id') == that.model.get('id')) {
          notification.destroy({
            success: function () {
              Herobook.Collections.notifications.remove(notification);
            }
          });
        }
      });
    }
  }

})
