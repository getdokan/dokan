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

        add_filter( 'appsero_custom_deactivation_reasons', [ $this, 'get_custom_deactivation_reasons' ] );
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

    /**
     * Gets custom deactivation reasons
     *
     * @since 3.0.14
     *
     * @param $reasons
     *
     * @return \array
     */
    public function get_custom_deactivation_reasons( $reasons ) {
        $reasons = [
            [
                'id'          => 'temporary-deactivation',
                'text'        => 'I’m Testing/Temporarily deactivating/Debugging',
                'placeholder' => '',
                'icon'        => '',
            ],
            [
                'id'          => 'upgrading-to-dokan-pro',
                'text'        => 'I’m Upgrading to Dokan Pro',
                'placeholder' => '',
                'icon'        => '',
            ],
            [
                'id'          => 'encountered-issue-with-plugin',
                'text'        => 'I encountered an issue with the plugin',
                'placeholder' => '',
                'icon'        => '',
            ],
            [
                'id'          => 'encountered-error-with-plugin',
                'text'        => 'I encountered an error with the plugin',
                'placeholder' => '',
                'icon'        => '',
            ],
            [
                'id'          => 'conflicting-with-something',
                'text'        => 'The plugin is conflicting with something',
                'placeholder' => '',
                'icon'        => '',
            ],

        ];
        return $reasons;
    }
}
