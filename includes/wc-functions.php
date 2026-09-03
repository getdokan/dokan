<?php

/**
 * Save the product data meta box.
 *
 * @access public
 *
 * @param int   $post_id
 * @param array $data
 *
 * @throws WC_Data_Exception
 * @return void
 */
function dokan_process_product_meta( int $post_id, array $data = [] ) {
    if ( ! $post_id || ! $data ) {
        return;
    }

    global $woocommerce_errors;

    $product_type = empty( $data['product_type'] ) ? 'simple' : sanitize_text_field( $data['product_type'] );

    // Add any default post meta
    add_post_meta( $post_id, 'total_sales', '0', true );

    $is_downloadable = isset( $data['_downloadable'] ) ? 'yes' : 'no';
    $is_virtual      = isset( $data['_virtual'] ) ? 'yes' : 'no';

    // Product type + Downloadable/Virtual
    update_post_meta( $post_id, '_downloadable', $is_downloadable );
    update_post_meta( $post_id, '_virtual', $is_virtual );

    // Gallery Images
    if ( isset( $data['product_image_gallery'] ) ) {
        $data = apply_filters( 'dokan_restrict_product_image_gallery_on_edit', $data );

        $attachment_ids = array_filter( explode( ',', wc_clean( $data['product_image_gallery'] ) ) );
        update_post_meta( $post_id, '_product_image_gallery', implode( ',', $attachment_ids ) );
    }

    // Check product visibility and purchase note
    $data['_visibility']    = isset( $data['_visibility'] ) ? sanitize_text_field( $data['_visibility'] ) : '';
    $data['_purchase_note'] = isset( $data['_purchase_note'] ) ? sanitize_textarea_field( $data['_purchase_note'] ) : '';

    // Set visibility for WC 3.0.0+
    $terms = [];

    switch ( $data['_visibility'] ) {
        case 'hidden':
            $terms[] = 'exclude-from-search';
            $terms[] = 'exclude-from-catalog';
            break;
        case 'catalog':
            $terms[] = 'exclude-from-search';
            break;
        case 'search':
            $terms[] = 'exclude-from-catalog';
            break;
    }

    $product_visibility = get_the_terms( $post_id, 'product_visibility' );
    $term_names         = is_array( $product_visibility ) ? wp_list_pluck( $product_visibility, 'name' ) : [];
    $featured           = in_array( 'featured', $term_names, true );

    if ( $featured ) {
        $terms[] = 'featured';
    }

    wp_set_post_terms( $post_id, $terms, 'product_visibility' );
    update_post_meta( $post_id, '_visibility', $data['_visibility'] );

    // Update post meta
    if ( isset( $data['_regular_price'] ) ) {
        update_post_meta( $post_id, '_regular_price', ( $data['_regular_price'] === '' ) ? '' : wc_format_decimal( $data['_regular_price'] ) );
    }

    if ( isset( $data['_sale_price'] ) ) {
        //if regular price is lower than sale price then we are setting it to empty
        if ( (float) wc_format_decimal( $data['_regular_price'] ) <= (float) wc_format_decimal( $data['_sale_price'] ) ) {
            $data['_sale_price'] = '';
        }

        update_post_meta( $post_id, '_sale_price', ( $data['_sale_price'] === '' ? '' : wc_format_decimal( $data['_sale_price'] ) ) );
    }

    // Update post meta
    if ( isset( $data['_tax_status'] ) ) {
        update_post_meta( $post_id, '_tax_status', wc_clean( $data['_tax_status'] ) );
    }

    if ( isset( $data['_tax_class'] ) ) {
        update_post_meta( $post_id, '_tax_class', wc_clean( $data['_tax_class'] ) );
    }

    if ( isset( $data['_purchase_note'] ) ) {
        update_post_meta( $post_id, '_purchase_note', wp_kses_post( $data['_purchase_note'] ) );
    }

    // Save Attributes
    $attributes = [];

    if ( isset( $data['attribute_names'] ) && is_array( $data['attribute_names'] ) && isset( $data['attribute_values'] ) && is_array( $data['attribute_values'] ) ) {
        $attribute_names  = array_map( 'wc_clean', $data['attribute_names'] );
        $attribute_values = array_map(
            function ( $value ) {
                return $value;
            }, $data['attribute_values']
        );

        if ( isset( $data['attribute_visibility'] ) ) {
            $attribute_visibility = array_map( 'absint', $data['attribute_visibility'] );
        }

        if ( isset( $data['attribute_variation'] ) ) {
            $attribute_variation = array_map( 'absint', $data['attribute_variation'] );
        }

        $attribute_is_taxonomy   = array_map( 'absint', $data['attribute_is_taxonomy'] );
        $attribute_position      = array_map( 'absint', $data['attribute_position'] );
        $attribute_names_max_key = max( array_keys( $attribute_names ) );

        for ( $i = 0; $i <= $attribute_names_max_key; $i++ ) {
            if ( empty( $attribute_names[ $i ] ) ) {
                continue;
            }

            $is_visible   = isset( $attribute_visibility[ $i ] ) ? 1 : 0;
            $is_variation = isset( $attribute_variation[ $i ] ) ? 1 : 0;
            $is_taxonomy  = $attribute_is_taxonomy[ $i ] ? 1 : 0;

            if ( $is_taxonomy ) {
                if ( isset( $attribute_values[ $i ] ) ) {

                    // Select based attributes - Format values (posted values are slugs)
                    if ( is_array( $attribute_values[ $i ] ) ) {
                        $values = $attribute_values[ $i ]; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

                        // Text based attributes - Posted values are term names, wp_set_object_terms wants ids or slugs.
                    } else {
                        $values     = [];
                        $raw_values = explode( WC_DELIMITER, $attribute_values[ $i ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

                        foreach ( $raw_values as $value ) {
                            $term = get_term_by( 'name', $value, $attribute_names[ $i ] );
                            if ( ! $term ) {
                                $term = wp_insert_term( $value, $attribute_names[ $i ] );

                                if ( $term && ! is_wp_error( $term ) ) {
                                    $values[] = $term['term_id'];
                                }
                            } else {
                                $values[] = $term->term_id;
                            }
                        }
                    }

                    // Remove empty items in the array
                    $values = array_filter( $values, 'strlen' );
                } else {
                    $values = [];
                }

                // Update post terms
                if ( taxonomy_exists( $attribute_names[ $i ] ) ) {
                    wp_set_object_terms( $post_id, $values, $attribute_names[ $i ] );
                }

                if ( ! empty( $values ) ) {
                    // Add attribute to array, but don't set values
                    $attributes[ $attribute_names[ $i ] ] = [
                        'name'         => $attribute_names[ $i ],
                        'value'        => '',
                        'position'     => $attribute_position[ $i ],
                        'is_visible'   => $is_visible,
                        'is_variation' => $is_variation,
                        'is_taxonomy'  => $is_taxonomy,
                    ];
                }
            } elseif ( isset( $attribute_values[ $i ] ) ) {

                // Text based, possibly separated by pipes (WC_DELIMITER). Preserve line breaks in non-variation attributes.
                $values = implode( ' ' . WC_DELIMITER . ' ', array_map( 'wc_clean', array_map( 'stripslashes', $attribute_values[ $i ] ) ) );

                // Custom attribute - Add attribute to array and set the values
                $attributes[ $attribute_names[ $i ] ] = [
                    'name'         => $attribute_names[ $i ],
                    'value'        => $values,
                    'position'     => $attribute_position[ $i ],
                    'is_visible'   => $is_visible,
                    'is_variation' => $is_variation,
                    'is_taxonomy'  => $is_taxonomy,
                ];
            }
        }
    }

    uasort( $attributes, 'wc_product_attribute_uasort_comparison' );

    /**
     * Unset removed attributes by looping over previous values and
     * unsetting the terms.
     */
    $old_attributes = array_filter( (array) maybe_unserialize( get_post_meta( $post_id, '_product_attributes', true ) ) );

    if ( ! empty( $old_attributes ) ) {
        foreach ( $old_attributes as $key => $value ) {
            if ( empty( $attributes[ $key ] ) && ! empty( $value['is_taxonomy'] ) && taxonomy_exists( $key ) ) {
                wp_set_object_terms( $post_id, [], $key );
            }
        }
    }

    update_post_meta( $post_id, '_product_attributes', $attributes );

    if ( in_array( $product_type, [ 'variable', 'grouped' ], true ) ) {
        // Variable and grouped products have no prices
        update_post_meta( $post_id, '_regular_price', '' );
        update_post_meta( $post_id, '_sale_price', '' );
        update_post_meta( $post_id, '_sale_price_dates_from', '' );
        update_post_meta( $post_id, '_sale_price_dates_to', '' );
    } else {
        // Sales and prices
        $date_from     = isset( $data['_sale_price_dates_from'] ) ? (string) wc_clean( $data['_sale_price_dates_from'] ) : '';
        $date_to       = isset( $data['_sale_price_dates_to'] ) ? (string) wc_clean( $data['_sale_price_dates_to'] ) : '';
        $regular_price = isset( $data['_regular_price'] ) ? (string) wc_clean( $data['_regular_price'] ) : '';
        $sale_price    = isset( $data['_sale_price'] ) ? (string) wc_clean( $data['_sale_price'] ) : '';
        $now           = dokan_current_datetime();

        // Update price if on sale
        if ( '' !== $sale_price && '' === $date_to && '' === $date_from ) {
            update_post_meta( $post_id, '_price', wc_format_decimal( $sale_price ) );
        } elseif ( '' !== $sale_price && $date_from && $now->modify( $date_from )->getTimestamp() <= $now->getTimestamp() ) {
            update_post_meta( $post_id, '_price', wc_format_decimal( $sale_price ) );
        } else {
            update_post_meta( $post_id, '_price', '' === $regular_price ? '' : wc_format_decimal( $regular_price ) );
        }

        //update product price if date to is smaller than current date
        if ( $date_to && $now->modify( $date_to )->getTimestamp() < $now->getTimestamp() ) {
            update_post_meta( $post_id, '_price', $regular_price );
        }
    }

    //enable reviews
    $comment_status = 'closed';

    if ( 'yes' === $data['_enable_reviews'] ) {
        $comment_status = 'open';
    }

    // Update the post into the database
    wp_update_post(
        [
            'ID'             => $post_id,
            'comment_status' => $comment_status,
        ]
    );

    // Sold Individually
    $sold_individually = ! empty( $data['_sold_individually'] ) && 'yes' === $data['_sold_individually'] ? 'yes' : 'no';
    update_post_meta( $post_id, '_sold_individually', $sold_individually );

    // Stock Data
    $manage_stock      = ! empty( $data['_manage_stock'] ) && 'grouped' !== $product_type ? 'yes' : 'no';
    $backorders        = ! empty( $data['_backorders'] ) && 'yes' === $manage_stock ? wc_clean( $data['_backorders'] ) : 'no';
    $stock_status      = ! empty( $data['_stock_status'] ) ? wc_clean( $data['_stock_status'] ) : 'instock';
    $stock_amount      = isset( $data['_stock'] ) ? wc_clean( $data['_stock'] ) : '';
    $stock_amount      = 'yes' === $manage_stock ? wc_stock_amount( wp_unslash( $stock_amount ) ) : '';
    $_low_stock_amount = isset( $data['_low_stock_amount'] ) ? wc_clean( $data['_low_stock_amount'] ) : '';
    $_low_stock_amount = 'yes' === $manage_stock ? wc_stock_amount( wp_unslash( $_low_stock_amount ) ) : '';

    // Stock Data
    if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) {
        $manage_stock = 'no';
        $backorders   = 'no';
        $stock_status = wc_clean( $data['_stock_status'] );
        if ( 'external' === $product_type ) {
            $stock_status = 'instock';
        } elseif ( 'variable' === $product_type ) {
            // Stock status is always determined by children so sync later
            $stock_status = '';
            if ( ! empty( $data['_manage_stock'] ) && $data['_manage_stock'] === 'yes' ) {
                $manage_stock = 'yes';
                $backorders   = wc_clean( $data['_backorders'] );
            }
        } elseif ( 'grouped' !== $product_type && ! empty( $data['_manage_stock'] ) ) {
            $manage_stock = $data['_manage_stock'];
            $backorders   = wc_clean( $data['_backorders'] );
        }

        update_post_meta( $post_id, '_manage_stock', $manage_stock );
        update_post_meta( $post_id, '_backorders', $backorders );
        if ( $stock_status ) {
            try {
                wc_update_product_stock_status( $post_id, $stock_status );
            } catch ( Exception $ex ) {
                dokan_log( 'product stock update exception' );
            }
        }

        // Retrieve original stock value from the hidden field
        $original_stock = isset( $data['_original_stock'] ) ? wc_stock_amount( wc_clean( $data['_original_stock'] ) ) : '';
        // Clean the current stock value
        $stock_amount = isset( $data['_stock'] ) ? wc_clean( $data['_stock'] ) : '';
        $stock_amount = 'yes' === $manage_stock ? wc_stock_amount( wp_unslash( $stock_amount ) ) : '';
        // Only update the stock amount if it has changed
        if ( $original_stock != $stock_amount ) {
            if ( 'variable' === $product_type ) {
                update_post_meta( $post_id, '_stock', $stock_amount );
            } else {
                wc_update_product_stock( $post_id, $stock_amount );
            }
        }

        // Update low stock amount regardless of stock changes
        $_low_stock_amount = isset( $data['_low_stock_amount'] ) ? wc_clean( $data['_low_stock_amount'] ) : '';
        $_low_stock_amount = 'yes' === $manage_stock ? wc_stock_amount( wp_unslash( $_low_stock_amount ) ) : '';
        update_post_meta( $post_id, '_low_stock_amount', $_low_stock_amount );
    } else {
        wc_update_product_stock_status( $post_id, wc_clean( $data['_stock_status'] ) );
    }

    // Downloadable options
    if ( 'yes' === $is_downloadable ) {
        $_download_limit = intval( $data['_download_limit'] );

        if ( ! $_download_limit || -1 === $_download_limit ) {
            $_download_limit = ''; // 0 or blank = unlimited
        }

        $_download_expiry = intval( $data['_download_expiry'] );
        if ( ! $_download_expiry || -1 === $_download_expiry ) {
            $_download_expiry = ''; // 0 or blank = unlimited
        }

        // file paths will be stored in an array keyed off md5(file path)
        if ( isset( $data['_wc_file_urls'] ) ) {
            $files = [];

            $file_names    = isset( $data['_wc_file_names'] ) ? array_map( 'wc_clean', $data['_wc_file_names'] ) : [];
            $file_urls     = array_map( 'esc_url_raw', array_map( 'trim', $data['_wc_file_urls'] ) );
            $file_url_size = count( $file_urls );

            for ( $i = 0; $i < $file_url_size; $i++ ) {
                if ( ! empty( $file_urls[ $i ] ) ) {
                    $files[ md5( $file_urls[ $i ] ) ] = [
                        'name' => $file_names[ $i ],
                        'file' => $file_urls[ $i ],
                    ];
                }
            }

            // grant permission to any newly added files on any existing orders for this product prior to saving
            do_action( 'dokan_process_file_download', $post_id, 0, $files );

            update_post_meta( $post_id, '_downloadable_files', $files );
        } else {
            update_post_meta( $post_id, '_downloadable_files', '' );
        }

        update_post_meta( $post_id, '_download_limit', $_download_limit );
        update_post_meta( $post_id, '_download_expiry', $_download_expiry );

        if ( isset( $data['_download_limit'] ) ) {
            update_post_meta( $post_id, '_download_limit', sanitize_text_field( $_download_limit ) );
        }
        if ( isset( $data['_download_expiry'] ) ) {
            update_post_meta( $post_id, '_download_expiry', sanitize_text_field( $_download_expiry ) );
        }

        if ( isset( $data['_download_type'] ) ) {
            update_post_meta( $post_id, '_download_type', wc_clean( $data['_download_type'] ) );
        }
    } elseif ( ! dokan_downloadable_hold_applies( $post_id ) ) {
        // the product is no longer downloadable and the change applies right away, so a
        // staged replacement must not apply on approval. When the untick is itself held,
        // the staged files stay put and the release handler resolves both together.
        delete_post_meta( $post_id, '_dokan_pending_downloadable_files' );
        delete_post_meta( $post_id, '_dokan_pending_downloadable_files_author' );
    }

    // Update SKU
    $old_sku = get_post_meta( $post_id, '_sku', true );
    delete_post_meta( $post_id, '_sku' );

    $product = wc_get_product( $post_id );

    $sku = sanitize_text_field( wp_unslash( $data['_sku'] ?? '' ) );
    try {
        $product->set_sku( $sku );
    } catch ( WC_Data_Exception $e ) {
        $product->set_sku( $old_sku );
        $woocommerce_errors[] = __( 'Product SKU must be unique', 'dokan-lite' );
    }

    // Set Sales and prices
    $product->set_regular_price( $regular_price ?? '' );
    $product->set_sale_price( $sale_price ?? '' );

    // Site timezone
    $tz_string = wc_timezone_string();
    $timezone  = $tz_string ? new DateTimeZone( $tz_string ) : new DateTimeZone( 'UTC' );

    // Sale starting date
    if ( ! empty( $date_from ) ) {
        try {
            $from_dt = new WC_DateTime( $date_from . ' 00:00:00', $timezone );
            $product->set_date_on_sale_from( $from_dt );
        } catch ( Exception $e ) {
            error_log( 'Invalid date_from: ' . $date_from . ' | ' . $e->getMessage() );
            $product->set_date_on_sale_from( null );
        }
    } else {
        $product->set_date_on_sale_from( null );
    }

    // Sale ending date
    if ( ! empty( $date_to ) ) {
        try {
            $to_dt = new WC_DateTime( $date_to . ' 23:59:59', $timezone );
            $product->set_date_on_sale_to( $to_dt );

            if ( empty( $date_from ) ) {
                // Automatically add date of today if start date is empty
                $from_obj = new WC_DateTime( 'now', $timezone );
                $product->set_date_on_sale_from( $from_obj );
            }
        } catch ( Exception $e ) {
            error_log( 'Invalid date_to: ' . $date_to . ' | ' . $e->getMessage() );
            $product->set_date_on_sale_to( null );
        }
    } else {
        $product->set_date_on_sale_to( null );
    }

    // save the product
    $product->save();

    // Do action for product type
    do_action( 'woocommerce_process_product_meta_' . $product_type, $post_id );
    do_action( 'dokan_process_product_meta', $post_id );

    // Clear cache/transients
    wc_delete_product_transients( $post_id );
}

/**
 * Grant downloadable file access to any newly added files on any existing.
 * orders for this product that have previously been granted downloadable file access.
 *
 * @param int   $product_id         product identifier
 * @param int   $variation_id       optional product variation identifier
 * @param array $downloadable_files newly set files
 *
 * @deprecated 3.8.0
 *
 * @return void
 */
function dokan_process_product_file_download_paths( int $product_id, int $variation_id, array $downloadable_files ) {
    wc_deprecated_function( 'dokan_process_product_file_download_paths', '3.8.0' );
    global $wpdb;

    if ( $variation_id ) {
        $product_id = $variation_id;
    }

    $product               = wc_get_product( $product_id );
    $existing_download_ids = array_keys( (array) $product->get_files() );
    $updated_download_ids  = array_keys( (array) $downloadable_files );
    $new_download_ids      = array_filter( array_diff( $updated_download_ids, $existing_download_ids ) );
    $removed_download_ids  = array_filter( array_diff( $existing_download_ids, $updated_download_ids ) );

    if ( ! empty( $new_download_ids ) || ! empty( $removed_download_ids ) ) {
        // determine whether downloadable file access has been granted via the typical order completion, or via the admin ajax method
        $permission_query = $wpdb->prepare( "SELECT * from {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE product_id = %d GROUP BY order_id", $product_id );
        $existing_permissions = $wpdb->get_results( $permission_query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        foreach ( $existing_permissions as $existing_permission ) {
            $order = wc_get_order( $existing_permission->order_id );

            if ( ! empty( dokan_get_prop( $order, 'id' ) ) ) {
                // Remove permissions
                if ( ! empty( $removed_download_ids ) ) {
                    foreach ( $removed_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_remove_access_to_old_file', true, $download_id, $product_id, $order ) ) {
                            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                            $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE order_id = %d AND product_id = %d AND download_id = %s", dokan_get_prop( $order, 'id' ), $product_id, $download_id ) );
                        }
                    }
                }
                // Add permissions
                if ( ! empty( $new_download_ids ) ) {
                    foreach ( $new_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_grant_access_to_new_file', true, $download_id, $product_id, $order ) ) {
                            // grant permission if it doesn't already exist
                            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                            if ( ! $wpdb->get_var( $wpdb->prepare( "SELECT 1=1 FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE order_id = %d AND product_id = %d AND download_id = %s", dokan_get_prop( $order, 'id' ), $product_id, $download_id ) ) ) {
                                wc_downloadable_file_permission( $download_id, $product_id, $order );
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Get discount coupon total from an order
 *
 * @param int $order_id
 *
 * @deprecated 3.8.0
 *
 * @return int
 */
function dokan_sub_order_get_total_coupon( int $order_id ): int {
    wc_deprecated_function( 'dokan_sub_order_get_total_coupon', '3.8.0' );
    global $wpdb;

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $result = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT SUM(oim.meta_value) FROM {$wpdb->prefix}woocommerce_order_itemmeta oim
            LEFT JOIN {$wpdb->prefix}woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
            WHERE oi.order_id = %d AND oi.order_item_type = 'coupon'",
            $order_id
        )
    );

    if ( $result ) {
        return $result;
    }

    return 0;
}

/**
 * Change seller display name to store name
 *
 * @since 2.4.10 [Change seller display name to store name]
 *
 * @param string $display_name
 *
 * @return string $display_name
 */
function dokan_seller_displayname( $display_name ) {
    if ( current_user_can( 'seller' ) && ! is_admin() ) {
        $seller_info  = dokan_get_store_info( dokan_get_current_user_id() );
        $display_name = ( ! empty( $seller_info['store_name'] ) ) ? $seller_info['store_name'] : $display_name;
    }

    return $display_name;
}

/**
 * Get featured products
 *
 * Shown on homepage
 *
 * @param int $per_page
 *
 * @return WP_Query
 */
function dokan_get_featured_products( $per_page = 9, $seller_id = '', $page = 1 ) {
    $args = [
        'posts_per_page'      => $per_page,
        'paged'               => $page,
        'post_status'         => 'publish',
        'ignore_sticky_posts' => 1,
        'tax_query'           => [ //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
            'relation' => 'AND',
        ],
    ];

    if ( ! empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    return dokan()->product->featured( apply_filters( 'dokan_get_featured_products', $args ) );
}

/**
 * Get the latest products
 *
 * Shown on homepage
 *
 * @param int $per_page
 *
 * @return WP_Query
 */
function dokan_get_latest_products( $per_page = 9, $seller_id = '', $page = 1 ) {
    $args = [
        'posts_per_page'      => $per_page,
        'paged'               => $page,
        'post_status'         => 'publish',
        'orderby'             => 'publish_date',
        'ignore_sticky_posts' => 1,
    ];

    if ( ! empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    return dokan()->product->latest( apply_filters( 'dokan_get_latest_products', $args ) );
}

/**
 * Get best-selling products
 *
 * Shown on homepage
 *
 * @param int $per_page
 *
 * @return WP_Query
 */
function dokan_get_best_selling_products( $per_page = 8, $seller_id = '', $page = 1, $hide_outofstock = false ) {
    $args = [
        'post_type'           => 'product',
        'post_status'         => 'publish',
        'ignore_sticky_posts' => 1,
        'posts_per_page'      => $per_page,
        'paged'               => $page,
    ];

    if ( ! empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    if ( $hide_outofstock ) {
        $args['meta_query'] = [ //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
            [
                'key'     => '_stock_status',
                'value'   => 'outofstock',
                'compare' => '!=',
            ],
        ];
    }

    return dokan()->product->best_selling( apply_filters( 'dokan_best_selling_query', $args ) );
}


/**
 * Check More product from Seller tab is active or not.
 *
 * @since 2.5
 *
 * @return boolean
 */
function check_more_seller_product_tab() {
    return 'on' === dokan_get_option( 'enabled_more_products_tab', 'dokan_general', 'on' );
}

/**
 * Check if Vendor Info tab enabled in single product page.
 *
 * @since 3.9.0
 *
 * @return boolean
 */
function is_enabled_vendor_info_product_tab() {
    return 'on' === dokan_get_option( 'show_vendor_info', 'dokan_general', 'off' );
}

/**
 * Get top-rated products
 *
 * Shown on homepage
 *
 * @param int $per_page
 *
 * @return WP_Query
 */
function dokan_get_top_rated_products( $per_page = 8, $seller_id = '', $page = 1 ) {
    $args = [
        'post_type'           => 'product',
        'post_status'         => 'publish',
        'ignore_sticky_posts' => 1,
        'posts_per_page'      => $per_page,
        'paged'               => $page,
    ];

    if ( ! empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    return dokan()->product->top_rated( apply_filters( 'dokan_top_rated_query', $args ) );
}

/**
 * Get products on-sale
 *
 * Shown on homepage
 *
 * @param int $per_page
 * @param int $paged
 * @param int $seller_id
 *
 * @return WP_Query
 */
function dokan_get_on_sale_products( int $per_page = 10, int $paged = 1, int $seller_id = 0 ): WP_Query {
    // Get products on sale
    $product_ids_on_sale = wc_get_product_ids_on_sale();

    $args = [
        'posts_per_page' => $per_page,
        'no_found_rows'  => 1,
        'paged'          => $paged,
        'post_status'    => 'publish',
        'post_type'      => 'product',
        'post__in'       => array_merge( [ 0 ], $product_ids_on_sale ),
        'meta_query'     => [ //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
            [
                'key'     => '_visibility',
                'value'   => [ 'catalog', 'visible' ],
                'compare' => 'IN',
            ],
            [
                'key'     => '_stock_status',
                'value'   => 'instock',
                'compare' => '=',
            ],
        ],
    ];

    if ( ! empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    return new WP_Query( apply_filters( 'dokan_on_sale_products_query', $args ) );
}

/**
 * Get current balance of a seller
 *
 * Total = SUM(net_amount) - SUM(withdraw)
 *
 * @param int  $seller_id
 * @param bool $formatted
 *
 * @return float|string float if formatted is false, string otherwise
 */
function dokan_get_seller_balance( $seller_id, $formatted = true ) {
    $vendor = dokan()->vendor->get( $seller_id );

    return $vendor->get_balance( $formatted );
}

/**
 * Get Seller Earned amount
 *
 * @since 2.5.4
 *
 * @param boolean $formatted
 * @param string  $on_date
 *
 * @param int     $seller_id
 *
 * @return float|null
 */
function dokan_get_seller_earnings( $seller_id, $formatted = true, $on_date = '' ) {
    $vendor = dokan()->vendor->get( $seller_id );

    if ( $vendor->id === 0 ) {
        return null;
    }

    return $vendor->get_earnings( $formatted, $on_date );
}

/**
 * Get seller rating
 *
 * @param int $seller_id
 *
 * @return array
 */
function dokan_get_seller_rating( $seller_id ) {
    $vendor = dokan()->vendor->get( $seller_id );

    return $vendor->get_rating();
}

/**
 * Get seller rating in a readable rating format
 *
 * @param int $seller_id
 *
 * @return string
 */
function dokan_get_readable_seller_rating( $seller_id ) {
    $vendor = dokan()->vendor->get( $seller_id );

    return $vendor->get_readable_rating( false );
}

add_filter( 'woocommerce_dashboard_status_widget_sales_query', 'dokan_filter_woocommerce_dashboard_status_widget_sales_query' );

/**
 * Woocommerce Admin dashboard Sales Report Synced with Dokan Dashboard report
 *
 * @since  2.4.3
 *
 * @param array $query
 *
 * @return array
 */
function dokan_filter_woocommerce_dashboard_status_widget_sales_query( $query ) {
    global $wpdb;

    $query['where'] .= " AND posts.ID NOT IN ( SELECT post_parent FROM {
    $wpdb->posts} WHERE post_type IN ( '" . implode( "','", array_merge( wc_get_order_types( 'sales-reports' ), [ 'shop_order_refund' ] ) ) . "' ) )";

    return $query;
}

/**
 * Handle password edit and name update functions
 *
 * @since 2.4.10
 *
 * @return void
 */
function dokan_save_account_details() {
    if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'dokan_save_account_details' ) ) {
        return;
    }

    $errors = new WP_Error();
    $user   = new stdClass();

    $user->ID     = (int) get_current_user_id();
    $current_user = get_user_by( 'id', $user->ID );

    if ( $user->ID <= 0 ) {
        return;
    }

    $account_first_name = ! empty( $_POST['account_first_name'] ) ? wc_clean( wp_unslash( $_POST['account_first_name'] ) ) : '';
    $account_last_name  = ! empty( $_POST['account_last_name'] ) ? wc_clean( wp_unslash( $_POST['account_last_name'] ) ) : '';
    $account_email      = ! empty( $_POST['account_email'] ) ? sanitize_email( wp_unslash( $_POST['account_email'] ) ) : '';
    $pass_cur           = ! empty( $_POST['password_current'] ) ? wp_unslash( $_POST['password_current'] ) : ''; // phpcs:ignore
    $pass1              = ! empty( $_POST['password_1'] ) ? wp_unslash( $_POST['password_1'] ) : ''; // phpcs:ignore
    $pass2              = ! empty( $_POST['password_2'] ) ? wp_unslash( $_POST['password_2'] ) : ''; // phpcs:ignore
    $save_pass          = true;

    $user->first_name = $account_first_name;
    $user->last_name  = $account_last_name;

    // Prevent emails being displayed, or leave alone.
    $user->display_name = is_email( $current_user->display_name ) ? $user->first_name : $current_user->display_name;

    // Handle required fields
    $required_fields = apply_filters(
        'woocommerce_save_account_details_required_fields', [
            'account_first_name' => __( 'First Name', 'dokan-lite' ),
            'account_last_name'  => __( 'Last Name', 'dokan-lite' ),
            'account_email'      => __( 'Email address', 'dokan-lite' ),
        ]
    );

    foreach ( $required_fields as $field_key => $field_name ) {
        if ( empty( $_POST[ $field_key ] ) ) {
            wc_add_notice( '<strong>' . esc_html( $field_name ) . '</strong> ' . __( 'is a required field.', 'dokan-lite' ), 'error' );
        }
    }

    if ( $account_email ) {
        if ( ! is_email( $account_email ) ) {
            wc_add_notice( __( 'Please provide a valid email address.', 'dokan-lite' ), 'error' );
        } elseif ( email_exists( $account_email ) && $account_email !== $current_user->user_email ) {
            wc_add_notice( __( 'This email address is already registered.', 'dokan-lite' ), 'error' );
        }
        $user->user_email = $account_email;
    }

    if ( ! empty( $pass1 ) && ! wp_check_password( $pass_cur, $current_user->user_pass, $current_user->ID ) ) {
        wc_add_notice( __( 'Your current password is incorrect.', 'dokan-lite' ), 'error' );
        $save_pass = false;
    }

    if ( ! empty( $pass_cur ) && empty( $pass1 ) && empty( $pass2 ) ) {
        wc_add_notice( __( 'Please fill out all password fields.', 'dokan-lite' ), 'error' );
        $save_pass = false;
    } elseif ( ! empty( $pass1 ) && empty( $pass_cur ) ) {
        wc_add_notice( __( 'Please enter your current password.', 'dokan-lite' ), 'error' );
        $save_pass = false;
    } elseif ( ! empty( $pass1 ) && empty( $pass2 ) ) {
        wc_add_notice( __( 'Please re-enter your password.', 'dokan-lite' ), 'error' );
        $save_pass = false;
    } elseif ( ( ! empty( $pass1 ) || ! empty( $pass2 ) ) && $pass1 !== $pass2 ) {
        wc_add_notice( __( 'New passwords do not match.', 'dokan-lite' ), 'error' );
        $save_pass = false;
    }

    if ( $pass1 && $save_pass ) {
        $user->user_pass = $pass1;
    }

    // Allow plugins to return their own errors.
    do_action_ref_array( 'woocommerce_save_account_details_errors', [ &$errors, &$user ] );

    if ( $errors->get_error_messages() ) {
        foreach ( $errors->get_error_messages() as $error ) {
            wc_add_notice( $error, 'error' );
        }
    }

    if ( wc_notice_count( 'error' ) === 0 ) {
        wp_update_user( $user );

        wc_add_notice( __( 'Account details changed successfully.', 'dokan-lite' ) );

        do_action( 'woocommerce_save_account_details', $user->ID );

        wp_safe_redirect( dokan_get_navigation_url( 'edit-account' ) );
        exit;
    }
}

add_action( 'template_redirect', 'dokan_save_account_details' );

/**
 * Remove banner when without banner layout selected for profile
 *
 * @param array $progress_values
 *
 * @return array
 */
function dokan_split_profile_completion_value( $progress_values ) {
    $store_banner = dokan_get_option( 'store_header_template', 'dokan_appearance' );

    if ( 'layout3' === $store_banner ) {
        unset( $progress_values['banner_val'] );

        $progress_values['store_name_val'] = 15;
        $progress_values['phone_val']      = 15;
        $progress_values['address_val']    = 15;
    }

    return $progress_values;
}

add_filter( 'dokan_profile_completion_values', 'dokan_split_profile_completion_value', 10 );

/**
 * Set More products from seller tab on Single Product Page
 *
 * @since 2.5
 *
 * @param array $tabs
 *
 * @return array
 */
function dokan_set_more_from_seller_tab( $tabs ) {
    if ( check_more_seller_product_tab() ) {
        $tabs['more_seller_product'] = [
            'title'    => __( 'More Products', 'dokan-lite' ),
            'priority' => 99,
            'callback' => 'dokan_get_more_products_from_seller',
        ];
    }

    return $tabs;
}

add_action( 'woocommerce_product_tabs', 'dokan_set_more_from_seller_tab', 10 );

/**
 * Show more products from current seller
 *
 * @since 2.5
 * @since 3.2.2 added filter 'dokan_get_more_products_per_page'
 *
 * @param int|string $seller_id
 * @param int|string $posts_per_page
 *
 * @return void
 */
function dokan_get_more_products_from_seller( $seller_id = 0, $posts_per_page = 6 ) {
    global $product, $post;

    if ( $seller_id === 0 || 'more_seller_product' === $seller_id ) {
        $seller_id = $post->post_author;
    }

    if ( ! is_int( $posts_per_page ) ) {
        $posts_per_page = apply_filters( 'dokan_get_more_products_per_page', 6 );
    }

    $args = [
        'post_type'      => 'product',
        'posts_per_page' => $posts_per_page,
        'orderby'        => 'rand',
        'post__not_in'   => [ $post->ID ],
        'author'         => $seller_id,
    ];

    $products = new WP_Query( $args );

    if ( $products->have_posts() ) {
        woocommerce_product_loop_start();

        while ( $products->have_posts() ) {
            $products->the_post();
            wc_get_template_part( 'content', 'product' );
        }

        woocommerce_product_loop_end();
    } else {
        esc_html_e( 'No product has been found!', 'dokan-lite' );
    }

    wp_reset_postdata();
}

/**
 * Keep old vendor after duplicate any product
 *
 * @param WC_Product $duplicate
 * @param WC_Product $product
 *
 * @return void
 */
function dokan_keep_old_vendor_woocommerce_duplicate_product( $duplicate, $product ) {
    $old_author = get_post_field( 'post_author', $product->get_id() );
    $new_author = get_post_field( 'post_author', $duplicate->get_id() );

    if ( absint( $old_author ) === absint( $new_author ) ) {
        return;
    }

    dokan_override_product_author( $duplicate, absint( $old_author ) );
}

add_action( 'woocommerce_product_duplicate', 'dokan_keep_old_vendor_woocommerce_duplicate_product', 35, 2 );

/**
 * @since 3.7.24
 *
 * @param boolean $is_purchasable
 * @param object $product
 *
 * @return boolean
 */
function dokan_vendor_own_product_purchase_restriction( bool $is_purchasable, $product ): bool {
    if ( false === $is_purchasable || dokan_is_product_author( $product->get_id() ) ) {
        $is_purchasable = false;
    }

    /**
     * Determines if a vendor can purchase their own products.
     *
     * This filter allows altering the purchasable status of a product based on whether
     * the vendor is attempting to purchase their own product. It can be used to restrict
     * or allow such purchases according to business rules.
     *
     * @since 3.10.3
     *
     * @param bool    $is_purchasable Indicates if the product is purchasable. True by default.
     * @param WP_Post $product        The product object being evaluated for purchasability.
     *
     * @return bool Modified purchasability status.
     */
    return apply_filters( 'dokan_vendor_own_product_purchase_restriction', $is_purchasable, $product );
}

add_filter( 'woocommerce_is_purchasable', 'dokan_vendor_own_product_purchase_restriction', 10, 2 );

/**
 * Restricts vendor from reviewing own product
 *
 * @since 3.7.24
 *
 * @param array $data
 * @return array
 */
function dokan_vendor_product_review_restriction( array $data ): array {
    global $product;
    if ( ! is_user_logged_in() ) {
        return $data;
    }
    if ( dokan_is_product_author( $product->get_id() ) ) {
        $data['title_reply'] = __( 'Reviews cannot be posted for products that you own.', 'dokan-lite' );
        $data['comment_field'] = '';
        $data['fields'] = [];
        $data['submit_field'] = '';
        $data['submit_button'] = '';
    }
    return $data;
}
add_filter( 'woocommerce_product_review_comment_form_args', 'dokan_vendor_product_review_restriction' );

/**
 * Get the downloadable files a vendor submitted while the product awaits approval.
 *
 * @since DOKAN_SINCE
 *
 * @param int $product_id Product or variation ID.
 *
 * @return array|null Staged files keyed by download id (may be empty when the vendor
 *                    removed every file), null when nothing is staged.
 */
function dokan_get_staged_downloadable_files( $product_id ) {
    $staged = get_post_meta( $product_id, '_dokan_pending_downloadable_files', true );

    return is_array( $staged ) ? $staged : null;
}

/**
 * Get the product statuses in which downloadable file changes reach customers directly.
 *
 * Any other status is treated as awaiting review, so a changed file set is staged
 * until the product reaches one of these statuses.
 *
 * Only `publish` releases. A status a vendor can reach on their own must never be in
 * this list, or the vendor could release their own submission: `dokan_get_available_post_status()`
 * withholds `publish` from an untrusted vendor, and Dokan Pro downgrades a submitted
 * `publish` back to pending, so `publish` is reachable only through a reviewer.
 *
 * @since DOKAN_SINCE
 *
 * @param int $product_id Product ID.
 *
 * @return string[]
 */
function dokan_get_downloadable_files_released_statuses( $product_id = 0 ) {
    /**
     * Filter the product statuses in which downloadable file changes are delivered to customers immediately.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $released_statuses Post statuses that release staged files.
     * @param int      $product_id        Product ID.
     */
    return (array) apply_filters( 'dokan_downloadable_files_released_statuses', [ 'publish' ], $product_id );
}

/**
 * Get the product statuses that discard a pending downloadable file submission.
 *
 * Rejecting is the gesture the marketplace actually ships for saying no, so it must drop
 * the submission: otherwise the next approval would deliver the very file the
 * administrator turned down.
 *
 * @since DOKAN_SINCE
 *
 * @param int $product_id Product ID.
 *
 * @return string[]
 */
function dokan_get_downloadable_files_rejected_statuses( $product_id = 0 ) {
    /**
     * Filter the product statuses that discard a pending downloadable file submission.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $rejected_statuses Post statuses that discard staged files.
     * @param int      $product_id        Product ID.
     */
    return (array) apply_filters( 'dokan_downloadable_files_rejected_statuses', [ 'reject', 'trash' ], $product_id );
}

/**
 * Check whether two downloadable file sets point to different files.
 *
 * Compared by file URL rather than download id: the classic vendor form keys files by
 * `md5( url )` while WooCommerce CRUD saves generate UUID ids, so ids differ between
 * save paths even when the files are the same.
 *
 * @since DOKAN_SINCE
 *
 * @param array $files_a Files keyed by download id, each with a `file` URL.
 * @param array $files_b Files keyed by download id, each with a `file` URL.
 *
 * @return bool
 */
function dokan_downloadable_file_sets_differ( $files_a, $files_b ) {
    $urls = static function ( $files ) {
        $list = [];

        foreach ( (array) $files as $file ) {
            if ( is_array( $file ) && ! empty( $file['file'] ) ) {
                $list[] = trim( (string) $file['file'] );
            }
        }

        $list = array_values( array_unique( $list ) );
        sort( $list );

        return $list;
    };

    return $urls( $files_a ) !== $urls( $files_b );
}

/**
 * Check whether downloadable file changes on this product are held for admin approval.
 *
 * Three things must hold: the product is not in a released status, the save is genuinely
 * subject to review (a vendor whose products need approval — not a trusted vendor, a
 * marketplace with approval switched off, or a shop manager's own product), and at least
 * one customer already holds a download permission, since the hold exists to protect them.
 *
 * @since DOKAN_SINCE
 *
 * @param int $product_id Product or variation ID (the ID permissions are stored under).
 *
 * @return bool
 */
function dokan_downloadable_hold_applies( $product_id ) {
    global $wpdb;

    $product  = wc_get_product( $product_id );
    $owner_id = $product && $product->is_type( 'variation' ) ? $product->get_parent_id() : $product_id;
    $applies  = false;

    if ( $owner_id && ! in_array( get_post_status( $owner_id ), dokan_get_downloadable_files_released_statuses( $owner_id ), true ) ) {
        $author = (int) get_post_field( 'post_author', $owner_id );

        // only a vendor whose saves actually pass through review is held: someone who
        // can manage WooCommerce is the reviewer, not the reviewed, and a trusted vendor
        // or a marketplace with approval switched off has no review step at all
        if ( $author && ! user_can( $author, 'manage_woocommerce' ) && 'publish' !== dokan_get_default_product_status( $author ) ) {
            // the hold only matters when somebody already holds a download permission
            $has_permissions = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->prepare(
                    "SELECT permission_id FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE product_id = %d LIMIT 1",
                    $product_id
                )
            );

            $applies = ! empty( $has_permissions );
        }
    }

    /**
     * Filter whether downloadable file changes on a product are held until admin approval.
     *
     * @since DOKAN_SINCE
     *
     * @param bool $applies    Whether the hold applies.
     * @param int  $product_id Product or variation ID.
     */
    return (bool) apply_filters( 'dokan_downloadable_hold_applies', $applies, $product_id );
}

/**
 * Track products whose staged files were released during this request.
 *
 * WooCommerce writes `_downloadable_files` *after* the `save_post` that triggers the
 * release, so a save that both approves the product and sets the files lands its own set
 * last. Remembering the release lets that later write re-point existing permissions at
 * what actually ended up live, instead of leaving them on the released set.
 *
 * @since DOKAN_SINCE
 *
 * @param int        $product_id Product or variation ID.
 * @param array|null $set        The files that were live before the release, to record it;
 *                               null to read the recorded set back.
 *
 * @return array|null The pre-release files when this request performed the release, else null.
 */
function dokan_downloadable_files_released_this_request( $product_id, $set = null ) {
    static $released = [];

    if ( is_array( $set ) ) {
        $released[ $product_id ] = [
            'files' => $set,
            'token' => did_action( 'save_post' ),
        ];

        return $set;
    }

    if ( ! isset( $released[ $product_id ] ) ) {
        return null;
    }

    // only the save that performed the release may claim it: WooCommerce writes the meta
    // straight after that save's `save_post`, so the counter has not moved on yet
    if ( $released[ $product_id ]['token'] !== did_action( 'save_post' ) ) {
        unset( $released[ $product_id ] );

        return null;
    }

    return $released[ $product_id ]['files'];
}

/**
 * Hold a changed downloadable file set until an admin approves it.
 *
 * Every save path writes `_downloadable_files` through `update_post_meta()` — the classic
 * vendor form writes it directly, and WooCommerce CRUD (the REST endpoints, the product
 * editor, the wp-admin screen and WP-CLI) writes it from `update_downloads()`. Filtering
 * the meta write itself therefore covers all of them from one place: while the product
 * awaits review the submitted set is stored in `_dokan_pending_downloadable_files` and the
 * live value is left untouched, so existing customers keep the files they already have.
 *
 * @since DOKAN_SINCE
 *
 * @param mixed  $check      Short-circuit value; null lets the write continue.
 * @param int    $object_id  Product or variation ID.
 * @param string $meta_key   Meta key being written.
 * @param mixed  $meta_value Value being written.
 *
 * @return mixed True to swallow the write, otherwise the unchanged short-circuit value.
 */
function dokan_hold_downloadable_files_meta_write( $check, $object_id, $meta_key, $meta_value = null ) {
    if ( null !== $check || ! in_array( $meta_key, [ '_downloadable_files', '_downloadable' ], true ) ) {
        return $check;
    }

    if ( ! in_array( get_post_type( $object_id ), [ 'product', 'product_variation' ], true ) ) {
        return $check;
    }

    if ( dokan_releasing_staged_downloadable_files() ) {
        // the release step is writing the approved values; never intercept that
        return $check;
    }

    if ( '_downloadable' === $meta_key ) {
        return dokan_hold_downloadable_flag_meta_write( $check, $object_id, $meta_value );
    }

    // `update_metadata()` unslashes before firing this filter, so the value here is already
    // the real one; it is re-slashed on the way into storage so it round-trips unchanged
    $new_files = is_array( $meta_value ) ? $meta_value : [];

    if ( ! dokan_downloadable_hold_applies( $object_id ) ) {
        $staged_here  = dokan_get_staged_downloadable_files( $object_id );
        $pre_release  = dokan_downloadable_files_released_this_request( $object_id );

        if ( null === $staged_here && null === $pre_release ) {
            return $check;
        }

        // Work out whether this save is really setting the files or just echoing back
        // what it was given. A REST client that reads a product, flips its status and
        // PUTs it back sends the files it was handed — that is an approval, not an edit.
        $baseline = null !== $pre_release ? $pre_release : (array) get_post_meta( $object_id, '_downloadable_files', true );

        if ( ! dokan_downloadable_file_sets_differ( $baseline, $new_files ) ) {
            // an echo: leave the released files in place
            return null !== $pre_release ? true : $check;
        }

        // a genuine edit by the approver: their set wins over the staged submission, and
        // `_downloadable_files` still holds the previous value so the permission handler
        // can move existing customers onto the incoming one
        delete_post_meta( $object_id, '_dokan_pending_downloadable_files' );
        delete_post_meta( $object_id, '_dokan_pending_downloadable_files_author' );

        $variation_id = 'product_variation' === get_post_type( $object_id ) ? $object_id : 0;
        $owner_id     = $variation_id ? wp_get_post_parent_id( $object_id ) : $object_id;

        dokan_releasing_staged_downloadable_files( true );
        do_action( 'dokan_process_file_download', $owner_id, $variation_id, $new_files );
        dokan_releasing_staged_downloadable_files( false );

        return $check;
    }

    $live_files = get_post_meta( $object_id, '_downloadable_files', true );

    if ( ! dokan_downloadable_file_sets_differ( is_array( $live_files ) ? $live_files : [], $new_files ) ) {
        // The submitted set matches what is already live. Only the vendor putting their
        // own files back counts as withdrawing the submission: anyone else saving the
        // product — an admin opening it to review the pending files, for instance — is
        // re-submitting the rendered approved set and must not discard it.
        $owner_id = 'product_variation' === get_post_type( $object_id ) ? wp_get_post_parent_id( $object_id ) : $object_id;

        if ( dokan_is_product_author( $owner_id ) ) {
            delete_post_meta( $object_id, '_dokan_pending_downloadable_files' );
            delete_post_meta( $object_id, '_dokan_pending_downloadable_files_author' );
        }

        // The files are the same but their download ids may have been re-keyed: the classic
        // form keys by `md5( url )` while CRUD saves generate UUIDs or use attachment ids, so
        // saving the same product through a different path rewrites every id. Download
        // permissions are keyed by download id, so they have to follow the re-key or the
        // customer loses access to a file that never actually changed. The hold blocks the
        // permission handler, and nothing is staged here (the URLs match), so without this
        // the permission would be orphaned with no later step to repair it.
        if ( array_keys( (array) $live_files ) !== array_keys( $new_files ) ) {
            $variation_id = 'product_variation' === get_post_type( $object_id ) ? $object_id : 0;

            // safe while held: the file behind the id is byte-for-byte what the customer
            // already had, so nothing unreviewed reaches them
            dokan_releasing_staged_downloadable_files( true );
            do_action( 'dokan_process_file_download', $owner_id, $variation_id, $new_files );
            dokan_releasing_staged_downloadable_files( false );
        }

        return $check;
    }

    update_post_meta( $object_id, '_dokan_pending_downloadable_files', wp_slash( $new_files ) );

    // remembered so the admin review panel can say whose files these are: a reviewer
    // editing the rows on a product that stays pending stages their own set here too
    update_post_meta( $object_id, '_dokan_pending_downloadable_files_author', dokan_get_current_user_id() );

    dokan_mark_parent_has_staged_downloadables( $object_id );

    // swallow the write: the approved files stay live for existing customers
    return true;
}
add_filter( 'update_post_metadata', 'dokan_hold_downloadable_files_meta_write', 10, 5 );

/**
 * Hold the "Downloadable" flag until an admin approves it.
 *
 * `WC_Product::has_file()` gates on `is_downloadable()`, so writing `no` drops the product
 * out of `wc_get_customer_available_downloads()` entirely — a vendor unticking the box on a
 * pending product would revoke a paying customer's access before any review, which is the
 * same gap as a file swap and revokes rather than substitutes.
 *
 * @since DOKAN_SINCE
 *
 * @param mixed $check      Short-circuit value; null lets the write continue.
 * @param int   $object_id  Product or variation ID.
 * @param mixed $meta_value Value being written.
 *
 * @return mixed True to swallow the write, otherwise the unchanged short-circuit value.
 */
function dokan_hold_downloadable_flag_meta_write( $check, $object_id, $meta_value ) {
    if ( ! dokan_downloadable_hold_applies( $object_id ) ) {
        return $check;
    }

    $submitted = 'yes' === $meta_value ? 'yes' : 'no';
    $live      = 'yes' === get_post_meta( $object_id, '_downloadable', true ) ? 'yes' : 'no';

    if ( $submitted === $live ) {
        // back to what is already live: nothing left awaiting approval
        delete_post_meta( $object_id, '_dokan_pending_downloadable' );

        return $check;
    }

    // Note on withdrawing a staged untick: the classic vendor form writes `_downloadable`
    // on every save, so re-ticking reaches the branch above and cancels the removal. A CRUD
    // save only writes the meta when the value differs from what is stored — and the stored
    // value is deliberately still the approved one — so re-ticking there is a no-op that
    // leaves the removal staged. The vendor still sees the pending state, because the REST
    // read surfaces the staged flag; the removal simply has to be withdrawn from the
    // product form, or discarded by the administrator.

    update_post_meta( $object_id, '_dokan_pending_downloadable', $submitted );

    dokan_mark_parent_has_staged_downloadables( $object_id );

    // swallow the write: existing customers keep their downloads until an admin approves
    return true;
}

/**
 * Flag a variable parent so the release handler knows a child has something staged.
 *
 * Release runs on the parent's `save_post`; without this marker it would have to load the
 * product and walk its children on every save just to discover there is nothing to do.
 *
 * @since DOKAN_SINCE
 *
 * @param int $object_id Product or variation ID.
 *
 * @return void
 */
function dokan_mark_parent_has_staged_downloadables( $object_id ) {
    if ( 'product_variation' !== get_post_type( $object_id ) ) {
        return;
    }

    $parent_id = wp_get_post_parent_id( $object_id );

    if ( $parent_id ) {
        update_post_meta( $parent_id, '_dokan_pending_downloadable_children', 'yes' );
    }
}

/**
 * Get the "Downloadable" flag a vendor submitted while the product awaits approval.
 *
 * @since DOKAN_SINCE
 *
 * @param int $product_id Product or variation ID.
 *
 * @return string|null `yes` or `no` when a change is staged, null when nothing is staged.
 */
function dokan_get_staged_downloadable_flag( $product_id ) {
    $staged = get_post_meta( $product_id, '_dokan_pending_downloadable', true );

    return in_array( $staged, [ 'yes', 'no' ], true ) ? $staged : null;
}

/**
 * Hold the removal of every downloadable file until an admin approves it.
 *
 * WooCommerce deletes `_downloadable_files` rather than writing an empty value when a
 * product ends up with no files, so the deletion needs the same hold as a replacement.
 *
 * @since DOKAN_SINCE
 *
 * @param mixed  $check     Short-circuit value; null lets the delete continue.
 * @param int    $object_id Product or variation ID.
 * @param string $meta_key  Meta key being deleted.
 *
 * @return mixed True to swallow the delete, otherwise the unchanged short-circuit value.
 */
function dokan_hold_downloadable_files_meta_delete( $check, $object_id, $meta_key ) {
    if ( '_downloadable_files' !== $meta_key ) {
        return $check;
    }

    return dokan_hold_downloadable_files_meta_write( $check, $object_id, $meta_key, [] );
}
add_filter( 'delete_post_metadata', 'dokan_hold_downloadable_files_meta_delete', 10, 3 );

/**
 * Track whether the release step is currently writing a product's approved files.
 *
 * @since DOKAN_SINCE
 *
 * @param bool|null $set True to enter the release, false to leave it, null to read.
 *
 * @return bool
 */
function dokan_releasing_staged_downloadable_files( $set = null ) {
    static $releasing = false;

    if ( null !== $set ) {
        $releasing = (bool) $set;
    }

    return $releasing;
}

/**
 * Block download permission changes while a product's files are held.
 *
 * The permission handler runs before the file meta is written, so the hold has to stop it
 * separately: without this the vendor's save would move existing customers onto files that
 * are not live yet.
 *
 * @since DOKAN_SINCE
 *
 * @param bool   $allowed     Whether the permission change may go ahead.
 * @param string $download_id Download id.
 * @param int    $product_id  Product or variation ID.
 *
 * @return bool
 */
function dokan_block_held_download_permission_change( $allowed, $download_id, $product_id ) {
    static $held = [];

    if ( dokan_releasing_staged_downloadable_files() ) {
        // a release re-evaluates from scratch, and it is the only thing that changes the
        // answer mid-request, so the cache below cannot go stale behind it
        $held = [];

        return $allowed;
    }

    // The permission handler asks once per download id per order; without this the hold
    // check would repeat a product load, a capability check and a query for each one.
    // Keyed by status as well as id, since the status is what the answer turns on.
    $key = $product_id . '|' . get_post_status( $product_id );

    if ( ! isset( $held[ $key ] ) ) {
        $held[ $key ] = dokan_downloadable_hold_applies( $product_id );
    }

    return $held[ $key ] ? false : $allowed;
}
add_filter( 'woocommerce_process_product_file_download_paths_remove_access_to_old_file', 'dokan_block_held_download_permission_change', 10, 3 );
add_filter( 'woocommerce_process_product_file_download_paths_grant_access_to_new_file', 'dokan_block_held_download_permission_change', 10, 3 );

/**
 * Release staged downloadable files once a product is approved.
 *
 * Runs late on `save_post` (priority 999) so it is the final word on every approval route
 * — the Dokan admin dashboard, WP quick edit, the WooCommerce product edit screen, REST
 * and WP-CLI. WooCommerce's own meta box save (priority 1) re-writes the previously
 * approved files from the submitted form; this runs afterwards. If the approving save set
 * the files itself, that set wins and the staged submission is discarded.
 *
 * @since DOKAN_SINCE
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 *
 * @return void
 */
function dokan_apply_staged_downloadable_files( $post_id, $post ) {
    if ( 'product' !== $post->post_type ) {
        return;
    }

    if ( ! in_array( $post->post_status, dokan_get_downloadable_files_released_statuses( $post_id ), true ) ) {
        return;
    }

    // cheap early-out before loading the product: almost every product save has nothing
    // staged, and post meta is already primed with the post
    $has_own_staging = null !== dokan_get_staged_downloadable_files( $post_id ) || null !== dokan_get_staged_downloadable_flag( $post_id );

    if ( ! $has_own_staging && ! get_post_meta( $post_id, '_dokan_pending_downloadable_children', true ) ) {
        return;
    }

    $product = wc_get_product( $post_id );

    if ( ! $product ) {
        return;
    }

    $targets = [
        [
            'product_id'   => $post_id,
            'variation_id' => 0,
        ],
    ];

    if ( $product->is_type( 'variable' ) ) {
        foreach ( $product->get_children() as $child ) {
            $targets[] = [
                'product_id'   => $post_id,
                'variation_id' => (int) $child,
            ];
        }
    }

    foreach ( $targets as $target ) {
        $meta_id     = $target['variation_id'] ? $target['variation_id'] : $target['product_id'];
        $staged      = dokan_get_staged_downloadable_files( $meta_id );
        $staged_flag = dokan_get_staged_downloadable_flag( $meta_id );

        if ( null !== $staged_flag ) {
            // applied before the files below, so approving an untick correctly ends with
            // the product serving no downloads at all
            dokan_releasing_staged_downloadable_files( true );
            update_post_meta( $meta_id, '_downloadable', $staged_flag );
            dokan_releasing_staged_downloadable_files( false );

            delete_post_meta( $meta_id, '_dokan_pending_downloadable' );
        }

        if ( null === $staged ) {
            continue;
        }

        if ( 'yes' !== get_post_meta( $meta_id, '_downloadable', true ) ) {
            // the product no longer serves downloads; the submission is moot
            delete_post_meta( $meta_id, '_dokan_pending_downloadable_files' );
            delete_post_meta( $meta_id, '_dokan_pending_downloadable_files_author' );

            continue;
        }

        $pre_release = get_post_meta( $meta_id, '_downloadable_files', true );
        dokan_downloadable_files_released_this_request( $meta_id, is_array( $pre_release ) ? $pre_release : [] );
        dokan_releasing_staged_downloadable_files( true );

        // move existing customers over to the newly approved files; the permission
        // handler diffs against the still-live approved files, so it must run first
        do_action( 'dokan_process_file_download', $target['product_id'], $target['variation_id'], $staged );

        if ( empty( $staged ) ) {
            delete_post_meta( $meta_id, '_downloadable_files' );
        } else {
            // slashed to match how WooCommerce writes this meta, since it is unslashed once on the way in
            update_post_meta( $meta_id, '_downloadable_files', wp_slash( $staged ) );
        }

        dokan_releasing_staged_downloadable_files( false );

        // cleared last so a fatal in a permission hook does not drop the vendor's submission
        delete_post_meta( $meta_id, '_dokan_pending_downloadable_files' );
        delete_post_meta( $meta_id, '_dokan_pending_downloadable_files_author' );
    }

    delete_post_meta( $post_id, '_dokan_pending_downloadable_children' );
}
add_action( 'save_post', 'dokan_apply_staged_downloadable_files', 999, 2 );

/**
 * Keep download permissions aligned when a CRUD save changes a product's files.
 *
 * The classic vendor form fires `dokan_process_file_download` itself, so a file change made
 * there moves existing customers onto the new file. WooCommerce CRUD saves — the REST
 * endpoints, the new product editor, the wp-admin screen and WP-CLI — fire
 * `woocommerce_process_product_file_download_paths` instead, and nothing listens to it:
 * neither WooCommerce core nor Dokan. So a file swap made through any of those paths
 * rewrote `_downloadable_files` and left every existing permission pointing at a download
 * id the product no longer offers, and the customer's My Account -> Downloads went empty.
 *
 * Forwarding the action to the same handler closes that: permissions follow the files
 * whichever path wrote them. While a product is held the permission change is blocked by
 * `dokan_block_held_download_permission_change()` exactly as it is on the classic form, so
 * this does not weaken the approval gate.
 *
 * @since DOKAN_SINCE
 *
 * @param int   $product_id   Product ID.
 * @param int   $variation_id Variation ID, 0 for a simple product.
 * @param array $downloads    The files being written, keyed by download id.
 *
 * @return void
 */
function dokan_sync_download_permissions_on_crud_save( $product_id, $variation_id, $downloads ) {
    $meta_id = $variation_id ? $variation_id : $product_id;

    // A release earlier in this same request has already moved existing customers onto the
    // approved files. WooCommerce fires this action afterwards carrying the product object's
    // own set, which is either an echo the meta filter swallows, or an approver's genuine
    // edit that the meta filter re-points permissions to itself. Acting here would move the
    // permission onto a file set that never lands.
    if ( null !== dokan_downloadable_files_released_this_request( $meta_id ) ) {
        return;
    }

    do_action( 'dokan_process_file_download', $product_id, $variation_id, $downloads );
}
add_action( 'woocommerce_process_product_file_download_paths', 'dokan_sync_download_permissions_on_crud_save', 10, 3 );

/**
 * Give a vendor's REST product save the same status treatment as the vendor product form.
 *
 * `handle_product_update()` runs the submitted status through `dokan_update_product_post_data`,
 * which is where Dokan Pro downgrades an untrusted vendor's `publish` back to pending review.
 * No REST controller applied that filter, so the same edit made through the new product
 * editor stayed published and skipped review entirely — the approval setting simply did not
 * apply to that editor.
 *
 * Only a vendor saving their own product is affected: somebody who can manage WooCommerce is
 * the reviewer, and their save must not be downgraded.
 *
 * @since DOKAN_SINCE
 *
 * @param WC_Product      $product  Product object about to be saved.
 * @param WP_REST_Request $request  Request object.
 * @param bool            $creating True when the product is being created.
 *
 * @return WC_Product
 */
function dokan_rest_apply_vendor_product_status( $product, $request, $creating = false ) {
    if ( ! $product instanceof WC_Product ) {
        return $product;
    }

    /**
     * Filter whether a vendor's REST product save is put through the review status rules.
     *
     * @since DOKAN_SINCE
     *
     * @param bool       $apply   Whether to apply the vendor status rules.
     * @param WC_Product $product Product being saved.
     */
    if ( ! apply_filters( 'dokan_rest_apply_vendor_product_status', true, $product ) ) {
        return $product;
    }

    // Creation is deliberately out of scope here. A new product has no ID yet, and the
    // `dokan_update_product_post_data` consumers are written against the vendor form, which
    // only ever fires on a product that already exists — Pro's subscription module calls
    // `wc_get_product( $data['ID'] )->get_status()` with no guard, so handing it `ID => 0`
    // is fatal.
    //
    // Note that this leaves a separate, pre-existing hole: creating over REST with
    // `status: publish` publishes immediately without review. That is its own bug and wants
    // its own fix rather than being folded in here.
    if ( $creating || ! $product->get_id() ) {
        return $product;
    }

    $user_id = dokan_get_current_user_id();

    if ( ! $user_id || user_can( $user_id, 'manage_woocommerce' ) || ! dokan_is_user_seller( $user_id ) ) {
        return $product;
    }

    // only the vendor's own product
    if ( (int) get_post_field( 'post_author', $product->get_id() ) !== $user_id ) {
        return $product;
    }

    $status = $product->get_status();

    // `auto-draft` is the quick-create flow, not a submission; leave it alone
    if ( ! $status || 'auto-draft' === $status ) {
        return $product;
    }

    $data = apply_filters(
        'dokan_update_product_post_data',
        [
            'ID'          => $product->get_id(),
            'post_status' => $status,
        ]
    );

    if ( ! empty( $data['post_status'] ) && $data['post_status'] !== $status ) {
        $product->set_status( $data['post_status'] );
    }

    return $product;
}
add_filter( 'woocommerce_rest_pre_insert_product_object', 'dokan_rest_apply_vendor_product_status', 20, 3 );

/**
 * Discard a product's pending downloadable file submission, variations included.
 *
 * @since DOKAN_SINCE
 *
 * @param int $post_id Product ID.
 *
 * @return void
 */
function dokan_discard_staged_downloadable_files( $post_id ) {
    if ( 'product' !== get_post_type( $post_id ) ) {
        return;
    }

    $ids     = [ $post_id ];
    $product = wc_get_product( $post_id );

    if ( $product && $product->is_type( 'variable' ) ) {
        $ids = array_merge( $ids, array_map( 'absint', $product->get_children() ) );
    }

    foreach ( $ids as $id ) {
        delete_post_meta( $id, '_dokan_pending_downloadable_files' );
        delete_post_meta( $id, '_dokan_pending_downloadable_files_author' );
        delete_post_meta( $id, '_dokan_pending_downloadable' );
    }

    delete_post_meta( $post_id, '_dokan_pending_downloadable_children' );
}

/**
 * Discard staged downloadable files when a product is trashed.
 *
 * Trashing a pending product is a plausible "reject" gesture, so an untrashed and later
 * published product must not silently deliver a replacement submitted before the trash.
 *
 * @since DOKAN_SINCE
 *
 * @param int $post_id Post ID.
 *
 * @return void
 */
function dokan_discard_staged_downloadable_files_on_trash( $post_id ) {
    dokan_discard_staged_downloadable_files( $post_id );
}
add_action( 'trashed_post', 'dokan_discard_staged_downloadable_files_on_trash' );

/**
 * Discard staged downloadable files when a product is rejected.
 *
 * Rejection is the marketplace's explicit "no". Without this the submission would sit
 * staged and be delivered by the next approval, handing the administrator the exact file
 * they turned down.
 *
 * @since DOKAN_SINCE
 *
 * @param string  $new_status New post status.
 * @param string  $old_status Old post status.
 * @param WP_Post $post       Post object.
 *
 * @return void
 */
function dokan_discard_staged_downloadable_files_on_rejection( $new_status, $old_status, $post ) {
    if ( ! $post instanceof WP_Post || 'product' !== $post->post_type || $new_status === $old_status ) {
        return;
    }

    if ( ! in_array( $new_status, dokan_get_downloadable_files_rejected_statuses( $post->ID ), true ) ) {
        return;
    }

    dokan_discard_staged_downloadable_files( $post->ID );
}
add_action( 'transition_post_status', 'dokan_discard_staged_downloadable_files_on_rejection', 10, 3 );

/**
 * Discard a pending submission when an administrator presses "Discard pending files".
 *
 * Runs ahead of the release handler so a save that both discards and publishes keeps the
 * currently approved files rather than delivering the submission.
 *
 * @since DOKAN_SINCE
 *
 * @param int $post_id Post ID.
 *
 * @return void
 */
function dokan_handle_discard_staged_downloadable_files_request( $post_id ) {
    if ( empty( $_POST['dokan_discard_pending_downloads'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
        return;
    }

    if ( ! isset( $_POST['woocommerce_meta_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['woocommerce_meta_nonce'] ) ), 'woocommerce_save_data' ) ) {
        return;
    }

    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        return;
    }

    dokan_discard_staged_downloadable_files( $post_id );
}
add_action( 'save_post', 'dokan_handle_discard_staged_downloadable_files_request', 998 );

/**
 * Build the REST `downloads` shape from a staged file set.
 *
 * @since DOKAN_SINCE
 *
 * @param array $staged            Staged files keyed by download id.
 * @param bool  $as_attachment_ids True to key rows by attachment id (the product editor's
 *                                 shape) instead of download id (the REST product schema's).
 *
 * @return array
 */
function dokan_staged_downloads_for_rest( $staged, $as_attachment_ids = false ) {
    $downloads = [];

    foreach ( (array) $staged as $key => $file ) {
        $url = isset( $file['file'] ) ? $file['file'] : '';

        $downloads[] = [
            // the product editor keys rows by attachment id, the REST product schema by download id
            'id'   => $as_attachment_ids ? (string) attachment_url_to_postid( $url ) : (string) $key,
            'name' => isset( $file['name'] ) ? $file['name'] : '',
            'file' => $url,
        ];
    }

    return $downloads;
}

/**
 * Show a vendor their own pending downloadable files in REST product responses.
 *
 * While an update awaits approval the live files are deliberately the approved ones, so
 * without this the vendor would be handed back files they did not submit and would have
 * no way to tell that their upload is being held.
 *
 * @since DOKAN_SINCE
 *
 * @param WP_REST_Response $response Response object.
 * @param WC_Product       $product  Product object.
 *
 * @return WP_REST_Response
 */
function dokan_rest_show_staged_downloadable_files( $response, $product ) {
    if ( ! $response instanceof WP_REST_Response || ! $product instanceof WC_Product ) {
        return $response;
    }

    $product_id = $product->get_id();
    $staged     = dokan_get_staged_downloadable_files( $product_id );
    $data       = $response->get_data();

    $staged_flag = dokan_get_staged_downloadable_flag( $product_id );

    $data['dokan_downloads_awaiting_approval'] = null !== $staged || null !== $staged_flag;

    if ( dokan_is_product_author( $product->is_type( 'variation' ) ? $product->get_parent_id() : $product_id ) ) {
        if ( null !== $staged ) {
            $data['downloads'] = dokan_staged_downloads_for_rest( $staged );
        }

        if ( null !== $staged_flag && isset( $data['downloadable'] ) ) {
            $data['downloadable'] = 'yes' === $staged_flag;
        }
    }

    $response->set_data( $data );

    return $response;
}
add_filter( 'woocommerce_rest_prepare_product_object', 'dokan_rest_show_staged_downloadable_files', 20, 2 );
add_filter( 'woocommerce_rest_prepare_product_variation_object', 'dokan_rest_show_staged_downloadable_files', 20, 2 );
// `dokan/v1` and `dokan/v2` build their own payload and never run WooCommerce's filter, so
// without this the vendor namespace hands a vendor the approved files while their own
// submission is held — and the withdraw rule below then reads the echo as a cancellation
add_filter( 'dokan_rest_prepare_product_object', 'dokan_rest_show_staged_downloadable_files', 20, 2 );

/**
 * Show a vendor their own pending downloadable files in the product editor schema.
 *
 * @since DOKAN_SINCE
 *
 * @param array $data       Editor payload.
 * @param int   $product_id  Product ID.
 *
 * @return array
 */
function dokan_editor_show_staged_downloadable_files( $data, $product_id = 0 ) {
    if ( empty( $data['form_items'] ) || ! is_array( $data['form_items'] ) ) {
        return $data;
    }

    $product_id = $product_id ? (int) $product_id : (int) ( $data['product_id'] ?? 0 );
    $staged     = $product_id ? dokan_get_staged_downloadable_files( $product_id ) : null;

    if ( null === $staged || ! dokan_is_product_author( $product_id ) ) {
        return $data;
    }

    $notice = __( 'These files are awaiting admin approval. Customers who already purchased keep the currently approved files until the product is published.', 'dokan-lite' );

    foreach ( $data['form_items'] as &$item ) {
        if ( isset( $item['id'] ) && 'downloads' === $item['id'] ) {
            $item['value'] = dokan_staged_downloads_for_rest( $staged, true );

            // the editor renders `description` under the field, so the vendor is told the
            // hold exists rather than silently shown files that are not live
            $item['description'] = $notice;
        }
    }

    unset( $item );

    $data['dokan_downloads_awaiting_approval'] = true;

    return $data;
}
add_filter( 'dokan_product_editor_args', 'dokan_editor_show_staged_downloadable_files', 10, 2 );
