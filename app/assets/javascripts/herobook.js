window.Herobook = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    var router = new Herobook.Routers.Router({$rootEl: $('#content')});

    $.ajax({
      type: "get",
      url: "/notifications/save_notifications",
      success: function () {
        Herobook.Collections.notifications.fetch();
      }
    });
    Herobook.Models.currentUser.fetch({
    	success: function () {
   			Backbone.history.start();
    	}
    });
  }
}


