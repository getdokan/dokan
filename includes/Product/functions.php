<?php
/**
 * Load all product related functions
 *
 * @since 2.5.1
 */

use WeDevs\Dokan\ProductCategory\Helper;

/**
 * Dokan insert new product
 *
 * @since      2.5.1
 *
 * @param array $args
 *
 * @deprecated DOKAN_SINCE
 *
 * @return \WP_Error|\WC_Product
 */
function dokan_save_product( $args ) {
    wc_deprecated_function( __FUNCTION__, 'DOKAN_SINCE', 'dokan()->product->create()' );

    try {
        return dokan()->product->create( $args );
    } catch ( Exception $e ) {
        return new WP_Error( $e->getCode(), $e->getMessage() );
    }
}

/**
 * Show options for the variable product type.
 *
 * @since 2.5.3
 *
 * @return void
 */
function dokan_product_output_variations() {
    global $post, $wpdb, $product_object;

    $product_object = wc_get_product( $post->ID );

    /* phpcs:disable WooCommerce.Commenting.CommentHooks.MissingHookComment */
    $variation_attributes   = array_filter(
        $product_object->get_attributes(), function ( $attribute ) {
			return true === $attribute->get_variation();
		}
    );
    $default_attributes     = $product_object->get_default_attributes();
    $variations_count       = absint( apply_filters( 'woocommerce_admin_meta_boxes_variations_count', $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_parent = %d AND post_type = 'product_variation' AND post_status IN ('publish', 'private', 'pending')", $post->ID ) ), $post->ID ) );
    $variations_per_page    = absint( apply_filters( 'dokan_product_variations_per_page', 15 ) );
    $variations_total_pages = ceil( $variations_count / $variations_per_page );

    // See if any are set
    $variation_attribute_found = count( $variation_attributes ) > 0;
    ?>
    <div id="dokan-variable-product-options" class="">
        <div id="dokan-variable-product-options-inner">
            <?php if ( ! $variation_attribute_found ) { ?>
                <div id="dokan-info-message" class="dokan-alert dokan-alert-info">
                    <p>
                        <?php echo wp_kses( __( 'Before you can add a variation, you need to add some variation attributes on the <strong>Attributes</strong> section', 'dokan-lite' ), [ 'strong' => [] ] ); ?>
                    </p>
                </div>
            <?php } else { ?>
                <div class="dokan-variation-top-toolbar">
                    <div class="dokan-variation-label content-half-part">
                        <div class="toolbar toolbar-top">
                            <select id="field_to_edit" class="variation-actions dokan-form-control dokan-w10">
                                <option data-global="true" value="add_variation"><?php esc_html_e( 'Add variation', 'dokan-lite' ); ?></option>
                                <option data-global="true" value="link_all_variations"><?php esc_html_e( 'Create variations from all attributes', 'dokan-lite' ); ?></option>
                                <option value="delete_all"><?php esc_html_e( 'Delete all variations', 'dokan-lite' ); ?></option>
                                <optgroup label="<?php esc_attr_e( 'Status', 'dokan-lite' ); ?>">
                                    <option value="toggle_enabled"><?php esc_html_e( 'Toggle &quot;Enabled&quot;', 'dokan-lite' ); ?></option>
                                    <option value="toggle_downloadable"><?php esc_html_e( 'Toggle &quot;Downloadable&quot;', 'dokan-lite' ); ?></option>
                                    <option value="toggle_virtual"><?php esc_html_e( 'Toggle &quot;Virtual&quot;', 'dokan-lite' ); ?></option>
                                </optgroup>
                                <optgroup label="<?php esc_attr_e( 'Pricing', 'dokan-lite' ); ?>">
                                    <option value="variable_regular_price"><?php esc_html_e( 'Set regular prices', 'dokan-lite' ); ?></option>
                                    <option value="variable_regular_price_increase"><?php esc_html_e( 'Increase regular prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                    <option value="variable_regular_price_decrease"><?php esc_html_e( 'Decrease regular prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                    <option value="variable_sale_price"><?php esc_html_e( 'Set sale prices', 'dokan-lite' ); ?></option>
                                    <option value="variable_sale_price_increase"><?php esc_html_e( 'Increase sale prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                    <option value="variable_sale_price_decrease"><?php esc_html_e( 'Decrease sale prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                    <option value="variable_sale_schedule"><?php esc_html_e( 'Set scheduled sale dates', 'dokan-lite' ); ?></option>
                                </optgroup>
                                <optgroup label="<?php esc_attr_e( 'Inventory', 'dokan-lite' ); ?>">
                                    <option value="toggle_manage_stock"><?php esc_html_e( 'Toggle &quot;Manage stock&quot;', 'dokan-lite' ); ?></option>
                                    <option value="variable_stock"><?php esc_html_e( 'Stock', 'dokan-lite' ); ?></option>
                                </optgroup>
                                <optgroup label="<?php esc_attr_e( 'Shipping', 'dokan-lite' ); ?>">
                                    <option value="variable_length"><?php esc_html_e( 'Length', 'dokan-lite' ); ?></option>
                                    <option value="variable_width"><?php esc_html_e( 'Width', 'dokan-lite' ); ?></option>
                                    <option value="variable_height"><?php esc_html_e( 'Height', 'dokan-lite' ); ?></option>
                                    <option value="variable_weight"><?php esc_html_e( 'Weight', 'dokan-lite' ); ?></option>
                                </optgroup>
                                <optgroup label="<?php esc_attr_e( 'Downloadable products', 'dokan-lite' ); ?>">
                                    <option value="variable_download_limit"><?php esc_html_e( 'Download limit', 'dokan-lite' ); ?></option>
                                    <option value="variable_download_expiry"><?php esc_html_e( 'Download expiry', 'dokan-lite' ); ?></option>
                                </optgroup>
                                <?php do_action( 'dokan_variable_product_bulk_edit_actions' ); ?>
                            </select>
                            <a class="dokan-btn dokan-btn-default do_variation_action"><?php esc_html_e( 'Go', 'dokan-lite' ); ?></a>
                        </div>
                    </div>

                    <div class="dokan-variation-default-toolbar content-half-part">
                        <div class="dokan-variations-defaults">
                            <span class="dokan-variation-default-label dokan-left float-none">
                                <i
                                    class="fas fa-question-circle tips"
                                    title="<?php esc_attr_e( 'Default Form Values: These are the attributes that will be pre-selected on the frontend.', 'dokan-lite' ); ?>"
                                    aria-hidden="true">
                                </i>
                            </span>
                            <?php
                            foreach ( $variation_attributes as $attribute ) {
                                $selected_value = isset( $default_attributes[ sanitize_title( $attribute->get_name() ) ] ) ? $default_attributes[ sanitize_title( $attribute->get_name() ) ] : '';
                                ?>
                                <div class="dokan-variation-default-select dokan-w5 float-none">
                                    <select class="dokan-form-control" name="default_attribute_<?php echo esc_attr( sanitize_title( $attribute->get_name() ) ); ?>" data-current="<?php echo esc_attr( $selected_value ); ?>">
                                        <?php /* translators: WooCommerce attribute label */ ?>
                                        <option value=""><?php echo esc_html( sprintf( __( 'No default %s&hellip;', 'dokan-lite' ), wc_attribute_label( $attribute->get_name() ) ) ); ?></option>
                                        <?php if ( $attribute->is_taxonomy() ) : ?>
                                            <?php foreach ( $attribute->get_terms() as $option ) : ?>
                                                <?php /* phpcs:disable WooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
                                                <option <?php selected( $selected_value, $option->slug ); ?>
                                                    value="<?php echo esc_attr( $option->slug ); ?>"><?php echo esc_html( apply_filters( 'woocommerce_variation_option_name', $option->name, $option, $attribute->get_name(), $product_object ) ); ?></option>
                                                <?php /* phpcs:enable */ ?>
                                            <?php endforeach; ?>
                                        <?php else : ?>
                                            <?php foreach ( $attribute->get_options() as $option ) : ?>
                                                <?php /* phpcs:disable WooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
                                                <option <?php selected( $selected_value, $option ); ?>
                                                    value="<?php echo esc_attr( $option ); ?>"><?php echo esc_html( apply_filters( 'woocommerce_variation_option_name', $option, null, $attribute->get_name(), $product_object ) ); ?></option>
                                                <?php /* phpcs:enable */ ?>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </select>
                                </div>
                                <?php
                            }
                            ?>
                            <div class="dokan-clearfix"></div>
                        </div>
                    </div>
                    <div class="dokan-clearfix"></div>
                </div>
                <div
                    class="dokan-variations-container wc-metaboxes"
                    data-attributes="
                    <?php
                    echo esc_attr(
                        htmlspecialchars(
                            wp_json_encode(
                                array_map(
                                    function ( $attribute ) {
                                        return $attribute->get_data();
                                    }, $product_object->get_attributes()
                                )
                            )
                        )
                    );
                    ?>
                    "
                    data-total="<?php echo esc_attr( $variations_count ); ?>"
                    data-total_pages="<?php echo esc_attr( $variations_total_pages ); ?>"
                    data-page="1"
                    data-edited="false">
                </div>

                <div class="dokan-variation-action-toolbar">
                    <button class="dokan-btn dokan-btn-default dokan-btn-theme save-variation-changes"><?php esc_html_e( 'Save Variations', 'dokan-lite' ); ?></button>
                    <button class="dokan-btn dokan-btn-default cancel-variation-changes"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></button>
                    <div class="dokan-variations-pagenav dokan-right">
                        <span class="displaying-num">
                            <?php
                            /* translators: number of items */
                            $variations_count_text = _n( '%s item', '%s items', esc_attr( $variations_count ), 'dokan-lite' );
                            printf( esc_html( $variations_count_text ), esc_attr( $variations_count ) );
                            ?>
                        </span>
                        <span class="expand-close">
                            (
                                <a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'dokan-lite' ); ?></a>
                                /
                                <a href="#" class="close_all"><?php esc_html_e( 'Close', 'dokan-lite' ); ?></a>
                            )
                        </span>
                        <span class="pagination-links">
                            <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'dokan-lite' ); ?>" href="#">&laquo;</a>
                            <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'dokan-lite' ); ?>" href="#">&lsaquo;</a>
                            <span class="paging-select">
                                <label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'dokan-lite' ); ?></label>
                                <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'dokan-lite' ); ?>">
                                    <?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) { ?>
                                        <option value="<?php echo esc_attr( $i ); ?>"><?php echo esc_html( $i ); ?></option>
                                    <?php } ?>
                                </select>
                                <?php esc_html_x( 'of', 'number of pages', 'dokan-lite' ); ?> <span class="total-pages"><?php echo esc_html( $variations_total_pages ); ?></span>
                            </span>
                            <a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'dokan-lite' ); ?>" href="#">&rsaquo;</a>
                            <a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'dokan-lite' ); ?>" href="#">&raquo;</a>
                        </span>
                    </div>
                    <div class="dokan-clearfix"></div>
                </div>
                <div class="dokan-clearfix"></div>
            <?php } ?>
        </div>
    </div>
    <?php
}

