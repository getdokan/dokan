<?php

namespace WeDevs\Dokan\Order;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Ajax
 *
 * @since 3.10.3
 *
 * @package WeDevs\Dokan\Order
 */
class Ajax {
    /**
     * Class constructor
     *
     * @since 3.10.3
     *
     * @return void
     */
    public function __construct() {
        add_action( 'wp_ajax_dokan_search_downloadable_products', [ $this, 'search_downloadable_products' ] );
    }

    /**
     * Search downloadable products
     *
     * @since 3.10.3
     *
     * @return void
     */
    public function search_downloadable_products() {
        check_ajax_referer( 'search-downloadable-products', '_nonce' );

        $limit = absint( apply_filters( 'woocommerce_json_search_limit', 30 ) );
        if ( ! empty( $_GET['limit'] ) ) {
            $limit = absint( $_GET['limit'] );
        }

        $page = 1;
        if ( ! empty( $_GET['page'] ) ) {
            $page = absint( $_GET['page'] );
        }

        $term = isset( $_GET['q'] ) ? (string) wc_clean( wp_unslash( $_GET['q'] ) ) : '';
        $args = [
            'status'       => 'publish',
            'downloadable' => true,
            'author'       => dokan_get_current_user_id(),
            'page'         => $page,
            'limit'        => $limit,
        ];

        if ( is_numeric( $term ) ) {
            $args['include'] = (array) $term;
        } else {
            $args['s'] = $term;
        }

        $product_objects = wc_get_products( $args );

        $products = array();
        foreach ( $product_objects as $product_object ) {
            $products[ $product_object->get_id() ] = rawurldecode( wp_strip_all_tags( $product_object->get_formatted_name() ) );
        }

        wp_send_json( $products );
    }
}
