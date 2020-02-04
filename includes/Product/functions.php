<?php
/**
 * Load all product related functions
 *
 * @since 2.5.1
 *
 * @package dokan
 */

/**
 * Dokan insert new product
 *
 * @since  2.5.1
 *
 * @param  array  $args
 *
 * @return integer|boolean
 */
function dokan_save_product( $args ) {
    $defaults = array(
        'post_title'     => '',
        'post_content'   => '',
        'post_excerpt'   => '',
        'post_status'    => '',
        'post_type'      => 'product',
        'product_tag'      => [],
        '_visibility'    => 'visible',
    );

    $data = wp_parse_args( $args, $defaults );

    if ( empty( $data['post_title'] ) ) {
        return new WP_Error( 'no-title', __( 'Please enter product title', 'dokan-lite' ) );
    }

    if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
        if ( absint( $data['product_cat'] ) < 0 ) {
            return new WP_Error( 'no-category', __( 'Please select a category', 'dokan-lite' ) );
        }
    } else {
        if ( ! isset( $data['product_cat'] ) && empty( $data['product_cat'] ) ) {
            return new WP_Error( 'no-category', __( 'Please select AT LEAST ONE category', 'dokan-lite' ) );
        }
    }

    $error = apply_filters( 'dokan_new_product_popup_args', '', $data );

    if ( is_wp_error( $error ) ) {
        return $error;
    }

    $post_status = ! empty( $data['post_status'] ) ? sanitize_text_field( $data['post_status'] ) : dokan_get_new_post_status();

    $post_arr = array(
        'post_type'    => 'product',
        'post_status'  => $post_status,
        'post_title'   => sanitize_text_field( $data['post_title'] ),
        'post_content' => sanitize_textarea_field( $data['post_content'] ),
        'post_excerpt' => sanitize_textarea_field( $data['post_excerpt'] ),
    );

    if ( ! empty( $data['ID'] ) ) {
        $post_arr['ID'] = absint( $data['ID'] );

        if ( ! dokan_is_product_author( $post_arr['ID'] ) ) {
            return new WP_Error( 'not-own', __( 'I swear this is not your product!', 'dokan-lite' ) );
        }

        $is_updating = true;
    } else {
        $is_updating = false;
    }

    $post_arr = apply_filters( 'dokan_insert_product_post_data', $post_arr, $data );

    if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
        $cat_ids[] = $data['product_cat'];
    } else {
        if ( ! empty( $data['product_cat'] ) ) {
            $cat_ids = array_map( 'absint', (array) $data['product_cat'] );
        }
    }

    $post_data = [
        'id'                 => $is_updating ? $post_arr['ID'] : '',
        'name'               => $post_arr['post_title'],
        'type'               => 'simple',
        'description'        => $post_arr['post_content'],
        'short_description'  => $post_arr['post_excerpt'],
        'status'             => $post_status,
        'featured_image_id'  => absint( $data['feat_image_id'] ),
        'gallery_image_ids'  => array_filter( explode( ',', wc_clean( $data['product_image_gallery'] ) ) ),
        'tags'               => array_map( 'absint', (array) $data['product_tag'] ),
        'categories'         => $cat_ids,
        'regular_price'      => $data['_regular_price'] === '' ? '' : wc_format_decimal( $data['_regular_price'] ),
        'sale_price'         => $data['_sale_price'] === '' ? '' : wc_format_decimal( $data['_sale_price'] ),
        'date_on_sale_from'  => isset( $data['_sale_price_dates_from'] ) ? wc_clean( $data['_sale_price_dates_from'] ) : '',
        'date_on_sale_to'    => isset( $data['_sale_price_dates_to'] ) ? wc_clean( $data['_sale_price_dates_to'] ) : '',
        'catalog_visibility' => array_key_exists( $data['_visibility'], dokan_get_product_visibility_options() ) ? sanitize_text_field( $data['_visibility'] ) : 'visible'
    ];

    $product = dokan()->product->create( $post_data );

    if ( ! $is_updating ) {
        do_action( 'dokan_new_product_added', $product->get_id(), $data );
    } else {
        do_action( 'dokan_product_updated', $product->get_id(), $data );
    }

    if ( $product ) {
        return $product->get_id();
    }

    return false;
}

/**
 * Show options for the variable product type.
 *
 * @since 2.5.3
 *
 * @return void
 */
