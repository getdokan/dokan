(function($, api) {
  api('dokan_appearance[store_map]', function(value) {
    value.bind(function(show) {
      var div = $('.dokan-store-widget.dokan-store-location');

      if (show) {
        div.show();
      } else {
        div.hide();
      }
    });
  });

  api.selectiveRefresh.bind('partial-content-rendered', function(placement) {
    console.log(placement);
  });
})(jQuery, wp.customize);
