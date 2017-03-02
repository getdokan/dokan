<?php

/**
 * Dokan tracker
 *
 * @since 2.4.11
 */
class Dokan_Tracker extends WeDevs_Insights {

    public function __construct() {

        $notice = __( 'Want to help make <strong>Dokan</strong> even more awesome? Allow weDevs to collect non-sensitive diagnostic data and usage information. Enjoy <strong>20% discount</strong> on upgrades and add-on purchase.', 'dokan-lite' );

        parent::__construct( 'dokan', 'dokan-lite', DOKAN_FILE, $notice );
    }

    /**
     * Data we colelct
     *
     * @return array
     */
    protected function data_we_collect() {
        $core_data = parent::data_we_collect();
        $dokan_data = array(
            'Number of products and orders'
        );

        $data = array_merge( $core_data, $dokan_data );

        return $data;
    }

    /**
     * Check if this is the pro version
     *
     * @return boolean
     */
    private function is_pro_exists() {
        if ( file_exists( DOKAN_INC_DIR . '/pro/dokan-pro-loader.php' ) ) {
            return true;
        }

        return false;
    }

    /**
     * Get the extra data
     *
     * @return array
     */
    protected function get_extra_data() {
        $data = array(
            'products' => $this->get_post_count( 'product' ),
            'orders'   => $this->get_order_count(),
            'is_pro'   => $this->is_pro_exists() ? 'yes' : 'no'
        );

        return $data;
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