/**
 * Get product visibility options.
 *
 * @since 3.0.0
 *
 * @return array
 */
function dokan_get_product_visibility_options() {
    return apply_filters(
        'dokan_product_visibility_options', [
            'visible' => __( 'Visible', 'dokan-lite' ),
            'catalog' => __( 'Catalog', 'dokan-lite' ),
            'search'  => __( 'Search', 'dokan-lite' ),
            'hidden'  => __( 'Hidden', 'dokan-lite' ),
        ]
    );
}

/**
 * Search product data for a term and users ids and return only ids.
 *
 * @param string $term
 * @param string $user_ids
 * @param string $type               of product
 * @param bool   $include_variations in search or not
 *
 * @return array of ids
 */
function dokan_search_seller_products( $term, $user_ids = false, $type = '', $include_variations = false ) {
    global $wpdb;

    $like_term     = '%' . $wpdb->esc_like( $term ) . '%';
    $post_types    = $include_variations ? [ 'product', 'product_variation' ] : [ 'product' ];
    $post_statuses = current_user_can( 'edit_private_products' ) ? [ 'private', 'publish' ] : [ 'publish' ];
    $type_join     = '';
    $type_where    = '';
    $users_where   = '';
    $query_args    = [ $like_term, $like_term, $like_term ];

    if ( $type ) {
        if ( in_array( $type, [ 'virtual', 'downloadable' ], true ) ) {
            $type_join    = " LEFT JOIN {$wpdb->postmeta} postmeta_type ON posts.ID = postmeta_type.post_id ";
            $type_where   = " AND ( postmeta_type.meta_key = %s AND postmeta_type.meta_value = 'yes' ) ";
            $query_args[] = "_{$type}";
        }
    }

    if ( ! empty( $user_ids ) ) {
        if ( is_array( $user_ids ) ) {
            $users_where = " AND posts.post_author IN ('" . implode( "','", array_filter( array_map( 'absint', $user_ids ) ) ) . "')";
        } elseif ( is_numeric( $user_ids ) ) {
            $users_where  = ' AND posts.post_author = %d';
            $query_args[] = $user_ids;
        }
    }
    // phpcs:ignore WordPress.DB.PreparedSQL
    $product_ids = $wpdb->get_col(
        // phpcs:disable
        $wpdb->prepare( "
            SELECT DISTINCT posts.ID FROM {$wpdb->posts} posts
            LEFT JOIN {$wpdb->postmeta} postmeta ON posts.ID = postmeta.post_id
            $type_join
            WHERE (
                posts.post_title LIKE %s
                OR posts.post_content LIKE %s
                OR (
                    postmeta.meta_key = '_sku' AND postmeta.meta_value LIKE %s
                )
            )
            AND posts.post_type IN ('" . implode( "','", $post_types ) . "')
            AND posts.post_status IN ('" . implode( "','", $post_statuses ) . "')
            $type_where
            $users_where
            ORDER BY posts.post_parent ASC, posts.post_title ASC
            ",
            $query_args
        )
        // phpcs:enable
    );

    if ( is_numeric( $term ) ) {
        $post_id   = absint( $term );
        $post_type = get_post_type( $post_id );

        if ( 'product_variation' === $post_type && $include_variations ) {
            $product_ids[] = $post_id;
        } elseif ( 'product' === $post_type ) {
            $product_ids[] = $post_id;
        }

        $product_ids[] = wp_get_post_parent_id( $post_id );
    }

    return wp_parse_id_list( $product_ids );
}

