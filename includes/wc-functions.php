<?php

/**
 * Save the product data meta box.
 *
 * @access public
 *
 * @param int   $post_id
 * @param array $data
 *
 * @return void
 */
function dokan_process_product_meta( $post_id, $data = [] ) {
    if ( ! $post_id || ! $data ) {
        return;
    }

    global $wpdb, $woocommerce, $woocommerce_errors;

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

    // Check product visibility and purchaces note
    $data['_visibility']    = isset( $data['_visibility'] ) ? sanitize_text_field( $data['_visibility'] ) : '';
    $data['_purchase_note'] = isset( $data['_purchase_note'] ) ? sanitize_textarea_field( $data['_purchase_note'] ) : '';

    // Set visibiliy for WC 3.0.0+
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

    wp_set_post_terms( $post_id, $terms, 'product_visibility', false );
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

        for ( $i = 0; $i <= $attribute_names_max_key; $i ++ ) {
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
        $date_from     = (string) isset( $data['_sale_price_dates_from'] ) ? wc_clean( $data['_sale_price_dates_from'] ) : '';
        $date_to       = (string) isset( $data['_sale_price_dates_to'] ) ? wc_clean( $data['_sale_price_dates_to'] ) : '';
        $regular_price = (string) isset( $data['_regular_price'] ) ? wc_clean( $data['_regular_price'] ) : '';
        $sale_price    = (string) isset( $data['_sale_price'] ) ? wc_clean( $data['_sale_price'] ) : '';
        $now           = dokan_current_datetime();

        update_post_meta( $post_id, '_regular_price', '' === $regular_price ? '' : wc_format_decimal( $regular_price ) );
        update_post_meta( $post_id, '_sale_price', '' === $sale_price ? '' : wc_format_decimal( $sale_price ) );

        // Dates
        update_post_meta( $post_id, '_sale_price_dates_from', $date_from ? strtotime( $date_from ) : '' );
        update_post_meta( $post_id, '_sale_price_dates_to', $date_to ? strtotime( '+ 23 hours', strtotime( $date_to ) ) : '' );

        if ( $date_to && ! $date_from ) {
            $date_from = $now->format( 'Y-m-d' );
            update_post_meta( $post_id, '_sale_price_dates_from', $now->getTimestamp() );
        }

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
    if ( ! empty( $data['_sold_individually'] ) ) {
        update_post_meta( $post_id, '_sold_individually', 'yes' );
    } else {
        update_post_meta( $post_id, '_sold_individually', '' );
    }

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
        $stock        = '';
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

        if ( ! empty( $data['_manage_stock'] ) ) {
            if ( 'variable' === $product_type ) {
                update_post_meta( $post_id, '_stock', $stock_amount );
            } else {
                wc_update_product_stock( $post_id, $stock_amount );
            }

            update_post_meta( $post_id, '_low_stock_amount', $_low_stock_amount );
        } else {
            update_post_meta( $post_id, '_stock', '' );
            update_post_meta( $post_id, '_low_stock_amount', '' );
        }
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
            $file_urls     = isset( $data['_wc_file_urls'] ) ? array_map( 'esc_url_raw', array_map( 'trim', $data['_wc_file_urls'] ) ) : [];
            $file_url_size = count( $file_urls );

            for ( $i = 0; $i < $file_url_size; $i ++ ) {
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
    }

    // Update SKU
    $old_sku = get_post_meta( $post_id, '_sku', true );
    delete_post_meta( $post_id, '_sku' );

    $product = wc_get_product( $post_id );

    $sku = trim( wp_unslash( $data['_sku'] ) ) !== '' ? sanitize_text_field( wp_unslash( $data['_sku'] ) ) : '';
    try {
        $product->set_sku( $sku );
    } catch ( \WC_Data_Exception $e ) {
        $product->set_sku( $old_sku );
        $woocommerce_errors[] = __( 'Product SKU must be unique', 'dokan-lite' );
    }

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
 * @return void
 */
function dokan_process_product_file_download_paths( $product_id, $variation_id, $downloadable_files ) {
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
        $existing_permissions = $wpdb->get_results( $wpdb->prepare( "SELECT * from {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE product_id = %d GROUP BY order_id", $product_id ) );

        foreach ( $existing_permissions as $existing_permission ) {
            $order = wc_get_order( $existing_permission->order_id );

            if ( ! empty( dokan_get_prop( $order, 'id' ) ) ) {
                // Remove permissions
                if ( ! empty( $removed_download_ids ) ) {
                    foreach ( $removed_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_remove_access_to_old_file', true, $download_id, $product_id, $order ) ) {
                            $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE order_id = %d AND product_id = %d AND download_id = %s", dokan_get_prop( $order, 'id' ), $product_id, $download_id ) );
                        }
                    }
                }
                // Add permissions
                if ( ! empty( $new_download_ids ) ) {
                    foreach ( $new_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_grant_access_to_new_file', true, $download_id, $product_id, $order ) ) {
                            // grant permission if it doesn't already exist
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
 * Get discount coupon total from a order
 *
 * @param int $order_id
 *
 * @return int
 */
function dokan_sub_order_get_total_coupon( $order_id ) {
    global $wpdb;

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
 * @return \WP_Query
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
 * @return \WP_Query
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
 * @return \WP_Query
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
    global $post;

    $store_info = dokan_get_store_info( $post->post_author );

    if ( isset( $store_info['show_more_ptab'] ) && 'yes' === $store_info['show_more_ptab'] ) {
        return true;
    } else {
        return false;
    }
}

/**
 * Get top rated products
 *
 * Shown on homepage
 *
 * @param int $per_page
 *
 * @return \WP_Query
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
 * @return \WP_Query
 */
function dokan_get_on_sale_products( $per_page = 10, $paged = 1, $seller_id = 0 ) {
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

/**
 * Exclude child order emails for customers
 *
 * A hacky and dirty way to do this from this action. Because there is no easy
 * way to do this by removing action hooks from WooCommerce. It would be easier
 * if they were from functions. Because they are added from classes, we can't
 * remove those action hooks. Thats why we are doing this from the phpmailer_init action
 * by returning a fake phpmailer class.
 *
 * @param array $attr
 *
 * @return void
 */
function dokan_exclude_child_customer_receipt( &$phpmailer ) {
    $subject = $phpmailer->Subject; ////phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

    // order receipt
    $sub_receipt  = __( 'Your {site_title} order receipt from {order_date}', 'dokan-lite' );
    $sub_download = __( 'Your {site_title} order from {order_date} is complete', 'dokan-lite' );

    $sub_receipt  = str_replace(
        [
            '{site_title}',
            '{order_date}',
        ], [ wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), '' ], $sub_receipt
    );
    $sub_download = str_replace(
        [
            '{site_title}',
            '{order_date} is complete',
        ], [ wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), '' ], $sub_download
    );

    // not a customer receipt mail
    if ( ( stripos( $subject, $sub_receipt ) === false ) && ( stripos( $subject, $sub_download ) === false ) ) {
        return;
    }

    $message = $phpmailer->Body; //phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
    $pattern = '/Order: #(\d+)/';
    preg_match( $pattern, $message, $matches );

    if ( isset( $matches[1] ) ) {
        $order_id = $matches[1];
        $order    = get_post( $order_id );

        // we found a child order
        if ( ! is_wp_error( $order ) && $order->post_parent !== 0 ) {
            $phpmailer = new DokanFakeMailer();
        }
    }
}

add_action( 'phpmailer_init', 'dokan_exclude_child_customer_receipt' );

/**
 * A fake mailer class to replace phpmailer
 */
class DokanFakeMailer {
    public function Send() {
    }
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

    $query['where'] .= " AND posts.ID NOT IN ( SELECT post_parent FROM {$wpdb->posts} WHERE post_type IN ( '" . implode( "','", array_merge( wc_get_order_types( 'sales-reports' ), [ 'shop_order_refund' ] ) ) . "' ) )";

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
 * This method will delete vendors best-selling product cache after a new order has been made
 *
 * @since 3.2.11
 *
 * @param int $post_id
 */
function dokan_clear_best_selling_product_category_cache( $order_id ) {
    $order = wc_get_order( $order_id );

    if ( ! $order ) {
        return;
    }

    // check if order has suborder
    if ( $order->get_meta( 'has_sub_order' ) ) {
        // same hooks will be called for individual sub orders
        return;
    }

    // get vendor id from order
    $seller_id = dokan_get_seller_id_by_order( $order_id );
    if ( empty( $seller_id ) ) {
        return;
    }

    delete_transient( 'dokan_vendor_get_best_selling_products_' . $seller_id );
    delete_transient( 'dokan_vendor_get_best_selling_categories_' . $seller_id );
}

add_action( 'woocommerce_new_order', 'dokan_clear_best_selling_product_category_cache', 10, 1 );
add_action( 'woocommerce_update_order', 'dokan_clear_best_selling_product_category_cache', 10, 1 );

/**
 * This method will delete store category cache after a category is updated
 *
 * @since 3.2.10
 *
 * @param int $term_id
 */
function dokan_clear_edit_product_category_cache( $term_id ) {
    // get taxonomy slug
    $term = get_term_by( 'ID', $term_id, 'product_cat' );
    if ( false === $term || ! isset( $term->slug ) ) {
        return;
    }

    // get associated product id with this category
    $args = [
        'status'   => 'publish',
        'limit'    => - 1,
        'return'   => 'ids',
        'category' => [ $term->slug ],
    ];

    $query    = new WC_Product_Query( $args );
    $products = $query->get_products();

    if ( empty( $products ) ) {
        return;
    }

    global $wpdb;
    $products   = implode( ',', array_map( 'absint', (array) $products ) );
    $seller_ids = $wpdb->get_col( "SELECT DISTINCT post_author from {$wpdb->posts} WHERE ID in ($products)" ); // phpcs:ignore

    foreach ( $seller_ids as $seller_id ) {
        // delete vendor get_store_categories() method transient
        if ( function_exists( 'wpml_get_active_languages' ) ) {
            foreach ( wpml_get_active_languages() as $active_language ) {
                delete_transient( 'dokan_vendor_get_store_categories_' . $active_language['code'] . '_' . $seller_id );
            }
        }

        delete_transient( 'dokan_vendor_get_store_categories_' . $seller_id );
    }
}

add_action( 'edit_product_cat', 'dokan_clear_edit_product_category_cache', 10, 1 );
add_action( 'pre_delete_term', 'dokan_clear_edit_product_category_cache', 10, 1 );

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
 *  Show more products from current seller
 *
 * @since 2.5
 * @since DOKAN_LITE_SINCE added filter 'dokan_get_more_products_per_page'
 *
 * @param int     $seller_id
 * @param int     $posts_per_page
 *
 * @global object $product
 * @global object $post
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
 * Change bulk order status in vendor dashboard
 *
 * @since 2.8.3
 *
 * @return void
 */
function dokan_bulk_order_status_change() {
    if ( ! current_user_can( 'dokan_manage_order' ) ) {
        return;
    }

    if ( dokan_get_option( 'order_status_change', 'dokan_selling' ) === 'off' ) {
        return;
    }

    if ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( sanitize_key( $_POST['security'] ), 'bulk_order_status_change' ) ) {
        return;
    }

    // Doing the bulk action for orders.
    dokan_apply_bulk_order_status_change(
        [
            'status'      => isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '',
            'bulk_orders' => isset( $_POST['bulk_orders'] ) ? array_map( 'absint', $_POST['bulk_orders'] ) : [],
        ]
    );
}

add_action( 'template_redirect', 'dokan_bulk_order_status_change' );

/**
 * Add vendor email on customers note mail replay to
 *
 * @param string   $headers
 * @param string   $id
 * @param WC_Order $order
 *
 * @return string $headers
 */
function dokan_add_reply_to_vendor_email_on_wc_customer_note_mail( $headers, $id, $order ) {
    if ( ! ( $order instanceof WC_Order ) ) {
        return $headers;
    }

    if ( 'customer_note' === $id ) {
        foreach ( $order->get_items( 'line_item' ) as $item ) {
            $product_id  = $item['product_id'];
            $author      = get_post_field( 'post_author', $product_id );
            $author_data = get_userdata( absint( $author ) );
            $user_email  = $author_data->user_email;

            $headers .= "Reply-to: <$user_email>\r\n";
        }
    }

    return $headers;
}

add_filter( 'woocommerce_email_headers', 'dokan_add_reply_to_vendor_email_on_wc_customer_note_mail', 10, 3 );

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
 * Send email to the vendor/seller when cancel the order
 *
 * @param string   $recipient
 * @param WC_Order $order
 *
 * @return string
 */
function send_email_for_order_cancellation( $recipient, $order ) {
    if ( ! $order instanceof \WC_Order ) {
        return $recipient;
    }

    // get the order id from order object
    $seller_id = dokan_get_seller_id_by_order( $order->get_id() );

    $seller_info  = get_userdata( $seller_id );
    $seller_email = $seller_info->user_email;

    // if admin email & seller email is same
    if ( false === strpos( $recipient, $seller_email ) ) {
        $recipient .= ',' . $seller_email;
    }

    return $recipient;
}

add_filter( 'woocommerce_email_recipient_cancelled_order', 'send_email_for_order_cancellation', 10, 2 );


/**
 * Modify order counts for vendor.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param object $counts
 *
 * @return object $counts
 */
function dokan_modify_vendor_order_counts( $counts ) {
    global $pagenow;

    if ( 'edit.php' !== $pagenow || 'shop_order' !== get_query_var( 'post_type' ) ) {
        return $counts;
    }

    if ( current_user_can( 'manage_woocommerce' ) ) {
        return $counts;
    }

    $vendor_id = dokan_get_current_user_id();

    if ( empty( $vendor_id ) ) {
        return $counts;
    }

    // Current order counts for the vendor.
    $vendor_order_counts = dokan_count_orders( $vendor_id );

    // Modify WP dashboard order counts as per vendor's order counts.
    foreach ( $vendor_order_counts as $count_key => $count_value ) {
        if ( 'total' !== $count_key ) {
            $counts->{$count_key} = $count_value;
        }
    }

    return $counts;
}

add_filter( 'wp_count_posts', 'dokan_modify_vendor_order_counts', 10, 1 );
