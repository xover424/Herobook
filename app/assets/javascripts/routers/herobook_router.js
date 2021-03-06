Herobook.Routers.Router = Backbone.Router.extend({
  initialize: function(options) {
    this.$rootEl = options.$rootEl
    Herobook.Collections.users.fetch(); 
    Herobook.Models.currentUser = new Herobook.Models.CurrentUser();
  },

  routes: {
    '': 'feed',
    'feed': 'feed',
    'users/:id': 'show'
  },

  feed: function() {
    var currentUser = Herobook.Collections.users.getOrFetch(Herobook.Models.currentUser.get('id'));
    Herobook.Models.feed.fetch();
    Herobook.Collections.posts.fetch({data: {user_id: Herobook.Models.currentUser.get('id')}});
    var userFeedView = new Herobook.Views.FeedShow({model: Herobook.Models.feed, user: currentUser});
    this._swapView(userFeedView);
  },

  show: function(id) {
    var user = Herobook.Collections.users.getOrFetch(id);
    Herobook.Collections.notifications.fetch();
    Herobook.Collections.posts.fetch({data: {user_id: id}});
    var userShowView = new Herobook.Views.UserShow({model: user, feed: Herobook.Models.feed, posts: Herobook.Collections.posts});
    this._swapView(userShowView);   
  },

  _swapView: function(view) {
    this._currentView && this._currentView.remove();
    this._currentView = view;
    this.$rootEl.html(view.render().$el);
  }

})
