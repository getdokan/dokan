<?php
/**
 * Injects seller name on cart and other areas
 *
 * @param array $item_data
 * @param array $cart_item
 * @return array
 */
function dokan_product_seller_info( $item_data, $cart_item ) {
    $vendor = dokan_get_vendor_by_product( $cart_item['product_id'] );

    if ( ! $vendor ) {
        return $item_data;
    }

    $item_data[] = array(
        'name'  => __( 'Vendor', 'dokan-lite' ),
        'value' => $vendor->get_shop_name(),
    );

    return $item_data;
}

add_filter( 'woocommerce_get_item_data', 'dokan_product_seller_info', 10, 2 );

/**
 * Adds a seller tab in product single page
 *
 * @param array $tabs
 * @return array
 */
function dokan_seller_product_tab( $tabs ) {
    $tabs['seller'] = [
        'title'    => __( 'Vendor Info', 'dokan-lite' ),
        'priority' => 90,
        'callback' => 'dokan_product_seller_tab',
    ];

    return $tabs;
}

add_filter( 'woocommerce_product_tabs', 'dokan_seller_product_tab' );

/**
 * Prints seller info in product single page
 *
 * @global WC_Product $product
 * @param type $val
 */
function dokan_product_seller_tab( $val ) {
    global $product;

    $author_id  = get_post_field( 'post_author', $product->get_id() );
    $author     = get_user_by( 'id', $author_id );
    $store_info = dokan_get_store_info( $author->ID );

    dokan_get_template_part(
        'global/product-tab',
        '',
        [
            'author'     => $author,
            'store_info' => $store_info,
        ]
    );
}

/**
 * Show sub-orders on a parent order if available
 *
 * @param WC_Order $parent_order
 * @return void
 */
function dokan_order_show_suborders( $parent_order ) {
    $sub_orders = get_children(
        [
            'post_parent' => dokan_get_prop( $parent_order, 'id' ),
            'post_type'   => 'shop_order',
            'post_status' => array_keys( wc_get_order_statuses() ),
        ]
    );

    if ( ! $sub_orders ) {
        return;
    }

    $statuses = wc_get_order_statuses();

    dokan_get_template_part(
        'sub-orders',
        '',
        [
            'sub_orders' => $sub_orders,
            'statuses'   => $statuses,
        ]
    );
}

add_action( 'woocommerce_order_details_after_order_table', 'dokan_order_show_suborders' );

/**
 * Default seller image
 *
 * @return string
 */
function dokan_get_no_seller_image() {
    $image = DOKAN_PLUGIN_ASSEST . '/images/no-seller-image.png';

    return apply_filters( 'dokan_no_seller_image', $image );
}

/**
 * Override Customer Orders array
 *
 * @param post_arg_query array()
 *
 * @return array() post_arg_query
 */
function dokan_get_customer_main_order( $customer_orders ) {
    $customer_orders['post_parent'] = 0;

    return $customer_orders;
}

add_filter( 'woocommerce_my_account_my_orders_query', 'dokan_get_customer_main_order' );

/**
 * Add edit post capability to woocommerce proudct post type
 *
 * @since 2.6.9
 *
 * @param capability array
 *
 * @return capability array
 */
function dokan_manage_capability_for_woocommerce_product( $capability ) {
    $capability['capabilities'] = array(
        'edit_post' => 'edit_product',
    );

    return $capability;
}

add_filter( 'woocommerce_register_post_type_product', 'dokan_manage_capability_for_woocommerce_product' );

/**
 * Author field for product quick edit
 *
 * @return void
 */
