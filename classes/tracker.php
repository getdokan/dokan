<?php

/**
 * Dokan tracker
 *
 * @since 2.4.11
 * @since 2.8.7 Using AppSero\Insights for tracking
 */
class Dokan_Tracker {

    public $insights = null;

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

        $this->insights = new AppSero\Insights( '559bcc0d-21b4-4b34-8317-3e072badf46d', 'Dokan Multivendor Marketplace', DOKAN_FILE );

        $this->insights->add_extra(array(
            'products' => $this->insights->get_post_count( 'product' ),
            'orders'   => $this->get_order_count(),
            'is_pro'   => dokan()->is_pro_exists() ? 'Yes' : 'No',
        ));

        $this->insights->init_plugin();
    }

    /**
     * Get number of orders
     *
     * @return integer
     */
    protected function get_order_count() {
        global $wpdb;

        return (int) $wpdb->get_var( "SELECT count(ID) FROM $wpdb->posts WHERE post_type = 'shop_order' and post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded');");
    }
}
