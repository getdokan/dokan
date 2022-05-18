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
        add_action( 'wp_ajax_dokan_dummy_data_import_status', [ $this, 'import_dummy_data_status' ] );
        add_action( 'wp_ajax_dokan_dummy_data_import', [ $this, 'import_dummy_data' ] );
        add_action( 'wp_ajax_dokan_dummy_data_clear', [ $this, 'clear_dummy_data' ] );
    }

    public function import_dummy_data() {
        $_post_data = wp_unslash( $_POST );

        if ( ! isset( $_post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_post_data['nonce'] ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $csv_file_data   = wc_clean( $_post_data['csv_file_data'] );
        $vendor_products = isset( $csv_file_data['vendor_products'] ) ? $csv_file_data['vendor_products'] : [];
        $vendor_data     = isset( $csv_file_data['vendor_data'] ) ? $csv_file_data['vendor_data'] : [];
        $vendor_index    = isset( $csv_file_data['vendor_index'] ) ? absint( $csv_file_data['vendor_index'] ): 0;
        $total_vendors   = isset( $csv_file_data['total_vendors'] ) ? absint( $csv_file_data['total_vendors'] ) : 0;

        $created_vendor          = dokan()->dummy_data->create_dummy_vendor( $vendor_data );
        $created_products_result = dokan()->dummy_data->create_dummy_products_for_vendor( $created_vendor->id, $vendor_products );

        if ( $vendor_index + 1 >= $total_vendors ) {
            update_option( 'dokan_dummy_data_import_success', 'yes', true );
        }

        wp_send_json_success( [
            'result'       => $created_products_result,
            'vendor_index' => $vendor_index + 1,
        ] );
    }

    /**
     * Clears dokan dummy data.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function clear_dummy_data() {
        $_post_data = wp_unslash( $_POST );

        if ( ! isset( $_post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_post_data['nonce'] ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $result = dokan()->dummy_data->clear_all_dummy_data();
        delete_option( 'dokan_dummy_data_import_success' );

        wp_send_json_success( $result );
    }

    /**
     * Returns dokan import status.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function import_dummy_data_status() {
        wp_send_json_success( get_option( 'dokan_dummy_data_import_success', 'no' ) );
    }
}
