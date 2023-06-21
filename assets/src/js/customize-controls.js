(function(api) {
  /**
   * Run function when customizer is ready.
   */
  api.bind('ready', function() {
    /**
     * Set if widget controls should show
     *
     * @param {bool} isActive
     */
    var widgetControlsVisibility = function(isActive) {
      api.control('sidebar_heading').active.set(isActive);
      api.control('store_map').active.set(isActive);
      api.control('contact_seller').active.set(isActive);
      api.control('store_open_close').active.set(isActive);
    };

    /**
     * Navigate to a store page when in "Store Page" section
     */
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
     * Show/hide controls when page layout changes
     */
    api.control('store_layout', function(control) {
      control.setting.bind(function(value) {
        var display = value !== 'full';

        api.control('enable_theme_sidebar').active.set(display);
        widgetControlsVisibility(display);
      });
    });

    /**
     * Show hide controls if using theme sidebar
     */
    api.control('enable_theme_sidebar', function(control) {
      control.setting.bind(function(checked) {
        var display = checked ? false : true;

        widgetControlsVisibility(display);
      });
    });
  });
})(wp.customize);