/**
 * Callback for array filter to get products the user can edit only.
 *
 * @since  2.6.8
 *
 * @param WC_Product $product
 *
 * @return bool
 */
function dokan_products_array_filter_editable( $product ) {
    return $product && is_a( $product, 'WC_Product' ) && current_user_can( 'dokandar', $product->get_id() );
}

/**
 * Get row action for product
 *
 * @since 2.7.3
 * @since 3.7.11 Added `$format_html` as an optional parameter
 *
 * @param object|int|string $post
 * @param bool              $format_html (Optional)
 *
 * @return array
 */
function dokan_product_get_row_action( $post, $format_html = true ) {
    if ( is_numeric( $post ) ) {
        $post = get_post( $post );
    }

    if ( empty( $post->ID ) ) {
        return [];
    }

    $row_action      = [];
    $row_action_html = [];
    $product_id      = $post->ID;

    if ( current_user_can( 'dokan_edit_product' ) ) {
        $row_action['edit'] = [
            'title' => __( 'Edit', 'dokan-lite' ),
            'url'   => dokan_edit_product_url( $product_id ),
            'class' => 'edit',
        ];
    }

    if ( current_user_can( 'dokan_delete_product' ) ) {
        $row_action['delete'] = [
            'title' => __( 'Delete Permanently', 'dokan-lite' ),
            'url'   => wp_nonce_url(
                add_query_arg(
                    [
                        'action'     => 'dokan-delete-product',
                        'product_id' => $product_id,
                    ], dokan_get_navigation_url( 'products' )
                ), 'dokan-delete-product'
            ),
            'class' => 'delete',
            'other' => 'onclick="dokan_show_delete_prompt( event, \'' . __( 'Are you sure?', 'dokan-lite' ) . '\' );"',
        ];
    }

    if ( current_user_can( 'dokan_view_product' ) && $post->post_status !== 'pending' ) {
        $row_action['view'] = [
            'title' => __( 'View', 'dokan-lite' ),
            'url'   => get_permalink( $product_id ),
            'class' => 'view',
        ];
    }

    $row_action = apply_filters( 'dokan_product_row_actions', $row_action, $post );

    if ( empty( $row_action ) ) {
        return $row_action;
    }

    if ( ! $format_html ) {
        return $row_action;
    }

    $i            = 0;
    $action_count = count( $row_action );

    foreach ( $row_action as $key => $action ) {
        ++$i;

        $sep = ( $i < $action_count ) ? ' | ' : '';

        $row_action_html[ $key ] = sprintf( '<span class="%s"><a href="%s" %s>%s</a>%s</span>', $action['class'], esc_url( $action['url'] ), isset( $action['other'] ) ? $action['other'] : '', $action['title'], $sep );
    }

    $row_action_html = apply_filters( 'dokan_product_row_action_html', $row_action_html, $post );

    return implode( ' ', $row_action_html );
}

