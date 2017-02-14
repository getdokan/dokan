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
    );

    $data = wp_parse_args( $args, $defaults );

    if ( empty( $data['post_title'] ) ) {
        return new WP_Error( 'no-title', __( 'Please enter product title', 'dokan' ) );
    }

    if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
        $product_cat    = intval( $data['product_cat'] );
        if ( $product_cat < 0 ) {
            return new WP_Error( 'no-category', __( 'Please select a category', 'dokan' ) );
        }
    } else {
        if( ! isset( $data['product_cat'] ) && empty( $data['product_cat'] ) ) {
            return new WP_Error( 'no-category', __( 'Please select AT LEAST ONE category', 'dokan' ) );
        }
    }

    $error = apply_filters( 'dokan_new_product_popup_args' , '' , $data );

    if ( is_wp_error( $error ) ) {
        return $error;
    }

    $post_status = ! empty( $data['post_status'] ) ? $data['post_status'] : dokan_get_new_post_status();

    $post_data = apply_filters( 'dokan_insert_product_post_data', array(
        'post_type'    => 'product',
        'post_status'  => $post_status,
        'post_title'   => sanitize_text_field( $data['post_title'] ),
        'post_content' => $data['post_content'],
        'post_excerpt' => $data['post_excerpt'],
    ) );

    $product_id = wp_insert_post( $post_data );

    if ( $product_id ) {

        /** set images **/
        if ( $data['feat_image_id'] ) {
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

        update_post_meta( $product_id, '_visibility', 'visible' );

        do_action( 'dokan_new_product_added', $product_id, $data );

        if ( dokan_get_option( 'product_add_mail', 'dokan_general', 'on' ) == 'on' ) {
            Dokan_Email::init()->new_product_added( $product_id, $post_status );
        }

        return $product_id;
    }

    return false;
}

/**
 * Show options for the variable product type.
 *
 * @since 2.6
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
                    <?php _e( 'Before you can add a variation you need to add some variation attributes on the <strong>Attributes</strong> section', 'dokan' ); ?>
                </p>
            </div>

        <?php else : ?>

            <div class="dokan-variation-top-toolbar">
                <div class="dokan-variation-label content-half-part">
                    <div class="toolbar toolbar-top">
                        <select id="field_to_edit" class="variation-actions dokan-form-control dokan-w10">
                            <option data-global="true" value="add_variation"><?php _e( 'Add variation', 'dokan' ); ?></option>
                            <option data-global="true" value="link_all_variations"><?php _e( 'Create variations from all attributes', 'dokan' ); ?></option>
                            <option value="delete_all"><?php _e( 'Delete all variations', 'dokan' ); ?></option>
                            <optgroup label="<?php esc_attr_e( 'Status', 'dokan' ); ?>">
                                <option value="toggle_enabled"><?php _e( 'Toggle &quot;Enabled&quot;', 'dokan' ); ?></option>
                                <option value="toggle_downloadable"><?php _e( 'Toggle &quot;Downloadable&quot;', 'dokan' ); ?></option>
                                <option value="toggle_virtual"><?php _e( 'Toggle &quot;Virtual&quot;', 'dokan' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Pricing', 'dokan' ); ?>">
                                <option value="variable_regular_price"><?php _e( 'Set regular prices', 'dokan' ); ?></option>
                                <option value="variable_regular_price_increase"><?php _e( 'Increase regular prices (fixed amount or percentage)', 'dokan' ); ?></option>
                                <option value="variable_regular_price_decrease"><?php _e( 'Decrease regular prices (fixed amount or percentage)', 'dokan' ); ?></option>
                                <option value="variable_sale_price"><?php _e( 'Set sale prices', 'dokan' ); ?></option>
                                <option value="variable_sale_price_increase"><?php _e( 'Increase sale prices (fixed amount or percentage)', 'dokan' ); ?></option>
                                <option value="variable_sale_price_decrease"><?php _e( 'Decrease sale prices (fixed amount or percentage)', 'dokan' ); ?></option>
                                <option value="variable_sale_schedule"><?php _e( 'Set scheduled sale dates', 'dokan' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Inventory', 'dokan' ); ?>">
                                <option value="toggle_manage_stock"><?php _e( 'Toggle &quot;Manage stock&quot;', 'dokan' ); ?></option>
                                <option value="variable_stock"><?php _e( 'Stock', 'dokan' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Shipping', 'dokan' ); ?>">
                                <option value="variable_length"><?php _e( 'Length', 'dokan' ); ?></option>
                                <option value="variable_width"><?php _e( 'Width', 'dokan' ); ?></option>
                                <option value="variable_height"><?php _e( 'Height', 'dokan' ); ?></option>
                                <option value="variable_weight"><?php _e( 'Weight', 'dokan' ); ?></option>
                            </optgroup>
                            <optgroup label="<?php esc_attr_e( 'Downloadable products', 'dokan' ); ?>">
                                <option value="variable_download_limit"><?php _e( 'Download limit', 'dokan' ); ?></option>
                                <option value="variable_download_expiry"><?php _e( 'Download expiry', 'dokan' ); ?></option>
                            </optgroup>
                            <?php do_action( 'dokan_variable_product_bulk_edit_actions' ); ?>
                        </select>
                        <a class="dokan-btn dokan-btn-default do_variation_action"><?php _e( 'Go', 'dokan' ); ?></a>
                    </div>
                </div>

                <div class="dokan-variation-default-toolbar content-half-part">

                    <div class="dokan-variations-defaults">
                        <span class="dokan-variation-default-label dokan-left float-none"><i class="fa fa-question-circle tips" title="<?php _e( 'Default Form Values: These are the attributes that will be pre-selected on the frontend.', 'dokan' ); ?>" aria-hidden="true"></i></span>

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
                                echo '<select class="dokan-form-control" name="default_attribute_' . sanitize_title( $attribute['name'] ) . '" data-current="' . esc_attr( $variation_selected_value ) . '"><option value="">' . __( 'No default', 'dokan' ) . ' ' . esc_html( wc_attribute_label( $attribute['name'] ) ) . '&hellip;</option>';

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
                <button class="dokan-btn dokan-btn-default dokan-btn-theme save-variation-changes"><?php _e( 'Save Variations', 'dokan' ) ?></button>
                <button class="dokan-btn dokan-btn-default cancel-variation-changes"><?php _e( 'Cancel', 'dokan' ) ?></button>

                <div class="dokan-variations-pagenav dokan-right">
                    <span class="displaying-num"><?php printf( _n( '%s item', '%s items', $variations_count, 'dokan' ), $variations_count ); ?></span>
                    <span class="expand-close">
                        (<a href="#" class="expand_all"><?php _e( 'Expand', 'dokan' ); ?></a> / <a href="#" class="close_all"><?php _e( 'Close', 'dokan' ); ?></a>)
                    </span>
                    <span class="pagination-links">
                        <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'dokan' ); ?>" href="#">&laquo;</a>
                        <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'dokan' ); ?>" href="#">&lsaquo;</a>
                        <span class="paging-select">
                            <label for="current-page-selector-1" class="screen-reader-text"><?php _e( 'Select Page', 'dokan' ); ?></label>
                            <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'dokan' ); ?>">
                                <?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
                                    <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                                <?php endfor; ?>
                            </select>
                             <?php _ex( 'of', 'number of pages', 'dokan' ); ?> <span class="total-pages"><?php echo $variations_total_pages; ?></span>
                        </span>
                        <a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'dokan' ); ?>" href="#">&rsaquo;</a>
                        <a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'dokan' ); ?>" href="#">&raquo;</a>
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















