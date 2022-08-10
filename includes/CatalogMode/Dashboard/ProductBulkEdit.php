<?php

namespace WeDevs\Dokan\CatalogMode\Dashboard;

use WeDevs\Dokan\CatalogMode\Helper;

/**
 * ProductBulkEdit class
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode\Dashboard
 */
class ProductBulkEdit {
    /**
     * Class Constructor
     *
     * @since 3.6.4
     */
    public function __construct() {
        if ( ! Helper::is_enabled_by_admin() ) {
            return;
        }

        add_filter( 'dokan_bulk_product_statuses', [ $this, 'bulk_product_catalog_options' ], 22, 1 );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'save_bulk_edit_catalog_mode_data' ], 10, 2 );
        add_action( 'dokan_product_dashboard_errors', [ $this, 'display_product_update_message' ], 10, 1 );
    }

    /**
     * Add bulk edit status.
     *
     * @since 3.6.4
     *
     * @param array $bulk_statuses previous status.
     *
     * @return array
     */
    public function bulk_product_catalog_options( $bulk_statuses ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return $bulk_statuses;
        }

        return dokan_array_insert_after(
            $bulk_statuses,
            [
                'enable_catalog_mode'  => __( 'Enable Catalog Mode', 'dokan-lite' ),
                'disable_catalog_mode' => __( 'Disable Catalog Mode', 'dokan-lite' ),
            ],
            count( $bulk_statuses ) - 1
        );
    }

    /**
     * This method will enable/disable catalog mode feature for the selected products.
     *
     * @since 3.6.4
     *
     * @return void
     */
    public function save_bulk_edit_catalog_mode_data( $status, $product_ids ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return;
        }

        // check if we got the right bulk status
        if ( empty( $status ) || ! in_array( $status, [ 'enable_catalog_mode', 'disable_catalog_mode' ], true ) ) {
            return;
        }
        // keep count of updated products
        $count = 0;
        // loop through the products and update the status
        if ( ! empty( $product_ids ) ) {
            foreach ( $product_ids as $product_id ) {
                // get existing product data
                $catalog_mode_data = Helper::get_catalog_mode_data_by_product( $product_id );
                $count++;
                switch ( $status ) {
                    case 'enable_catalog_mode':
                        // if admin enabled catalog mode, then update the product data
                        if ( Helper::hide_add_to_cart_button_option_is_enabled_by_admin() ) {
                            $catalog_mode_data['hide_add_to_cart_button'] = 'on';
                        }
                        // if admin didn't enabled hide product price, set this value to off
                        if ( ! Helper::hide_product_price_option_is_enabled_by_admin() ) {
                            $catalog_mode_data['hide_product_price'] = 'off';
                        }
                        break;

                    case 'disable_catalog_mode':
                        $catalog_mode_data['hide_add_to_cart_button'] = 'off';
                        $catalog_mode_data['hide_product_price']      = 'off';
                        break;
                }
                // finally save catalog mode data
                update_post_meta( $product_id, '_dokan_catalog_mode', $catalog_mode_data );
            }
        }
        wp_safe_redirect(
            add_query_arg(
                [
                    'message' => 'catalog_product_updated',
                    'count'   => $count,
                ], dokan_get_navigation_url( 'products' )
            )
        );
        exit;
    }

    /**
     * This method will display a message to the vendor if the product update was successful via bulk edit.
     *
     * @since 3.6.4
     *
     * @param $type string
     *
     * @return void
     */
    public function display_product_update_message( $type ) {
        if ( 'catalog_product_updated' !== $type ) {
            return;
        }

        // get updated product count
        $count = isset( $_GET['count'] ) ? absint( wp_unslash( $_GET['count'] ) ) : 0; //phpcs:ignore
        // display message based on updated product count
        if ( $count > 0 ) {
            dokan_get_template_part(
                'global/dokan-success', '', [
                    'deleted' => true,
                    'message' => sprintf(
                    // translators: %d is product count.
                        _n( '%d product has been successfully updated.', '%d products have been successfully updated.', $count, 'dokan-lite' ),
                        number_format_i18n( $count )
                    ),
                ]
            );
        } else {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => true,
                    'message' => __( 'No product data has been updated.', 'dokan-lite' ),
                ]
            );
        }
    }
}
