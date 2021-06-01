<?php

namespace WeDevs\Dokan\Product;

/**
* Admin Hooks
*
* @package dokan
*
* @since 3.0.0
*/
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        add_action( 'template_redirect', [ $this, 'bulk_product_status_change' ] );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'bulk_product_delete' ], 10, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'store_products_orderby' ], 10, 2 );
    }

    /**
     * Output the store product sorting options
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function store_products_orderby() {
        $show_default_orderby    = 'menu_order' === apply_filters( 'dokan_default_store_products_orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );
        $catalog_orderby_options = apply_filters(
            'woocommerce_catalog_orderby',
            array(
                'menu_order' => __( 'Default sorting', 'dokan-lite' ),
                'popularity' => __( 'Sort by popularity', 'dokan-lite' ),
                'rating'     => __( 'Sort by average rating', 'dokan-lite' ),
                'date'       => __( 'Sort by latest', 'dokan-lite' ),
                'price'      => __( 'Sort by price: low to high', 'dokan-lite' ),
                'price-desc' => __( 'Sort by price: high to low', 'dokan-lite' ),
            )
        );

        $default_orderby = wc_get_loop_prop( 'is_search' ) ? 'relevance' : apply_filters( 'dokan_default_store_products_orderby', get_option( 'woocommerce_default_catalog_orderby', '' ) );
        $orderby = isset( $_GET['orderby'] ) ? wc_clean( wp_unslash( $_GET['orderby'] ) ) : $default_orderby;

        if ( wc_get_loop_prop( 'is_search' ) ) {
            $catalog_orderby_options = array_merge( array( 'relevance' => __( 'Relevance', 'dokan-lite' ) ), $catalog_orderby_options );

            unset( $catalog_orderby_options['menu_order'] );
        }

        if ( ! $show_default_orderby ) {
            unset( $catalog_orderby_options['menu_order'] );
        }

        if ( ! wc_review_ratings_enabled() ) {
            unset( $catalog_orderby_options['rating'] );
        }

        if ( ! array_key_exists( $orderby, $catalog_orderby_options ) ) {
            $orderby = current( array_keys( $catalog_orderby_options ) );
        }
        ?>
        <form class="dokan-store-products-ordeby woocommerce-ordering" method="get">
            <select name="orderby" class="orderby" aria-label="<?php esc_attr_e( 'Shop order', 'dokan-lite' ); ?>">
                <?php foreach ( $catalog_orderby_options as $id => $name ) : ?>
                    <option value="<?php echo esc_attr( $id ); ?>" <?php selected( $orderby, $id ); ?>><?php echo esc_html( $name ); ?></option>
                <?php endforeach; ?>
            </select>
            <input type="hidden" name="paged" value="1" />
            <?php wc_query_string_form_fields( null, array( 'orderby', 'submit', 'paged', 'product-page' ) ); ?>
        </form>
        <?php
    }

    /**
     * Change bulk product status in vendor dashboard
     *
     * @since 2.8.6
     *
     * @return string
     */
    function bulk_product_status_change() {
        if ( ! current_user_can( 'dokan_delete_product' ) ) {
            return;
        }

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['security'] ) || ! wp_verify_nonce( sanitize_key( $post_data['security'] ), 'bulk_product_status_change' ) ) {
            return;
        }
        if ( ! isset( $post_data['status'] ) || ! isset( $post_data['bulk_products'] ) ) {
            return;
        }

        $status   = $post_data['status'];
        $products = $post_data['bulk_products'];

        // -1 means bluk action option value
        if ( $status === '-1' ) {
            return;
        }

        do_action( 'dokan_bulk_product_status_change', $status, $products );
    }

    /**
     * Bulk product delete
     *
     * @param string $action
     * @param object $products
     *
     * @return void
     */
    function bulk_product_delete( $action, $products ) {
        if ( 'delete' !== $action || empty( $products ) ) {
            return;
        }

        foreach ( $products as $product_id ) {
            if ( dokan_is_product_author( $product_id ) ) {
                dokan()->product->delete( $product_id, true );
            }
        }

        wp_redirect( add_query_arg( array( 'message' => 'product_deleted' ), dokan_get_navigation_url( 'products' ) ) );
        exit;
    }

}
