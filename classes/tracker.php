<?php

/**
 * Dokan tracker
 *
 * @since 2.4.11
 * @since 2.8.7 Using AppSero\Insights for tracking
 */
class Dokan_Tracker {

    /**
     * Class constructor
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function __construct() {
        add_action( 'init', array( $this, 'appsero_init_tracker_dokan' ) );
    }

    /**
     * Initialize the plugin tracker
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function appsero_init_tracker_dokan() {
        if ( ! class_exists( 'AppSero\Insights' ) ) {
            require_once DOKAN_LIB_DIR . '/appsero/src/insights.php';
        }

        $insights = new AppSero\Insights( '559bcc0d-21b4-4b34-8317-3e072badf46d', 'Dokan Multivendor Marketplace', __FILE__ );

        $insights->init_plugin();
    }
}
