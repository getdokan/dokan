<?php

namespace WeDevs\Dokan\DummyData;

/**
 * Dokan dummy data hooks class.
 *
 * @since DOKAN_SINCE
 */
class Hooks {

    /**
     * Class constructor loads automatically when class initiate.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'wp_ajax_dokan_dummy_data_import', [ $this, 'import_dummy_data' ] );
    }

    public function import_dummy_data() {
        $_post_data = wp_unslash( $_POST );

        if ( ! isset( $_post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_post_data['nonce'] ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $csv_file_data   = wc_clean( $_post_data['csv_file_data'] );
        $vendor_products = isset( $csv_file_data['vendor_products'] ) ? $csv_file_data['vendor_products'] : [];
        $vendor_data     = isset( $csv_file_data['vendor_data'] ) ? $csv_file_data['vendor_data'] : [];

        $created_vendor = dokan()->dummy_data->create_dummy_vendor( $vendor_data );
        $created_products_result = dokan()->dummy_data->create_dummy_products_for_vendor( $created_vendor->id, $vendor_products );

        wp_send_json_success( $created_products_result );
    }
}
