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
        '_visibility'    => 'visible',
    );

    $data = wp_parse_args( $args, $defaults );

    if ( empty( $data['post_title'] ) ) {
        return new WP_Error( 'no-title', __( 'Please enter product title', 'dokan-lite' ) );
    }

    if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
        $product_cat    = intval( $data['product_cat'] );
        if ( $product_cat < 0 ) {
            return new WP_Error( 'no-category', __( 'Please select a category', 'dokan-lite' ) );
        }
    } else {
        if( ! isset( $data['product_cat'] ) && empty( $data['product_cat'] ) ) {
            return new WP_Error( 'no-category', __( 'Please select AT LEAST ONE category', 'dokan-lite' ) );
        }
    }

    $error = apply_filters( 'dokan_new_product_popup_args' , '' , $data );

    if ( is_wp_error( $error ) ) {
        return $error;
    }

    $post_status = ! empty( $data['post_status'] ) ? $data['post_status'] : dokan_get_new_post_status();

    $post_arr = array(
        'post_type'    => 'product',
        'post_status'  => $post_status,
        'post_title'   => sanitize_text_field( $data['post_title'] ),
        'post_content' => $data['post_content'],
        'post_excerpt' => $data['post_excerpt'],
    );

    if ( ! empty( $data['ID'] ) ) {
        $post_arr['ID'] = $data['ID'];
        $is_updating = true;
    } else {
        $is_updating = false;
    }

    $post_arr = apply_filters( 'dokan_insert_product_post_data', $post_arr, $data );

    $product_id = $is_updating ? wp_update_post( $post_arr ) : wp_insert_post( $post_arr );

    if ( ! is_wp_error( $product_id ) ) {

        /** set images **/
        if ( isset( $data['feat_image_id'] ) && ! empty( $data['feat_image_id'] ) ) {
            set_post_thumbnail( $product_id, $data['feat_image_id'] );
        }

        if ( isset( $data['product_tag'] ) && !empty( $data['product_tag'] ) ) {
            $tags_ids = array_map( 'intval', (array)$data['product_tag'] );
            wp_set_object_terms( $product_id, $tags_ids, 'product_tag' );
        }

        /** set product category * */
        if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
            wp_set_object_terms( $product_id, (int) $data['product_cat'], 'product_cat' );
        } else {
            if ( isset( $data['product_cat'] ) && !empty( $data['product_cat'] ) ) {
                $cat_ids = array_map( 'intval', (array)$data['product_cat'] );
                wp_set_object_terms( $product_id, $cat_ids, 'product_cat' );
            }
        }
        if ( isset( $data['product_type'] ) ) {
            wp_set_object_terms( $product_id, $data['product_type'], 'product_type' );
        } else {
            wp_set_object_terms( $product_id, 'simple', 'product_type' );
        }

        // Gallery Images
        if (  !empty( $data['product_image_gallery'] ) ) {
            $attachment_ids = array_filter( explode( ',', wc_clean( $data['product_image_gallery'] ) ) );
            update_post_meta( $product_id, '_product_image_gallery', implode( ',', $attachment_ids ) );
        }

        if ( isset( $data['_regular_price'] ) ) {
            update_post_meta( $product_id, '_regular_price', ( $data['_regular_price'] === '' ) ? '' : wc_format_decimal( $data['_regular_price'] ) );
        }

        if ( isset( $data['_sale_price'] ) ) {
            update_post_meta( $product_id, '_sale_price', ( $data['_sale_price'] === '' ? '' : wc_format_decimal( $data['_sale_price'] ) ) );
        }

        $date_from = isset( $data['_sale_price_dates_from'] ) ? $data['_sale_price_dates_from'] : '';
        $date_to   = isset( $data['_sale_price_dates_to'] ) ? $data['_sale_price_dates_to'] : '';

        // Dates
        if ( $date_from ) {
            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( $date_from ) );
        } else {
            update_post_meta( $product_id, '_sale_price_dates_from', '' );
        }

        if ( $date_to ) {
            update_post_meta( $product_id, '_sale_price_dates_to', strtotime( $date_to ) );
        } else {
            update_post_meta( $product_id, '_sale_price_dates_to', '' );
        }

        if ( $date_to && ! $date_from ) {
            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( 'NOW', current_time( 'timestamp' ) ) );
        }

        // Update price if on sale
        if ( '' !== $data['_sale_price'] && '' == $date_to && '' == $date_from ) {
            update_post_meta( $product_id, '_price', wc_format_decimal( $data['_sale_price'] ) );
        } else {
            update_post_meta( $product_id, '_price', ( $data['_regular_price'] === '' ) ? '' : wc_format_decimal( $data['_regular_price'] ) );
        }

        if ( '' !== $data['_sale_price'] && $date_from && strtotime( $date_from ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
            update_post_meta( $product_id, '_price', wc_format_decimal( $data['_sale_price'] ) );
        }

        if ( $date_to && strtotime( $date_to ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
            update_post_meta( $product_id, '_price', ( $data['_regular_price'] === '' ) ? '' : wc_format_decimal( $data['_regular_price'] ) );
            update_post_meta( $product_id, '_sale_price_dates_from', '' );
            update_post_meta( $product_id, '_sale_price_dates_to', '' );
        }

        if ( array_key_exists( $data['_visibility'], dokan_get_product_visibility_options() ) ) {
            update_post_meta( $product_id, '_visibility', $data['_visibility'] );
        } else {
            update_post_meta( $product_id, '_visibility', 'visible' );
        }

        if ( ! $is_updating ) {
            do_action( 'dokan_new_product_added', $product_id, $data );
        } else {
            do_action( 'dokan_product_updated', $product_id, $data );
        }

        return $product_id;
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
                    <?php _e( 'Before you can add a variation you need to add some variation attributes on the <strong>Attributes</strong> section', 'dokan-lite' ); ?>
                </p>
            </div>

        <?php else : ?>

            <div class="dokan-variation-top-toolbar">
                <div class="dokan-variation-label content-half-part">
                    <div class="toolbar toolbar-top">
                        <select id="field_to_edit" class="variation-actions dokan-form-control dokan-w10">
                            <option data-global="true" value="add_variation"><?php _e( 'Add variation', 'dokan-lite' ); ?></option>
                            <option data-global="true" value="link_all_variations"><?php _e( 'Create variations from all attributes', 'dokan-lite' ); ?></option>
                            <option value="delete_all"><?php _e( 'Delete all variations', 'dokan-lite' ); ?></option>
                            <optgroup label="<?php esc_attr_e( 'Status', 'dokan-lite' ); ?>">
                                <option value="toggle_enabled"><?php _e( 'Toggle &quot;Enabled&quot;', 'dokan-lite' ); ?></option>
                                <option value="toggle_downloadable"><?php _e( 'Toggle &quot;Downloadable&quot;', 'dokan-lite' ); ?></option>
                                <option value="toggle_virtual"><?php _e( 'Toggle &quot;Virtual&quot;', 'dokan-lite' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Pricing', 'dokan-lite' ); ?>">
                                <option value="variable_regular_price"><?php _e( 'Set regular prices', 'dokan-lite' ); ?></option>
                                <option value="variable_regular_price_increase"><?php _e( 'Increase regular prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                <option value="variable_regular_price_decrease"><?php _e( 'Decrease regular prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                <option value="variable_sale_price"><?php _e( 'Set sale prices', 'dokan-lite' ); ?></option>
                                <option value="variable_sale_price_increase"><?php _e( 'Increase sale prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                <option value="variable_sale_price_decrease"><?php _e( 'Decrease sale prices (fixed amount or percentage)', 'dokan-lite' ); ?></option>
                                <option value="variable_sale_schedule"><?php _e( 'Set scheduled sale dates', 'dokan-lite' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Inventory', 'dokan-lite' ); ?>">
                                <option value="toggle_manage_stock"><?php _e( 'Toggle &quot;Manage stock&quot;', 'dokan-lite' ); ?></option>
                                <option value="variable_stock"><?php _e( 'Stock', 'dokan-lite' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Shipping', 'dokan-lite' ); ?>">
                                <option value="variable_length"><?php _e( 'Length', 'dokan-lite' ); ?></option>
                                <option value="variable_width"><?php _e( 'Width', 'dokan-lite' ); ?></option>
                                <option value="variable_height"><?php _e( 'Height', 'dokan-lite' ); ?></option>
                                <option value="variable_weight"><?php _e( 'Weight', 'dokan-lite' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Downloadable products', 'dokan-lite' ); ?>">
                                <option value="variable_download_limit"><?php _e( 'Download limit', 'dokan-lite' ); ?></option>
                                <option value="variable_download_expiry"><?php _e( 'Download expiry', 'dokan-lite' ); ?></option>
                            </optgroup>
                            <?php do_action( 'dokan_variable_product_bulk_edit_actions' ); ?>
                        </select>
                        <a class="dokan-btn dokan-btn-default do_variation_action"><?php _e( 'Go', 'dokan-lite' ); ?></a>
                    </div>
                </div>

                <div class="dokan-variation-default-toolbar content-half-part">

                    <div class="dokan-variations-defaults">
                        <span class="dokan-variation-default-label dokan-left float-none"><i class="fa fa-question-circle tips" title="<?php _e( 'Default Form Values: These are the attributes that will be pre-selected on the frontend.', 'dokan-lite' ); ?>" aria-hidden="true"></i></span>

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
                                echo '<select class="dokan-form-control" name="default_attribute_' . sanitize_title( $attribute['name'] ) . '" data-current="' . esc_attr( $variation_selected_value ) . '"><option value="">' . __( 'No default', 'dokan-lite' ) . ' ' . esc_html( wc_attribute_label( $attribute['name'] ) ) . '&hellip;</option>';

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
                                        echo '<option ' . $selected . ' value="' . esc_attr( $option ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_name', $option ) )  . '</option>';
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

            <div class="dokan-variations-container wc-metaboxes" data-attributes="<?php
                // esc_attr does not double encode - htmlspecialchars does
                echo htmlspecialchars( json_encode( $attributes ) );
            ?>" data-total="<?php echo $variations_count; ?>" data-total_pages="<?php echo $variations_total_pages; ?>" data-page="1" data-edited="false">
            </div>

            <div class="dokan-variation-action-toolbar">
                <button class="dokan-btn dokan-btn-default dokan-btn-theme save-variation-changes"><?php _e( 'Save Variations', 'dokan-lite' ) ?></button>
                <button class="dokan-btn dokan-btn-default cancel-variation-changes"><?php _e( 'Cancel', 'dokan-lite' ) ?></button>

                <div class="dokan-variations-pagenav dokan-right">
                    <span class="displaying-num"><?php printf( _n( '%s item', '%s items', $variations_count, 'dokan-lite' ), $variations_count ); ?></span>
                    <span class="expand-close">
                        (<a href="#" class="expand_all"><?php _e( 'Expand', 'dokan-lite' ); ?></a> / <a href="#" class="close_all"><?php _e( 'Close', 'dokan-lite' ); ?></a>)
                    </span>
                    <span class="pagination-links">
                        <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'dokan-lite' ); ?>" href="#">&laquo;</a>
                        <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'dokan-lite' ); ?>" href="#">&lsaquo;</a>
                        <span class="paging-select">
                            <label for="current-page-selector-1" class="screen-reader-text"><?php _e( 'Select Page', 'dokan-lite' ); ?></label>
                            <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'dokan-lite' ); ?>">
                                <?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
                                    <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                                <?php endfor; ?>
                            </select>
                             <?php _ex( 'of', 'number of pages', 'dokan-lite' ); ?> <span class="total-pages"><?php echo $variations_total_pages; ?></span>
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
    $users_where    = '';

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

    $product_ids = $wpdb->get_col(
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
            'other' => 'onclick="return confirm( \'Are you sure?\' );"'
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
        $row_action_html[$key] = sprintf( '<span class="%s"><a href="%s" %s>%s</a></span>', $action['class'], esc_url( $action['url'] ), isset( $action['other'] ) ? $action['other'] : '', $action['title'] );
    }

    $row_action_html = apply_filters( 'dokan_product_row_action_html', $row_action_html, $post );

    return implode( ' | ', $row_action_html );
}

/**
 * Change bulk product status in vendor dashboard
 *
 * @since 2.8.6
 *
 * @return string
 */
function dokan_bulk_product_status_change() {
    if ( ! current_user_can( 'dokan_delete_product' ) ) {
        return;
    }
    if ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( $_POST['security'], 'bulk_product_status_change' ) ) {
        return;
    }
    if ( ! isset( $_POST['status'] ) || ! isset( $_POST['bulk_products'] ) ) {
        return;
    }

    $status = $_POST['status'];
    $products = $_POST['bulk_products'];

    // -1 means bluk action option value
    if ( $status === '-1' ) {
        return;
    }

    foreach ( $products as $product ) {
        wp_delete_post( $product );
    }

    wp_redirect( add_query_arg( array( 'message' => 'product_deleted' ), dokan_get_navigation_url( 'products' ) ) );
    exit;
}

add_action( 'template_redirect', 'dokan_bulk_product_status_change' );