function dokan_author_field_quick_edit() {
    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        return;
    }

    $admin_user = get_user_by( 'id', get_current_user_id() );
    $vendors    = dokan()->vendor->all(
        [
            'number'   => - 1,
            'role__in' => [ 'seller' ],
        ]
    );
    ?>
    <div class="dokan-product-author-field inline-edit-group">
        <label class="alignleft">
            <span class="title">
                <?php esc_html_e( 'Vendor', 'dokan-lite' ); ?>
            </span>
            <span class="input-text-wrap">
                <select name="dokan_product_author_override" id="dokan_product_author_override">
                    <?php if ( empty( $vendors ) ) : ?>
                        <option value="<?php echo esc_attr( $admin_user->ID ); ?>"><?php echo esc_html( $admin_user->display_name ); ?></option>
                    <?php else : ?>
                        <option value=""><?php esc_html_e( '— No change —', 'dokan-lite' ); ?></option>
                        <option value="<?php echo esc_attr( $admin_user->ID ); ?>"><?php echo esc_html( $admin_user->display_name ); ?></option>
                        <?php foreach ( $vendors as $key => $vendor ) : ?>
                            <option value="<?php echo esc_attr( $vendor->get_id() ); ?>"><?php echo ! empty( $vendor->get_shop_name() ) ? esc_html( $vendor->get_shop_name() ) : esc_html( $vendor->get_name() ); ?></option>
                        <?php endforeach ?>
                    <?php endif ?>
                </select>
            </span>
        </label>
    </div>

    <script>
        ;(function($){
            $('#the-list').on('click', '.editinline', function(){
                var post_id = $(this).closest('tr').attr('id');

                post_id = post_id.replace("post-", "");

                var $vendor_id_inline_data = $('#dokan_vendor_id_inline_' + post_id).find('#dokan_vendor_id').text(),
                    $wc_inline_data = $('#woocommerce_inline_' + post_id );

                $( 'select[name="dokan_product_author_override"] option', '.inline-edit-row' ).attr( 'selected', false ).change();
                $( 'select[name="dokan_product_author_override"] option[value="' + $vendor_id_inline_data + '"]' ).attr( 'selected', 'selected' ).change();
            });
        })(jQuery);
    </script>
    <?php
}

add_action( 'woocommerce_product_quick_edit_end', 'dokan_author_field_quick_edit' );
add_action( 'woocommerce_product_bulk_edit_end', 'dokan_author_field_quick_edit' );

/**
 * Assign value for quick edit data
 *
 * @param array $column
 * @param integer $post_id
 *
 * @return void
 */
function dokan_vendor_quick_edit_data( $column, $post_id ) {
    switch ( $column ) {
        case 'name':
            ?>
            <div class="hidden dokan_vendor_id_inline" id="dokan_vendor_id_inline_<?php echo esc_attr( $post_id ); ?>">
                <div id="dokan_vendor_id"><?php echo esc_html( get_post_field( 'post_author', $post_id ) ); ?></div>
            </div>
            <?php
            break;
        default:
            break;
    }
}

add_action( 'manage_product_posts_custom_column', 'dokan_vendor_quick_edit_data', 99, 2 );

/**
 * Save quick edit data
 *
 * @param object $product
 *
 * @return void
 */
function dokan_save_quick_edit_vendor_data( $product ) {
    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        return;
    }

    $get_data = wp_unslash( $_REQUEST );

    if ( ! isset( $get_data['woocommerce_quick_edit_nonce'] ) || ! wp_verify_nonce( sanitize_key( $get_data['woocommerce_quick_edit_nonce'] ), 'woocommerce_quick_edit_nonce' ) ) {
        return;
    }

    $posted_vendor_id = ! empty( $get_data['dokan_product_author_override'] ) ? (int) $get_data['dokan_product_author_override'] : 0;

    if ( ! $posted_vendor_id ) {
        return;
    }

    $vendor = dokan_get_vendor_by_product( $product );

    if ( ! $vendor ) {
        return;
    }

    if ( $posted_vendor_id === $vendor->get_id() ) {
        return;
    }

    dokan_override_product_author( $product, $posted_vendor_id );
}

add_action( 'woocommerce_product_quick_edit_save', 'dokan_save_quick_edit_vendor_data', 10, 1 );
add_action( 'woocommerce_product_bulk_edit_save', 'dokan_save_quick_edit_vendor_data', 10, 1 );

/**
 * Add go to vendor dashboard button to my account page
 *
 * @since 2.8.2
 *
 * @return string
 */