function dokan_product_output_variations() {
    global $post, $wpdb;

    // Get attributes
    $attributes = maybe_unserialize( get_post_meta( $post->ID, '_product_attributes', true ) );

    // See if any are set
    $variation_attribute_found = false;

    if ( $attributes ) {
        foreach ( $attributes as $attribute ) {
            if ( ! empty( $attribute['is_variation'] ) ) {
                $variation_attribute_found = true;
                break;
            }
        }
    }

    $variations_count       = absint( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_parent = %d AND post_type = 'product_variation' AND post_status IN ('publish', 'private')", $post->ID ) ) );
    $variations_per_page    = absint( apply_filters( 'woocommerce_admin_meta_boxes_variations_per_page', 15 ) );
    $variations_total_pages = ceil( $variations_count / $variations_per_page );
    ?>
    <div id="dokan-variable-product-options" class="">
        <div id="dokan-variable-product-options-inner">

        <?php if ( ! $variation_attribute_found ) : ?>

            <div id="dokan-info-message" class="dokan-alert dokan-alert-info">
                <p>
                    <?php echo wp_kses( __( 'Before you can add a variation you need to add some variation attributes on the <strong>Attributes</strong> section', 'dokan-lite' ), [ 'strong' => [] ] ); ?>
                </p>
            </div>

        <?php else : ?>

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
                        <span class="dokan-variation-default-label dokan-left float-none"><i class="fa fa-question-circle tips" title="<?php esc_attr_e( 'Default Form Values: These are the attributes that will be pre-selected on the frontend.', 'dokan-lite' ); ?>" aria-hidden="true"></i></span>

                        <?php
                            $default_attributes = maybe_unserialize( get_post_meta( $post->ID, '_default_attributes', true ) );

                            foreach ( $attributes as $attribute ) {

                                // Only deal with attributes that are variations
                                if ( ! $attribute['is_variation'] ) {
                                    continue;
                                }

                                echo '<div class="dokan-variation-default-select dokan-w5 float-none">';

                                // Get current value for variation (if set)
                                $variation_selected_value = isset( $default_attributes[ sanitize_title( $attribute['name'] ) ] ) ? $default_attributes[ sanitize_title( $attribute['name'] ) ] : '';

                                // Name will be something like attribute_pa_color
                                echo '<select class="dokan-form-control" name="default_attribute_' . esc_attr( sanitize_title( $attribute['name'] ) ) . '" data-current="' . esc_attr( $variation_selected_value ) . '"><option value="">' . esc_html__( 'No default', 'dokan-lite' ) . ' ' . esc_html( wc_attribute_label( $attribute['name'] ) ) . '&hellip;</option>';

                                // Get terms for attribute taxonomy or value if its a custom attribute
                                if ( $attribute['is_taxonomy'] ) {
                                    $post_terms = wp_get_post_terms( $post->ID, $attribute['name'] );

                                    foreach ( $post_terms as $term ) {
                                        echo '<option ' . selected( $variation_selected_value, $term->slug, false ) . ' value="' . esc_attr( $term->slug ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_name', $term->name ) ) . '</option>';
                                    }
                                } else {
                                    $options = wc_get_text_attributes( $attribute['value'] );

                                    foreach ( $options as $option ) {
                                        $selected = sanitize_title( $variation_selected_value ) === $variation_selected_value ? selected( $variation_selected_value, sanitize_title( $option ), false ) : selected( $variation_selected_value, $option, false );
                                        echo '<option ' . esc_attr( $selected ) . ' value="' . esc_attr( $option ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_name', $option ) ) . '</option>';
                                    }
                                }

                                echo '</select>';
                                echo '</div>';

                            }
                        ?>
                        <div class="dokan-clearfix"></div>

                    </div>

                </div>
                <div class="dokan-clearfix"></div>
            </div>

            <div class="dokan-variations-container wc-metaboxes" data-attributes="
            <?php
                // esc_attr does not double encode - htmlspecialchars does
                echo esc_attr( htmlspecialchars( json_encode( $attributes ) ) );
            ?>
            " data-total="<?php echo esc_attr( $variations_count ); ?>" data-total_pages="<?php echo esc_attr( $variations_total_pages ); ?>" data-page="1" data-edited="false">
            </div>

            <div class="dokan-variation-action-toolbar">
                <button class="dokan-btn dokan-btn-default dokan-btn-theme save-variation-changes"><?php esc_html_e( 'Save Variations', 'dokan-lite' ); ?></button>
                <button class="dokan-btn dokan-btn-default cancel-variation-changes"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></button>

                <div class="dokan-variations-pagenav dokan-right">
                    <span class="displaying-num">
                        <?php
                            $variations_count_text = _n( '%s item', '%s items', esc_attr( $variations_count ), 'dokan-lite' );
                            printf( esc_html( $variations_count_text ), esc_attr( $variations_count ) );
                        ?>
                    </span>
                    <span class="expand-close">
                        (<a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'dokan-lite' ); ?></a> / <a href="#" class="close_all"><?php esc_html_e( 'Close', 'dokan-lite' ); ?></a>)
                    </span>
                    <span class="pagination-links">
                        <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'dokan-lite' ); ?>" href="#">&laquo;</a>
                        <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'dokan-lite' ); ?>" href="#">&lsaquo;</a>
                        <span class="paging-select">
                            <label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'dokan-lite' ); ?></label>
                            <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'dokan-lite' ); ?>">
                                <?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
                                    <option value="<?php echo esc_attr( $i ); ?>"><?php echo esc_html( $i ); ?></option>
                                <?php endfor; ?>
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
        <?php endif; ?>

        </div>

    </div>
    <?php
}

