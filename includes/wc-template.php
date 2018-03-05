<?php
/**
 * Injects seller name on cart and other areas
 *
 * @param array $item_data
 * @param array $cart_item
 * @return array
 */
function dokan_product_seller_info( $item_data, $cart_item ) {
    $seller_id =  get_post_field( 'post_author', $cart_item['data']->get_id() );
    $seller_info = dokan_get_store_info( $seller_id );

    $item_data[] = array(
        'name'  => __( 'Vendor', 'dokan-lite' ),
        'value' => $seller_info['store_name']
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
function dokan_seller_product_tab( $tabs) {

    $tabs['seller'] = array(
        'title'    => __( 'Vendor Info', 'dokan-lite' ),
        'priority' => 90,
        'callback' => 'dokan_product_seller_tab'
    );

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

    dokan_get_template_part('global/product-tab', '', array(
        'author' => $author,
        'store_info' => $store_info,
    ) );
}

/**
 * Show sub-orders on a parent order if available
 *
 * @param WC_Order $parent_order
 * @return void
 */
function dokan_order_show_suborders( $parent_order ) {

    $sub_orders = get_children( array(
        'post_parent' => dokan_get_prop( $parent_order, 'id'),
        'post_type'   => 'shop_order',
        'post_status' => array( 'wc-pending', 'wc-completed', 'wc-processing', 'wc-on-hold', 'wc-cancelled'  )
    ) );

    if ( ! $sub_orders ) {
        return;
    }

    $statuses = wc_get_order_statuses();

    dokan_get_template_part( 'sub-orders', '', array( 'sub_orders' => $sub_orders, 'statuses' => $statuses ) );
}

add_action( 'woocommerce_order_details_after_order_table', 'dokan_order_show_suborders' );

/**
 * Default seller image
 *
 * @return string
 */
function dokan_get_no_seller_image() {
    $image = DOKAN_PLUGIN_ASSEST. '/images/no-seller-image.png';

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

add_filter( 'woocommerce_my_account_my_orders_query', 'dokan_get_customer_main_order');

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
    $capability['capabilities'] = array( 'edit_post' => 'edit_product' );
    return $capability;
}

add_filter( 'woocommerce_register_post_type_product', 'dokan_manage_capability_for_woocommerce_product' );

/**
 * Author field for product quick edit
 *
 * @return void
 */
function dokan_author_field_quick_edit(){
    $admin_user = get_user_by( 'id', get_current_user_id() );
    $user_query = new WP_User_Query( array( 'role' => 'seller' ) );
    $sellers    = $user_query->get_results();
    ?>
    <div class="dokan-product-author-field">
        <label class="alignleft">
            <span class="title"><?php _e( 'Vendor', 'dokan-lite' ); ?></span>
            <span class="input-text-wrap">
                 <select name="dokan_product_author_override" id="dokan_product_author_override" class="">
                    <?php if ( ! $sellers ): ?>
                        <option value="<?php echo $admin_user->ID ?>"><?php echo $admin_user->display_name; ?></option>
                    <?php else: ?>
                        <option value="<?php echo $admin_user->ID; ?>"><?php echo $admin_user->display_name; ?></option>
                        <?php foreach ( $sellers as $key => $user): ?>
                            <option value="<?php echo $user->ID ?>"><?php echo $user->display_name; ?></option>
                        <?php endforeach ?>
                    <?php endif ?>
                </select>
            </span>
        </label>
    </div>
    <?php
}

add_action( 'woocommerce_product_quick_edit_end',  'dokan_author_field_quick_edit' );

/**
 * Assign value for quick edit data
 *
 * @param array $column
 * @param integer $post_id
 *
 * @return void
 */
function dokan_vendor_quick_edit_data( $column,$post_id ) {
    switch ( $column ) {
        case 'name' :
            ?>
            <div class="hidden dokan_vendor_id_inline" id="dokan_vendor_id_inline_<?php echo $post_id; ?>">
                <div id="dokan_vendor_id"><?php echo get_post_field( 'post_author', $post_id ); ?></div>
            </div>
            <?php
            break;
        default :
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
function dokan_save_quick_edit_vendor_data ( $product ){
    if ( isset( $_REQUEST['dokan_product_author_override'] ) ) {
        $vendor_id = esc_attr( $_REQUEST['dokan_product_author_override'] );
        wp_update_post( array( 'ID' => $product->get_id(), 'post_author' => $vendor_id  ) );
    }
}

add_action( 'woocommerce_product_quick_edit_save', 'dokan_save_quick_edit_vendor_data', 10, 1 );