function dokan_set_go_to_vendor_dashboard_btn() {
    if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
        return;
    }

    printf(
        '<p><a href="%s" class="dokan-btn dokan-btn-theme vendor-dashboard" >%s</a></p>',
        esc_url( dokan_get_navigation_url() ),
        esc_html( apply_filters( 'dokan_set_go_to_vendor_dashboard_btn_text', __( 'Go to Vendor Dashboard', 'dokan-lite' ) ) )
    );
}

add_action( 'woocommerce_account_dashboard', 'dokan_set_go_to_vendor_dashboard_btn' );

/**
 * Attach vendor name into order details
 *
 * @param  int item_id
 *
 * @param  object order
 *
 * @since 2.8.3
 *
 * @return string
 */
function dokan_attach_vendor_name( $item_id, $order ) {
    $product_id = $order->get_product_id();

    if ( ! $product_id ) {
        return;
    }

    $vendor_id = get_post_field( 'post_author', $product_id );
    $vendor    = dokan()->vendor->get( $vendor_id );

    if ( ! is_object( $vendor ) ) {
        return;
    }

    printf( '<br>%s: <a href="%s">%s</a>', esc_html__( 'Vendor', 'dokan-lite' ), esc_url( $vendor->get_shop_url() ), esc_html( $vendor->get_shop_name() ) );
}

add_action( 'woocommerce_order_item_meta_start', 'dokan_attach_vendor_name', 10, 2 );

/**
 * Enable yoast seo breadcrums in dokan store page
 *
 * @param  array $crumbs
 *
 * @return array
 */
function enable_yoast_breadcrumb( $crumbs ) {
    if ( ! dokan_is_store_page() ) {
        return $crumbs;
    }

    $vendor    = dokan()->vendor->get( get_query_var( 'author' ) );
    $store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

    if ( $vendor->get_id() === 0 ) {
        return $crumbs;
    }

    $crumbs[1]['text']  = ucwords( $store_url );
    $crumbs[1]['url']   = site_url() . '/' . $store_url;
    $crumbs[2]['text']  = $vendor->get_shop_name();
    $crumbs[2]['url']   = $vendor->get_shop_url();

    return $crumbs;
}

add_filter( 'wpseo_breadcrumb_links', 'enable_yoast_breadcrumb' );

/**
 * Dokan add privacy policy
 *
 * @return string
 */
function dokan_add_privacy_policy() {
    echo '<div class="dokan-privacy-policy-text">';
    dokan_privacy_policy_text();
    echo '</div>';
}

add_action( 'dokan_contact_form', 'dokan_add_privacy_policy' );

/**
 * Unset unnecessary data
 *
 * @since 2.9.14
 */
add_action(
    'dokan_store_profile_saved',
    function ( $store_id, $settings ) {
        $store_info        = dokan_get_store_info( $store_id );
        $all_times         = isset( $store_info['dokan_store_time'] ) ? $store_info['dokan_store_time'] : false;
        $days              = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
        $is_status_unsated = false;

        if ( $all_times ) {
            foreach ( $days as $day => $value ) {
                if ( isset( $all_times[ $day ]['open'] ) ) {
                    $is_status_unsated = true;

                    unset( $all_times[ $day ]['open'] );
                }
            }
        }

        if ( $is_status_unsated ) {
            update_user_meta( $store_id, 'dokan_profile_settings', $store_info );
        }
    },
    99,
    2
);

/**
 * Remove store avatar set by ultimate member from store and store listing page
 *
 * @since 2.9.21
 */
add_action(
    'pre_get_avatar',
    function () {
        $page_id = get_queried_object_id();
        $page    = get_page( $page_id );

        if ( ! $page instanceof WP_Post ) {
            return;
        }

        if ( dokan_is_store_page() || dokan_is_store_listing() || has_shortcode( $page->post_content, 'dokan-stores' ) ) {
            remove_filter( 'get_avatar', 'um_get_avatar', 99999 );
        }
    }
);