/**
 * Dokan get vendor by product
 *
 * @since  2.9.8
 * @since  3.2.16 added $id parameter
 *
 * @param int|WC_Product $product    Product ID or Product Object
 * @param bool           $get_vendor return true to get vendor id, otherwise it will return \WeDevs\Dokan\Vendor\Vendor object
 *
 * @return int|\WeDevs\Dokan\Vendor\Vendor|false on failure
 */
function dokan_get_vendor_by_product( $product, $get_vendor_id = false ) {
    if ( ! $product instanceof WC_Product ) {
        $product = wc_get_product( $product );
    }

    if ( ! $product ) {
        return false;
    }

    $vendor_id = get_post_field( 'post_author', $product->get_id() );

    if ( ! $vendor_id && 'variation' === $product->get_type() ) {
        $vendor_id = get_post_field( 'post_author', $product->get_parent_id() );
    }

    $vendor_id = apply_filters( 'dokan_get_vendor_by_product', $vendor_id, $product );

    return false === $get_vendor_id ? dokan()->vendor->get( $vendor_id ) : (int) $vendor_id;
}

/**
 * Get translated product stock status
 *
 * @since 3.0.0
 *
 * @param mix $stock
 *
 * @return string | array if stock parameter is not provided
 */
function dokan_get_translated_product_stock_status( $stock = false ) {
    $stock_status = wc_get_product_stock_status_options();

    if ( ! $stock ) {
        return $stock_status;
    }

    return isset( $stock_status[ $stock ] ) ? $stock_status[ $stock ] : '';
}

/**
 * Get dokan store products filter catalog orderby
 *
 * @since DOKAN_LITE_SINCE
 *
 * @return array
 */
function dokan_store_product_catalog_orderby() {
    $show_default_orderby = 'menu_order' === apply_filters( 'dokan_default_store_products_orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );

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
    $orderby         = isset( $_GET['product_orderby'] ) ? wc_clean( wp_unslash( $_GET['product_orderby'] ) ) : $default_orderby; //phpcs:ignore

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

    $orderby_options = array(
        'show_default_orderby' => $show_default_orderby,
        'orderby'              => $orderby,
        'catalogs'             => $catalog_orderby_options,
    );

    return $orderby_options;
}
