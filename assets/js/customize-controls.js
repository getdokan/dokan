(function(api) {
  /**
   * Run function when customizer is ready.
   */
  api.bind('ready', function() {
    api.section('dokan_store', function(section) {
      section.expanded.bind(function(isExpanded) {
        // console.log('dokan store expanded', isExpanded);
        // var url;
        // if (isExpanded) {
        //   url = api.settings.url.home;
        //   api.previewer.previewUrl.set(url);
        // }
      });
    });

    /**
     * Show hide controls if using theme sidebar
     */
    api.control('enable_theme_sidebar', function(control) {
      control.setting.bind(function(checked) {
        var display = checked ? false : true;

        api.control('sidebar_heading').active.set(display);
        api.control('store_map').active.set(display);
        api.control('contact_seller').active.set(display);
        api.control('store_open_close').active.set(display);
      });
    });
  });
})(wp.customize);
