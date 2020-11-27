<?php

namespace WeDevs\Dokan;

/**
 * Dokan tracker
 *
 * @since 2.4.11
 * @since 2.8.7 Using AppSero\Insights for tracking
 */
class Tracker {

    /**
     * Insights class
     *
     * @var \Appsero\Insights
     */
    public $insights = null;

    /**
     * Class constructor
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function __construct() {
        $this->appsero_init_tracker_dokan();
    }

    /**
     * Initialize the plugin tracker
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function appsero_init_tracker_dokan() {
        $client = new \Appsero\Client( '559bcc0d-21b4-4b34-8317-3e072badf46d', 'Dokan Multivendor Marketplace', DOKAN_FILE );

        $this->insights = $client->insights();

        $this->insights->add_extra(
            [
                'products'      => $this->insights->get_post_count( 'product' ),
                'orders'        => $this->get_order_count(),
                'is_pro'        => class_exists( 'Dokan_Pro' ) ? 'Yes' : 'No',
                'wc_version'    => function_exists( 'WC' ) ? WC()->version : null,
                'dokan_version' => DOKAN_PLUGIN_VERSION,
            ]
          );

        $this->insights->init_plugin();
    }

    /**
     * Get number of orders
     *
     * @return int
     */
    protected function get_order_count() {
        global $wpdb;

        return (int) $wpdb->get_var( "SELECT count(ID) FROM $wpdb->posts WHERE post_type = 'shop_order' and post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded');" );
    }
}
