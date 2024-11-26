<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\ProductCategory\Helper;
use WC_Product;

defined( 'ABSPATH' ) || exit;

/**
 * Admin Hooks
 *
 * @since   3.0.0
 *
 * @package dokan
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
        add_action( 'dokan_store_profile_frame_after', [ $this, 'store_products_orderby' ], 30, 2 );
        add_action( 'wp_ajax_dokan_store_product_search_action', [ $this, 'store_product_search_action' ], 10, 2 );
        add_action( 'wp_ajax_nopriv_dokan_store_product_search_action', [ $this, 'store_product_search_action' ], 10, 2 );
        add_action( 'woocommerce_product_quick_edit_save', [ $this, 'update_category_data_for_bulk_and_quick_edit' ], 10, 1 );
        add_action( 'woocommerce_product_bulk_edit_save', [ $this, 'update_category_data_for_bulk_and_quick_edit' ], 10, 1 );
        add_action( 'woocommerce_new_product', [ $this, 'update_category_data_for_new_and_update_product' ], 10, 1 );
        add_action( 'woocommerce_update_product', [ $this, 'update_category_data_for_new_and_update_product' ], 10, 1 );
        add_filter( 'dokan_post_status', [ $this, 'set_product_status' ], 1, 2 );
        add_filter( 'dokan_product_edit_meta_data', [ $this, 'set_new_product_email_status' ], 1, 3 );

        // Remove product type filter if pro not exists.
        add_filter( 'dokan_product_listing_filter_args', [ $this, 'remove_product_type_filter' ] );
        add_action( 'woocommerce_before_single_product', [ $this, 'own_product_not_purchasable_notice' ] );
        // product review action hook
        add_action( 'comment_notification_recipients', [ $this, 'product_review_notification_recipients' ], 10, 2 );
        // Init Product Cache Class
        new VendorStoreInfo();
        new ProductCache();
    }

    /**
     * Callback for Ajax Action Initialization
     *
     * @since DOKAN_LITE_SINCE
     * @return void
     */
    public function store_product_search_action() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_store_product_search_nonce' ) ) {
            wp_send_json_error( __( 'Error: Nonce verification failed', 'dokan-lite' ) );
        }

        global $wpdb;

        $return_result              = [];
        $return_result['type']      = 'error';
        $return_result['data_list'] = '<li> ' . __( 'Products not found with this search', 'dokan-lite' ) . ' </li>';
        $output                     = '';

        if ( ! isset( $_POST['search_term'] ) || empty( $_POST['search_term'] ) || ! isset( $_POST['store_id'] ) ) {
            die();
        }

        $keyword  = wc_clean( wp_unslash( $_POST['search_term'] ) ); //phpcs:ignore
        $store_id = intval( wp_unslash( $_POST['store_id'] ) ); //phpcs:ignore
        // escaping keyword
        $keyword_escaped = '%' . $wpdb->esc_like( $keyword ) . '%';

        $querystr = $wpdb->prepare(
            "SELECT DISTINCT posts.ID
                FROM $wpdb->posts as posts, $wpdb->postmeta as postmeta
                WHERE posts.ID = postmeta.post_id
                AND (
                    (postmeta.meta_key = '_sku' AND postmeta.meta_value LIKE %s)
                    OR
                    (posts.post_content LIKE %s)
                    OR
                    (posts.post_title LIKE %s)
                )
                AND posts.post_status = 'publish'
                AND posts.post_type   = 'product'
                AND posts.post_author = %d
                ORDER BY posts.post_date DESC LIMIT 100",
            $keyword_escaped,
            $keyword_escaped,
            $keyword_escaped,
            $store_id
        );

        $query_results = apply_filters( 'dokan_store_product_search_results', $wpdb->get_results( $querystr ), $store_id, $keyword ); // phpcs:ignore

        if ( empty( $query_results ) ) {
            echo wp_json_encode( $return_result );
            die();
        }

        foreach ( $query_results as $result ) {
            $product    = wc_get_product( $result->ID );
            $price      = wc_price( $product->get_price() );
            $price_sale = $product->get_sale_price();
            $stock      = $product->get_stock_status();
            $sku        = $product->get_sku();
            $get_name   = $product->get_name();
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
            $output .= '<h3>' . $get_name . '</h3>';

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
                        $parent = get_term_by( 'id', $category->parent, 'product_cat' );
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
     * @return void
     */
    public function store_products_orderby() {
        $store_products = dokan_get_option( 'store_products', 'dokan_appearance' );

        if ( ! empty( $store_products['hide_product_filter'] ) ) {
            return;
        }

        $orderby_options = dokan_store_product_catalog_orderby();
        $store_user      = dokan()->vendor->get( get_query_var( 'author' ) );
        $store_id        = $store_user->get_id();
        ?>
        <div class="dokan-store-products-filter-area dokan-clearfix">
            <form class="dokan-store-products-ordeby" method="get">
                <input type="text" name="product_name" class="product-name-search dokan-store-products-filter-search"
                       placeholder="<?php esc_attr_e( 'Enter product name', 'dokan-lite' ); ?>" autocomplete="off"
                       data-store_id="<?php echo esc_attr( $store_id ); ?>">
                <div id="dokan-store-products-search-result" class="dokan-ajax-store-products-search-result"></div>
                <input type="submit" name="search_store_products" class="search-store-products dokan-btn-theme"
                       value="<?php esc_attr_e( 'Search', 'dokan-lite' ); ?>">

                <?php if ( is_array( $orderby_options['catalogs'] ) && isset( $orderby_options['orderby'] ) ) : ?>
                    <select name="product_orderby" class="orderby orderby-search"
                            aria-label="<?php esc_attr_e( 'Shop order', 'dokan-lite' ); ?>"
                            onchange='if(this.value != 0) { this.form.submit(); }'>
                        <?php foreach ( $orderby_options['catalogs'] as $id => $name ) : ?>
                            <option
                                value="<?php echo esc_attr( $id ); ?>" <?php selected( $orderby_options['orderby'], $id ); ?>><?php echo esc_html( $name ); ?></option>
                        <?php endforeach; ?>
                    </select>
                <?php endif; ?>
                <input type="hidden" name="paged" value="1" />
            </form>
        </div>
        <?php
    }

    /**
     * Change bulk product status in vendor dashboard
     *
     * @since 2.8.6
     * @return void
     */
    public function bulk_product_status_change() {
        if ( ! current_user_can( 'dokan_delete_product' ) ) {
            return;
        }

        if ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( sanitize_key( $_POST['security'] ), 'bulk_product_status_change' ) ) {
            return;
        }
        if ( ! isset( $_POST['status'] ) || ! isset( $_POST['bulk_products'] ) ) {
            return;
        }

        $status = sanitize_text_field( wp_unslash( $_POST['status'] ) );
        // -1 means bluk action option value
        if ( '-1' === $status ) {
            return;
        }

        $products = array_map( 'absint', wp_unslash( $_POST['bulk_products'] ) );

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
    public function bulk_product_delete( $action, $products ) {
        if ( 'delete' !== $action || empty( $products ) ) {
            return;
        }

        do_action( 'dokan_product_bulk_delete', $products );
        foreach ( $products as $product_id ) {
            if ( dokan_is_product_author( $product_id ) ) {
                dokan()->product->delete( $product_id, true );
            }
        }
        do_action( 'dokan_product_bulk_deleted', $products );

        wp_safe_redirect( add_query_arg( [ 'message' => 'product_deleted' ], dokan_get_navigation_url( 'products' ) ) );
        exit;
    }

    /**
     * Triggers when admin quick edits products or bulk edit products from admin panel.
     * we are auto selecting all category ancestors here.
     *
     * @since 3.6.4
     *
     * @param object $product
     *
     * @return void
     */
    public function update_category_data_for_bulk_and_quick_edit( $product ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( ! isset( $_REQUEST['woocommerce_quick_edit_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_REQUEST['woocommerce_quick_edit_nonce'] ), 'woocommerce_quick_edit_nonce' ) ) {
            return;
        }

        $this->update_product_categories( $product->get_id() );
    }

    /**
     * Triggers when admin saves/edits products.
     * we are auto selecting all category ancestors here.
     *
     * @since 3.6.4
     *
     * @param int $product_id
     *
     * @return void
     */
    public function update_category_data_for_new_and_update_product( $product_id ) {
        if ( ! is_admin() ) {
            return;
        }

        $this->update_product_categories( $product_id );
    }

    /**
     * Gets chosen categories and updated product categories.
     *
     * @since 3.6.4
     *
     * @param int $product_id
     *
     * @return void
     */
    private function update_product_categories( $product_id ) {
        $terms             = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
        $chosen_categories = Helper::generate_chosen_categories( $terms );

        Helper::set_object_terms_from_chosen_categories( $product_id, $chosen_categories );
    }

    /**
     * Set product edit status
     *
     * @since 3.8.2
     *
     * @param int   $product_id
     *
     * @param array $all_statuses
     *
     * @return array
     */
    public function set_product_status( $all_statuses, int $product_id ) {
        if ( ! is_user_logged_in() ) {
            return [
                'draft' => dokan_get_post_status( 'draft' ),
            ];
        }

        $user_id = get_current_user_id();
        if ( ! dokan_is_seller_trusted( $user_id ) ) {
            unset( $all_statuses['publish'] );
        } else {
            unset( $all_statuses['pending'] );
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return $all_statuses;
        }

        switch ( $product->get_status() ) {
            case 'pending':
                $all_statuses['pending'] = dokan_get_post_status( 'pending' );
                break;

            case 'publish':
                $all_statuses['publish'] = dokan_get_post_status( 'publish' );
                unset( $all_statuses['pending'] );
                break;
        }

        return $all_statuses;
    }

    /**
     * Set new product email status to false
     *
     * @since 3.8.2
     *
     * @param array $meta_data
     * @param WC_Product $product
     * @param bool $is_new_product
     *
     * @return array
     */
    public function set_new_product_email_status( array $meta_data, WC_Product $product, bool $is_new_product ) {
        if ( ! $is_new_product ) {
            return $meta_data;
        }

        $meta_data['_dokan_new_product_email_sent'] = 'no';

        return $meta_data;
    }

    /**
     * Remove product type filter if dokan pro does not exist.
     *
     * @since 3.8.2
     *
     * @param array $args
     *
     * @return array
     */
    public function remove_product_type_filter( $args ) {
        global $wp;

        if ( dokan_is_seller_dashboard() && isset( $wp->query_vars['products'] ) && ! function_exists( 'dokan_pro' ) ) {
            $args['product_types'] = '';
        }

        return $args;
    }

    /**
     * Display own product not punchable notice.
     *
     * @since 3.9.2
     *
     * @return void
     */
    public function own_product_not_purchasable_notice() {
        global $product;

        if ( ! dokan_is_product_author( $product->get_id() ) || 'auction' === $product->get_type() ) {
            return;
        }

        wc_print_notice( __( 'As this is your own product, the "Add to Cart" button has been removed. Please visit as a guest to view it.', 'dokan-lite' ), 'notice' );
    }

    /**
     * Filter the recipients of the product review notification.
     *
     * Right now, if someone leaves a review for a vendor product, the vendor is receiving a notification email.
     * This email notification should be sent to the admin instead of the vendor.
     *
     * @since 3.9.2
     *
     * @param array $emails
     * @param int   $comment_id
     *
     * @return array
     */
    public function product_review_notification_recipients( $emails, $comment_id ) {
        $comment = get_comment( $comment_id );

        $product = wc_get_product( $comment->comment_post_ID );
        if ( ! $product ) {
            // the comment is not for a product
            return $emails;
        }

        // Facilitate unsetting below without knowing the keys.
        $filtered_emails = array_flip( $emails );

        $vendor = dokan_get_vendor_by_product( $product->get_id() );
        if ( array_key_exists( $vendor->get_email(), $filtered_emails ) ) {
            unset( $filtered_emails[ $vendor->get_email() ] );
        }

        // revert the array flip
        $filtered_emails = array_flip( $filtered_emails );

        // get admin email
        $admin_email = get_option( 'admin_email' );
        if ( ! in_array( $admin_email, $filtered_emails, true ) ) {
            $filtered_emails[] = $admin_email;
        }

        return $filtered_emails;
    }
}
