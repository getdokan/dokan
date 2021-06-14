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
        add_action( 'wp_ajax_dokan_store_product_search_action', [ $this, 'store_product_search_action' ], 10, 2 );
    }

    /**
     * Callback for Ajax Action Initialization
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function store_product_search_action() {
        global $wpdb;

        $return_result              = array();
        $return_result['type']      = 'error';
        $return_result['data_list'] = '<li> ' . __( 'Products not found with this search', 'dokan-lite' ) . ' </li>';
        $output                     = '';
        $get_postdata               = $_POST;

        // _wpnonce check for an extra layer of security, the function will exit if it fails
        if ( ! isset( $get_postdata['_wpnonce'] ) || ! wp_verify_nonce( $get_postdata['_wpnonce'], 'dokan_store_product_search_nonce' ) ) {
            wp_send_json_error( __( 'Error: Nonce verification failed', 'dokan-lite' ) );
        }

        if ( isset( $get_postdata['search_term'] ) && ! empty( $get_postdata['search_term'] ) ) {
            $keyword  = wc_clean( wp_unslash( $get_postdata['search_term'] ) );
            $store_id = intval( wp_unslash( $get_postdata['store_id'] ) );

            $querystr = "SELECT DISTINCT $wpdb->posts.*
            FROM $wpdb->posts, $wpdb->postmeta
            WHERE $wpdb->posts.ID = $wpdb->postmeta.post_id
            AND (
                ($wpdb->postmeta.meta_key = '_sku' AND $wpdb->postmeta.meta_value LIKE '%{$keyword}%')
                OR
                ($wpdb->posts.post_content LIKE '%{$keyword}%')
                OR
                ($wpdb->posts.post_title LIKE '%{$keyword}%')
            )
            AND $wpdb->posts.post_status = 'publish'
            AND $wpdb->posts.post_type   = 'product'
            AND $wpdb->posts.post_author = $store_id
            ORDER BY $wpdb->posts.post_date DESC LIMIT 250";

            $query_results = $wpdb->get_results( $querystr );

            if ( ! empty( $query_results ) ) {
                foreach ( $query_results as $result ) {
                    $product    = wc_get_product( $result->ID );
                    $price      = wc_price( $product->get_price() );
                    $price_sale = $product->get_sale_price();
                    $stock      = $product->get_stock_status();
                    $sku        = $product->get_sku();
                    $categories = wp_get_post_terms( $result->ID, 'product_cat' );

                    if ( 'variable' === $product->get_type() ) {
                        $price = wc_price( $product->get_variation_price() ) . ' - ' . wc_price( $product->get_variation_price( 'max' ) );
                    }

                    $get_product_image = esc_url( get_the_post_thumbnail_url( $result->ID, 'thumbnail' ) );

                    if ( empty( $get_product_image ) && function_exists( 'wc_placeholder_img_src' ) ) {
                        $get_product_image = wc_placeholder_img_src();
                    }

                    $output .= '<li>';
                    $output .= '<a href="' . get_post_permalink( $result->ID ) . '">';
                    $output .= '<div class="dokan-ls-product-image">';
                    $output .= '<img src="' . $get_product_image . '">';
                    $output .= '</div>';
                    $output .= '<div class="dokan-ls-product-data">';
                    $output .= '<h3>' . $result->post_title . '</h3>';

                    if ( ! empty( $price ) ) {
                        $output .= '<div class="product-price">';
                        $output .= '<span class="dokan-ls-regular-price">' . $price . '</span>';
                        if ( ! empty( $price_sale ) ) {
                            $output .= '<span class="dokan-ls-sale-price">' . wc_price( $price_sale ) . '</span>';
                        }
                        $output .= '</div>';
                    }

                    if ( ! empty( $categories ) ) {
                        $output .= '<div class="dokan-ls-product-categories">';
                        foreach ( $categories as $category ) {
                            if ( $category->parent ) {
                                $parent  = get_term_by( 'id', $category->parent, 'product_cat' );
                                $output .= '<span>' . $parent->name . '</span>';
                            }
                            $output .= '<span>' . $category->name . '</span>';
                        }
                        $output .= '</div>';
                    }

                    if ( ! empty( $sku ) ) {
                        $output .= '<div class="dokan-ls-product-sku">' . esc_html__( 'SKU:', 'dokan-lite' ) . ' ' . $sku . '</div>';
                    }

                    $output .= '</div>';
                    $output .= '</a>';
                    $output .= '</li>';
                }
            }
        }

        if ( $output ) {
            $return_result['type']      = 'success';
            $return_result['data_list'] = $output;
        }

        echo wp_json_encode( $return_result );
        die();
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
            'dokan_store_product_catalog_orderby',
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
        $orderby = isset( $_GET['product_orderby'] ) ? wc_clean( wp_unslash( $_GET['product_orderby'] ) ) : $default_orderby;

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

        $store_user = dokan()->vendor->get( get_query_var( 'author' ) );
        $store_id   = $store_user->get_id();
        ?>
        <div class="dokan-store-products-filter-area dokan-clearfix">
            <form class="dokan-store-products-ordeby" method="get">
                <input type="text" name="product_name" class="product-name-search dokan-store-products-filter-search"  placeholder="<?php esc_attr_e( 'Enter product name', 'dokan-lite' ); ?>" autocomplete="off" data-store_id="<?php echo esc_attr( $store_id ); ?>">
                <div id="dokan-store-products-search-result" class="dokan-ajax-store-products-search-result"></div>
                <input type="submit" name="search_store_products" class="search-store-products dokan-btn-theme" value="<?php esc_attr_e( 'Search', 'dokan-lite' ); ?>">

                <select name="product_orderby" class="orderby orderby-search" aria-label="<?php esc_attr_e( 'Shop order', 'dokan-lite' ); ?>" onchange='if(this.value != 0) { this.form.submit(); }'>
                    <?php foreach ( $catalog_orderby_options as $id => $name ) : ?>
                        <option value="<?php echo esc_attr( $id ); ?>" <?php selected( $orderby, $id ); ?>><?php echo esc_html( $name ); ?></option>
                    <?php endforeach; ?>
                </select>
                <input type="hidden" name="paged" value="1" />
            </form>
        </div>
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