/**
 * Get product visibility options.
 *
 * @since 3.0.0
 * @return array
 */
function dokan_get_product_visibility_options() {
    return apply_filters( 'dokan_product_visibility_options', array(
        'visible' => __( 'Visible', 'dokan-lite' ),
        'catalog' => __( 'Catalog', 'dokan-lite' ),
        'search'  => __( 'Search', 'dokan-lite' ),
        'hidden'  => __( 'Hidden', 'dokan-lite' ),
    ) );
}

/**
 * Search product data for a term and users ids and return only ids.
 *
 * @param  string $term
 * @param  string $user_ids
 * @param  string $type of product
 * @param  bool $include_variations in search or not
 *
 * @return array of ids
 */
function dokan_search_seller_products( $term, $user_ids = false, $type = '', $include_variations = false ) {
    global $wpdb;

    $like_term     = '%' . $wpdb->esc_like( $term ) . '%';
    $post_types    = $include_variations ? array( 'product', 'product_variation' ) : array( 'product' );
    $post_statuses = current_user_can( 'edit_private_products' ) ? array( 'private', 'publish' ) : array( 'publish' );
    $type_join     = '';
    $type_where    = '';
    $users_where   = '';

    if ( $type ) {
        if ( in_array( $type, array( 'virtual', 'downloadable' ) ) ) {
            $type_join  = " LEFT JOIN {$wpdb->postmeta} postmeta_type ON posts.ID = postmeta_type.post_id ";
            $type_where = " AND ( postmeta_type.meta_key = '_{$type}' AND postmeta_type.meta_value = 'yes' ) ";
        }
    }

    if ( $user_ids ) {
        if ( is_array( $user_ids ) ) {
            $users_where = " AND posts.post_author IN ('" . implode( "','", $user_ids ) . "')";
        } else {
            $users_where = " AND posts.post_author = '$user_ids'";
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
            $like_term,
            $like_term,
            $like_term
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
 * @param  WC_Product $product
 * @return bool
 */
function dokan_products_array_filter_editable( $product ) {
    return $product && is_a( $product, 'WC_Product' ) && current_user_can( 'dokandar', $product->get_id() );
}

/**
 * Get row action for product
 *
 * @since 2.7.3
 *
 * @param object $post
 *
 * @return array
 */
function dokan_product_get_row_action( $post ) {

    if ( empty( $post->ID ) ) {
        return array();
    }

    $row_action      = array();
    $row_action_html = array();
    $product_id      = $post->ID;

    if ( current_user_can( 'dokan_edit_product' ) ) {
        $row_action['edit'] = array(
            'title' => __( 'Edit', 'dokan-lite' ),
            'url'   => dokan_edit_product_url( $product_id ),
            'class' => 'edit',
        );
    }

    if ( current_user_can( 'dokan_delete_product' ) ) {
        $row_action['delete'] = array(
            'title' => __( 'Delete Permanently', 'dokan-lite' ),
            'url'   => wp_nonce_url( add_query_arg( array( 'action' => 'dokan-delete-product', 'product_id' => $product_id ), dokan_get_navigation_url('products') ), 'dokan-delete-product' ),
            'class' => 'delete',
            'other' => 'onclick="return confirm( \'Are you sure?\' );"',
        );
    }

    if ( current_user_can( 'dokan_view_product' ) && $post->post_status != 'pending' ) {
        $row_action['view'] = array(
            'title' => __( 'View', 'dokan-lite' ),
            'url'   => get_permalink( $product_id ),
            'class' => 'view',
        );
    }

    $row_action = apply_filters( 'dokan_product_row_actions', $row_action, $post );

    if ( empty( $row_action ) ) {
        return $row_action;
    }

    foreach ( $row_action as $key => $action ) {
        $row_action_html[ $key ] = sprintf( '<span class="%s"><a href="%s" %s>%s</a></span>', $action['class'], esc_url( $action['url'] ), isset( $action['other'] ) ? $action['other'] : '', $action['title'] );
    }

    $row_action_html = apply_filters( 'dokan_product_row_action_html', $row_action_html, $post );

    return implode( ' | ', $row_action_html );
}

/**
 * Dokan get vendor by product
 *
 * @param int|object $id Product ID or Product Object
 *
 * @since  2.9.8
 *
 * @return Dokan_Vendor|false on faiure
 */
function dokan_get_vendor_by_product( $product ) {
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

    return dokan()->vendor->get( $vendor_id );
}

/**
 * Get translated product stock status
 *
 * @since 3.0.0
 *
 * @param  mix $stock
 *
 * @return string | array if stock parameter is not provided
 */
function dokan_get_translated_product_stock_status( $stock = false ) {
    $stock_status = wc_get_product_stock_status_options();

    if ( ! $stock ) {
        return $stock_status;
    }

    return isset( $stock_status[$stock] ) ? $stock_status[$stock] : '';
}
