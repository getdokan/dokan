<?php

/**
 * Save the product data meta box.
 *
 * @access public
 * @param mixed $post_id
 * @return void
 */
function dokan_process_product_meta( $post_id ) {
    global $wpdb, $woocommerce, $woocommerce_errors;

    $product_type = empty( $_POST['product_type'] ) ? 'simple' : stripslashes( $_POST['product_type'] );
    // Add any default post meta
    add_post_meta( $post_id, 'total_sales', '0', true );

    $is_downloadable    = isset( $_POST['_downloadable'] ) ? 'yes' : 'no';
    $is_virtual         = isset( $_POST['_virtual'] ) ? 'yes' : 'no';

    // Product type + Downloadable/Virtual
    update_post_meta( $post_id, '_downloadable', $is_downloadable );
    update_post_meta( $post_id, '_virtual', $is_virtual );

    // Gallery Images
    $attachment_ids = array_filter( explode( ',', wc_clean( $_POST['product_image_gallery'] ) ) );
    update_post_meta( $post_id, '_product_image_gallery', implode( ',', $attachment_ids ) );

    // Check product visibility and purchaces note
    $_POST['_visibility'] = isset( $_POST['_visibility'] ) ? $_POST['_visibility'] : '';
    $_POST['_purchase_note'] = isset( $_POST['_purchase_note'] ) ? $_POST['_purchase_note'] : '';


    // Set visibiliy for WC 3.0.0+
    $terms = array();
    switch ( $_POST['_visibility'] ) {
        case 'hidden' :
            $terms[] = 'exclude-from-search';
            $terms[] = 'exclude-from-catalog';
            break;
        case 'catalog' :
            $terms[] = 'exclude-from-search';
            break;
        case 'search' :
            $terms[] = 'exclude-from-catalog';
            break;
    }

    wp_set_post_terms( $post_id, $terms, 'product_visibility', false );
    update_post_meta( $post_id, '_visibility', stripslashes( $_POST['_visibility'] ) );

    // Update post meta
    if ( isset( $_POST['_regular_price'] ) ) {
        update_post_meta( $post_id, '_regular_price', ( $_POST['_regular_price'] === '' ) ? '' : wc_format_decimal( $_POST['_regular_price'] ) );
    }

    if ( isset( $_POST['_sale_price'] ) ) {
        update_post_meta( $post_id, '_sale_price', ( $_POST['_sale_price'] === '' ? '' : wc_format_decimal( $_POST['_sale_price'] ) ) );
    }

    // Update post meta
    if ( isset( $_POST['_tax_status'] ) ) {
        update_post_meta( $post_id, '_tax_status', wc_clean( $_POST['_tax_status'] ) );
    }

    if ( isset( $_POST['_tax_class'] ) ) {
        update_post_meta( $post_id, '_tax_class', wc_clean( $_POST['_tax_class'] ) );
    }

    if ( isset( $_POST['_purchase_note'] ) ) {
        update_post_meta( $post_id, '_purchase_note', wp_kses_post( stripslashes( $_POST['_purchase_note'] ) ) );
    }


    // Unique SKU
    $sku     = get_post_meta( $post_id, '_sku', true );
    $new_sku = (string) wc_clean( $_POST['_sku'] );

    if ( '' == $new_sku ) {
        update_post_meta( $post_id, '_sku', '' );
    } elseif ( $new_sku !== $sku ) {
        if ( ! empty( $new_sku ) ) {
            $unique_sku = wc_product_has_unique_sku( $post_id, $new_sku );

            if ( ! $unique_sku ) {
                $woocommerce_errors[] = ( __( 'Product SKU must be unique.', 'dokan-lite' ) );
            } else {
                update_post_meta( $post_id, '_sku', $new_sku );
            }
        } else {
            update_post_meta( $post_id, '_sku', '' );
        }
    }

    // Save Attributes
    $attributes = array();

    if ( isset( $_POST['attribute_names'] ) && isset( $_POST['attribute_values'] ) ) {

        $attribute_names  = $_POST['attribute_names'];
        $attribute_values = $_POST['attribute_values'];

        if ( isset( $_POST['attribute_visibility'] ) ) {
            $attribute_visibility = $_POST['attribute_visibility'];
        }

        if ( isset( $_POST['attribute_variation'] ) ) {
            $attribute_variation = $_POST['attribute_variation'];
        }

        $attribute_is_taxonomy   = $_POST['attribute_is_taxonomy'];
        $attribute_position      = $_POST['attribute_position'];
        $attribute_names_max_key = max( array_keys( $attribute_names ) );

        for ( $i = 0; $i <= $attribute_names_max_key; $i++ ) {
            if ( empty( $attribute_names[ $i ] ) ) {
                continue;
            }

            $is_visible   = isset( $attribute_visibility[ $i ] ) ? 1 : 0;
            $is_variation = isset( $attribute_variation[ $i ] ) ? 1 : 0;
            $is_taxonomy  = $attribute_is_taxonomy[ $i ] ? 1 : 0;

            if ( $is_taxonomy ) {

                $values_are_slugs = false;

                if ( isset( $attribute_values[ $i ] ) ) {

                    // Select based attributes - Format values (posted values are slugs)
                    if ( is_array( $attribute_values[ $i ] ) ) {
                        $values           = array_map( 'sanitize_title', $attribute_values[ $i ] );
                        $values_are_slugs = true;

                    // Text based attributes - Posted values are term names - don't change to slugs
                    } else {
                        $values = array_map( 'stripslashes', array_map( 'strip_tags', explode( WC_DELIMITER, $attribute_values[ $i ] ) ) );
                    }

                    // Remove empty items in the array
                    $values = array_filter( $values, 'strlen' );

                } else {
                    $values = array();
                }

                // Update post terms
                if ( taxonomy_exists( $attribute_names[ $i ] ) ) {

                    foreach ( $values as $key => $value ) {
                        $term = get_term_by( $values_are_slugs ? 'slug' : 'name', trim( $value ), $attribute_names[ $i ] );

                        if ( $term ) {
                            $values[ $key ] = intval( $term->term_id );
                        } else {
                            $term = wp_insert_term( trim( $value ), $attribute_names[ $i ] );
                            if ( isset( $term->term_id ) ) {
                                $values[ $key ] = intval( $term->term_id );
                            }
                        }
                    }

                    wp_set_object_terms( $post_id, $values, $attribute_names[ $i ] );
                }

                if ( ! empty( $values ) ) {
                    // Add attribute to array, but don't set values
                    $attributes[ sanitize_title( $attribute_names[ $i ] ) ] = array(
                        'name'         => wc_clean( $attribute_names[ $i ] ),
                        'value'        => '',
                        'position'     => $attribute_position[ $i ],
                        'is_visible'   => $is_visible,
                        'is_variation' => $is_variation,
                        'is_taxonomy'  => $is_taxonomy,
                    );
                }
            } elseif ( isset( $attribute_values[ $i ] ) ) {

                // Text based, possibly separated by pipes (WC_DELIMITER). Preserve line breaks in non-variation attributes.
                $values = implode( ' ' . WC_DELIMITER . ' ', array_map( 'wc_clean', array_map( 'stripslashes', $attribute_values[ $i ] ) ) );

                // Custom attribute - Add attribute to array and set the values
                $attributes[ sanitize_title( $attribute_names[ $i ] ) ] = array(
                    'name'         => wc_clean( $attribute_names[ $i ] ),
                    'value'        => $values,
                    'position'     => $attribute_position[ $i ],
                    'is_visible'   => $is_visible,
                    'is_variation' => $is_variation,
                    'is_taxonomy'  => $is_taxonomy,
                );
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
                wp_set_object_terms( $post_id, array(), $key );
            }
        }
    }

    update_post_meta( $post_id, '_product_attributes', $attributes );

    // Sales and prices
    $date_from     = (string) isset( $_POST['_sale_price_dates_from'] ) ? wc_clean( $_POST['_sale_price_dates_from'] ) : '';
    $date_to       = (string) isset( $_POST['_sale_price_dates_to'] ) ? wc_clean( $_POST['_sale_price_dates_to'] )     : '';
    $regular_price = (string) isset( $_POST['_regular_price'] ) ? wc_clean( $_POST['_regular_price'] )                 : '';
    $sale_price    = (string) isset( $_POST['_sale_price'] ) ? wc_clean( $_POST['_sale_price'] )                       : '';

    update_post_meta( $post_id, '_regular_price', '' === $regular_price ? '' : wc_format_decimal( $regular_price ) );
    update_post_meta( $post_id, '_sale_price', '' === $sale_price ? '' : wc_format_decimal( $sale_price ) );

    // Dates
    update_post_meta( $post_id, '_sale_price_dates_from', $date_from ? strtotime( $date_from ) : '' );
    update_post_meta( $post_id, '_sale_price_dates_to', $date_to ? strtotime( $date_to ) : '' );

    if ( $date_to && ! $date_from ) {
        $date_from = date( 'Y-m-d' );
        update_post_meta( $post_id, '_sale_price_dates_from', strtotime( $date_from ) );
    }

    // Update price if on sale
    if ( '' !== $sale_price && '' === $date_to && '' === $date_from ) {
        update_post_meta( $post_id, '_price', wc_format_decimal( $sale_price ) );
    } elseif ( '' !== $sale_price && $date_from && strtotime( $date_from ) <= strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
        update_post_meta( $post_id, '_price', wc_format_decimal( $sale_price ) );
    } else {
        update_post_meta( $post_id, '_price', '' === $regular_price ? '' : wc_format_decimal( $regular_price ) );
    }

    if ( $date_to && strtotime( $date_to ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
        update_post_meta( $post_id, '_price', '' === $regular_price ? '' : wc_format_decimal( $regular_price ) );
        update_post_meta( $post_id, '_sale_price', '' );
        update_post_meta( $post_id, '_sale_price_dates_from', '' );
        update_post_meta( $post_id, '_sale_price_dates_to', '' );
    }

    //enable reviews
    $comment_status = 'closed';

    if ( $_POST['_enable_reviews'] == 'yes' ) {
        $comment_status = 'open';
    }

    // Update the post into the database
    wp_update_post( array(
        'ID'           => $post_id,
        'comment_status' => $comment_status,
    ) );

    // Sold Individually
    if ( ! empty( $_POST['_sold_individually'] ) ) {
        update_post_meta( $post_id, '_sold_individually', 'yes' );
    } else {
        update_post_meta( $post_id, '_sold_individually', '' );
    }

    // Stock Data
    $manage_stock = ! empty( $_POST['_manage_stock'] ) && 'grouped' !== $product_type ? 'yes' : 'no';
    $backorders   = ! empty( $_POST['_backorders'] ) && 'yes' === $manage_stock ? wc_clean( $_POST['_backorders'] ) : 'no';
    $stock_status = ! empty( $_POST['_stock_status'] ) ? wc_clean( $_POST['_stock_status'] ) : 'instock';
    $stock_amount = 'yes' === $manage_stock ? wc_stock_amount( $_POST['_stock'] ) : '';

    // Stock Data
    if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) {

        $manage_stock = 'no';
        $backorders   = 'no';
        $stock        = '';
        $stock_status = wc_clean( $_POST['_stock_status'] );

        if ( 'external' === $product_type ) {

            $stock_status = 'instock';

        } elseif ( 'variable' === $product_type ) {

            // Stock status is always determined by children so sync later
            $stock_status = '';

            if ( ! empty( $_POST['_manage_stock'] ) && $_POST['_manage_stock'] == 'yes' ) {
                $manage_stock = 'yes';
                $backorders   = wc_clean( $_POST['_backorders'] );
            }

        } elseif ( 'grouped' !== $product_type && ! empty( $_POST['_manage_stock'] ) ) {
            $manage_stock = $_POST['_manage_stock'];
            $backorders   = wc_clean( $_POST['_backorders'] );
        }

        update_post_meta( $post_id, '_manage_stock', $manage_stock );
        update_post_meta( $post_id, '_backorders', $backorders );

        if ( $stock_status ) {
            wc_update_product_stock_status( $post_id, $stock_status );
        }

        if ( ! empty( $_POST['_manage_stock'] ) ) {
            wc_update_product_stock( $post_id, wc_stock_amount( $_POST['_stock'] ) );
        } else {
            update_post_meta( $post_id, '_stock', '' );
        }

    } else {
        wc_update_product_stock_status( $post_id, wc_clean( $_POST['_stock_status'] ) );
    }

    // Downloadable options
    if ( 'yes' ==  $is_downloadable  ) {

        $_download_limit = absint( $_POST['_download_limit'] );
        if ( ! $_download_limit )
            $_download_limit = ''; // 0 or blank = unlimited

        $_download_expiry = absint( $_POST['_download_expiry'] );
        if ( ! $_download_expiry )
            $_download_expiry = ''; // 0 or blank = unlimited

        // file paths will be stored in an array keyed off md5(file path)
        if ( isset( $_POST['_wc_file_urls'] ) ) {
            $files = array();

            $file_names    = isset( $_POST['_wc_file_names'] ) ? array_map( 'wc_clean', $_POST['_wc_file_names'] ) : array();
            $file_urls     = isset( $_POST['_wc_file_urls'] ) ? array_map( 'esc_url_raw', array_map( 'trim', $_POST['_wc_file_urls'] ) ) : array();
            $file_url_size = sizeof( $file_urls );

            for ( $i = 0; $i < $file_url_size; $i ++ ) {
                if ( ! empty( $file_urls[ $i ] ) )
                    $files[ md5( $file_urls[ $i ] ) ] = array(
                        'name' => $file_names[ $i ],
                        'file' => $file_urls[ $i ]
                    );
            }

            // grant permission to any newly added files on any existing orders for this product prior to saving
            do_action( 'dokan_process_file_download', $post_id, 0, $files );

            update_post_meta( $post_id, '_downloadable_files', $files );
        }

        update_post_meta( $post_id, '_download_limit', $_download_limit );
        update_post_meta( $post_id, '_download_expiry', $_download_expiry );

        if ( isset( $_POST['_download_limit'] ) ) {
            update_post_meta( $post_id, '_download_limit', esc_attr( $_download_limit ) );
        }
        if ( isset( $_POST['_download_expiry'] ) ) {
            update_post_meta( $post_id, '_download_expiry', esc_attr( $_download_expiry ) );
        }

        if ( isset( $_POST['_download_type'] ) ) {
            update_post_meta( $post_id, '_download_type', wc_clean( $_POST['_download_type'] ) );
        }
    }

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
 * @param int $product_id product identifier
 * @param int $variation_id optional product variation identifier
 * @param array $downloadable_files newly set files
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

add_action( 'woocommerce_checkout_update_order_meta', 'dokan_create_sub_order' );

/**
 * Get discount coupon total from a order
 *
 * @global WPDB $wpdb
 * @param int $order_id
 * @return int
 */
function dokan_sub_order_get_total_coupon( $order_id ) {
    global $wpdb;

    $sql = $wpdb->prepare( "SELECT SUM(oim.meta_value) FROM {$wpdb->prefix}woocommerce_order_itemmeta oim
            LEFT JOIN {$wpdb->prefix}woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
            WHERE oi.order_id = %d AND oi.order_item_type = 'coupon'", $order_id );

    $result = $wpdb->get_var( $sql );
    if ( $result ) {
        return $result;
    }

    return 0;
}

/**
 * Validates seller registration form from my-account page
 *
 * @param WP_Error $error
 * @return \WP_Error
 */
function dokan_seller_registration_errors( $error ) {
    $allowed_roles = apply_filters( 'dokan_register_user_role', array( 'customer', 'seller' ) );

    // is the role name allowed or user is trying to manipulate?
    if ( isset( $_POST['role'] ) && !in_array( $_POST['role'], $allowed_roles ) ) {
        return new WP_Error( 'role-error', __( 'Cheating, eh?', 'dokan-lite' ) );
    }

    $role = $_POST['role'];

    if ( $role == 'seller' ) {

        $first_name = trim( $_POST['fname'] );
        if ( empty( $first_name ) ) {
            return new WP_Error( 'fname-error', __( 'Please enter your first name.', 'dokan-lite' ) );
        }

        $last_name = trim( $_POST['lname'] );
        if ( empty( $last_name ) ) {
            return new WP_Error( 'lname-error', __( 'Please enter your last name.', 'dokan-lite' ) );
        }
        $phone = trim( $_POST['phone'] );
        if ( empty( $phone ) ) {
            return new WP_Error( 'phone-error', __( 'Please enter your phone number.', 'dokan-lite' ) );
        }
    }

    return $error;
}

add_filter( 'woocommerce_process_registration_errors', 'dokan_seller_registration_errors' );
add_filter( 'woocommerce_registration_errors', 'dokan_seller_registration_errors' );

/**
 * Inject first and last name to WooCommerce for new seller registraion
 *
 * @param array $data
 * @return array
 */
function dokan_new_customer_data( $data ) {
    $allowed_roles = array( 'customer', 'seller' );
    $role = ( isset( $_POST['role'] ) && in_array( $_POST['role'], $allowed_roles ) ) ? $_POST['role'] : 'customer';

    $data['role'] = $role;

    if ( $role == 'seller' ) {
        $data['first_name']    = strip_tags( $_POST['fname'] );
        $data['last_name']     = strip_tags( $_POST['lname'] );
        $data['user_nicename'] = sanitize_title( $_POST['shopurl'] );
    }

    return $data;
}

add_filter( 'woocommerce_new_customer_data', 'dokan_new_customer_data');

/**
 * Adds default dokan store settings when a new seller registers
 *
 * @param int $user_id
 * @param array $data
 * @return void
 */
function dokan_on_create_seller( $user_id, $data ) {
    if ( $data['role'] != 'seller' ) {
        return;
    }

    $dokan_settings = array(
        'store_name'     => strip_tags( $_POST['shopname'] ),
        'social'         => array(),
        'payment'        => array(),
        'phone'          => $_POST['phone'],
        'show_email'     => 'no',
        'location'       => '',
        'find_address'   => '',
        'dokan_category' => '',
        'banner'         => 0,
    );

    update_user_meta( $user_id, 'dokan_profile_settings', $dokan_settings );
    update_user_meta( $user_id, 'dokan_store_name', $dokan_settings['store_name'] );

    Dokan_Email::init()->new_seller_registered_mail( $user_id );
}

add_action( 'woocommerce_created_customer', 'dokan_on_create_seller', 10, 2);

/**
 * Change seller display name to store name
 *
 * @since 2.4.10 [Change seller display name to store name]
 *
 * @param string $display_name
 *
 * @return string $display_name
 */
function dokan_seller_displayname ( $display_name ) {

    if ( dokan_is_user_seller ( get_current_user_id() ) && !is_admin() ) {

        $seller_info = dokan_get_store_info ( get_current_user_id() );
        $display_name = ( !empty( $seller_info['store_name'] ) ) ? $seller_info['store_name'] : $display_name;

    }

    return $display_name;
}

add_filter( 'pre_user_display_name', 'dokan_seller_displayname' );

/**
 * Get featured products
 *
 * Shown on homepage
 *
 * @param int $per_page
 * @return \WP_Query
 */
function dokan_get_featured_products( $per_page = 9) {


    $args = array(
        'posts_per_page'      => $per_page,
        'post_type'           => 'product',
        'ignore_sticky_posts' => 1,
        'meta_query'          => array(),
        'tax_query'           => array(
            'relation' => 'AND',
        ),
    );

    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        $product_visibility_term_ids = wc_get_product_visibility_term_ids();
        $args['tax_query'][] = array(
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        );

        $args['tax_query'][] = array(
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => $product_visibility_term_ids['featured'],
        );
    } else {
        $args['meta_query'] = array(
            array(
                'key'     => '_visibility',
                'value'   => array( 'catalog', 'visible' ),
                'compare' => 'IN'
            ),
            array(
                'key'   => '_featured',
                'value' => 'yes'
            )
        );
    }

    $featured_query = new WP_Query( apply_filters( 'dokan_get_featured_products', $args ) );

    return $featured_query;
}

/**
 * Get latest products
 *
 * Shown on homepage
 *
 * @param int $per_page
 * @return \WP_Query
 */
function dokan_get_latest_products( $per_page = 9 , $seller_id = '' ) {

    $args = array(
        'posts_per_page'      => $per_page,
        'post_type'           => 'product',
        'ignore_sticky_posts' => 1,
    );

    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {

        $product_visibility_term_ids = wc_get_product_visibility_term_ids();

        $args['tax_query'] = array(
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        );
    } else {
        $args['meta_query']  = array(
            array(
                'key'     => '_visibility',
                'value'   => array('catalog', 'visible'),
                'compare' => 'IN'
            )
        );
    }

    if ( !empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    $latest_query = new WP_Query( apply_filters( 'dokan_get_latest_products', $args ) );

    return $latest_query;
}

/**
 * Get best selling products
 *
 * Shown on homepage
 *
 * @param int $per_page
 * @return \WP_Query
 */
function dokan_get_best_selling_products( $per_page = 8, $seller_id = '' ) {

    $args = array(
        'post_type'           => 'product',
        'post_status'         => 'publish',
        'ignore_sticky_posts' => 1,
        'posts_per_page'      => $per_page,
        'meta_key'            => 'total_sales',
        'orderby'             => 'meta_value_num'
    );

    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {

        $product_visibility_term_ids = wc_get_product_visibility_term_ids();
        $args['tax_query'] = array(
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        );
    } else {
        $args['meta_query']  = array(
            array(
                'key'     => '_visibility',
                'value'   => array('catalog', 'visible'),
                'compare' => 'IN'
            )
        );
    }

    if ( !empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    $best_selling_query = new WP_Query( apply_filters( 'dokan_best_selling_query', $args ) );

    return $best_selling_query;
}


/**
 * Check More product from Seller tab is active or not.
 *
 * @since 2.5
 * @global object $post
 * @return boolean
 */
function check_more_seller_product_tab(  ) {
    global   $post;
    $store_info    = dokan_get_store_info(  $post->post_author );
    if( isset( $store_info['show_more_ptab'] ) AND $store_info['show_more_ptab'] == 'yes' ){
        return true;
    }else {
        return false;
    }
}

/**
 * Get top rated products
 *
 * Shown on homepage
 *
 * @param int $per_page
 * @return \WP_Query
 */
function dokan_get_top_rated_products( $per_page = 8 , $seller_id = '') {

    $args = array(
        'post_type'             => 'product',
        'post_status'           => 'publish',
        'ignore_sticky_posts'   => 1,
        'posts_per_page'        => $per_page
    );

    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {

        $product_visibility_term_ids = wc_get_product_visibility_term_ids();

        $args['tax_query'] = array(
            'taxonomy' => 'product_visibility',
            'field'    => 'term_taxonomy_id',
            'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
            'operator' => 'NOT IN',
        );
    } else {
        $args['meta_query']  = array(
            array(
                'key'     => '_visibility',
                'value'   => array('catalog', 'visible'),
                'compare' => 'IN'
            )
        );
    }

    if ( !empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    add_filter( 'posts_clauses', array( 'WC_Shortcodes', 'order_by_rating_post_clauses' ) );

    $top_rated_query = new WP_Query( apply_filters( 'dokan_top_rated_query', $args ) );

    remove_filter( 'posts_clauses', array( 'WC_Shortcodes', 'order_by_rating_post_clauses' ) );

    return $top_rated_query;
}

/**
 * Get products on-sale
 *
 * Shown on homepage
 *
 * @param type $per_page
 * @param type $paged
 * @return \WP_Query
 */
function dokan_get_on_sale_products( $per_page = 10, $paged = 1, $seller_id = '' ) {
    // Get products on sale
    $product_ids_on_sale = wc_get_product_ids_on_sale();

    $args = array(
        'posts_per_page'    => $per_page,
        'no_found_rows'     => 1,
        'paged'             => $paged,
        'post_status'       => 'publish',
        'post_type'         => 'product',
        'post__in'          => array_merge( array( 0 ), $product_ids_on_sale ),
        'meta_query'        => array(
            array(
                'key'       => '_visibility',
                'value'     => array('catalog', 'visible'),
                'compare'   => 'IN'
            ),
            array(
                'key'       => '_stock_status',
                'value'     => 'instock',
                'compare'   => '='
            )
        )
    );

    if ( !empty( $seller_id ) ) {
        $args['author'] = (int) $seller_id;
    }

    return new WP_Query( apply_filters( 'dokan_on_sale_products_query', $args ) );
}

/**
 * Get current balance of a seller
 *
 * Total = SUM(net_amount) - SUM(withdraw)
 *
 * @global WPDB $wpdb
 * @param type $seller_id
 * @param type $formatted
 *
 * @return mixed
 */
function dokan_get_seller_balance( $seller_id, $formatted = true ) {
    global $wpdb;

    $status        = dokan_withdraw_get_active_order_status_in_comma();
    $cache_key     = 'dokan_seller_balance_' . $seller_id;
    $earning       = wp_cache_get( $cache_key, 'dokan-lite' );
    $threshold_day = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', 0 );
    $date          = date( 'Y-m-d', strtotime( date('Y-m-d') . ' -'.$threshold_day.' days' ) );

    if ( false === $earning ) {
        $sql = "SELECT SUM(net_amount) as earnings,
            (SELECT SUM(amount) FROM {$wpdb->prefix}dokan_withdraw WHERE user_id = %d AND status = 1) as withdraw
            FROM {$wpdb->prefix}dokan_orders as do LEFT JOIN {$wpdb->prefix}posts as p ON do.order_id = p.ID
            WHERE seller_id = %d AND DATE(p.post_date) <= %s AND order_status IN({$status})";

        $result = $wpdb->get_row( $wpdb->prepare( $sql, $seller_id, $seller_id, $date ) );
        $earning = $result->earnings - $result->withdraw;

        wp_cache_set( $cache_key, $earning, 'dokan-lite' );
    }

    if ( $formatted ) {
        return apply_filters( 'dokan_get_formatted_seller_balance', wc_price( $earning ) );
    }

    return apply_filters( 'dokan_get_seller_balance', $earning );
}

/**
 * Get Seller Earned amount
 *
 * @since 2.5.4
 *
 * @param type $seller_id
 *
 * @param string $start_date
 *
 * @param type $end_date
 *
 * @return type
 */
function dokan_get_seller_earnings( $seller_id, $start_date = '', $end_date = '' ) {
    if ( empty( $start_date ) ) {
        $start_date = '2010-01-01';
    }

    if ( empty( $end_date ) ) {
        $end_date = date( 'Y-m-d', strtotime( '+1 day', current_time( 'timestamp' ) ) );
    }

    $all_orders = dokan_get_seller_orders_by_date( $start_date, $end_date, $seller_id, dokan_withdraw_get_active_order_status() );
    $earnings = 0;
    foreach ( $all_orders as $order ) {
        $earnings = $earnings + dokan_get_seller_amount_from_order( $order->order_id );
    }

    return apply_filters( 'dokan_get_seller_earnings', $earnings, $seller_id );
}

/**
 * Get seller rating
 *
 * @global WPDB $wpdb
 * @param type $seller_id
 * @return type
 */
function dokan_get_seller_rating( $seller_id ) {
    global $wpdb;

    $sql = "SELECT AVG(cm.meta_value) as average, COUNT(wc.comment_ID) as count FROM $wpdb->posts p
        INNER JOIN $wpdb->comments wc ON p.ID = wc.comment_post_ID
        LEFT JOIN $wpdb->commentmeta cm ON cm.comment_id = wc.comment_ID
        WHERE p.post_author = %d AND p.post_type = 'product' AND p.post_status = 'publish'
        AND ( cm.meta_key = 'rating' OR cm.meta_key IS NULL) AND wc.comment_approved = 1
        ORDER BY wc.comment_post_ID";

    $result = $wpdb->get_row( $wpdb->prepare( $sql, $seller_id ) );

    $rating_value = apply_filters( 'dokan_seller_rating_value', array(
        'rating' => number_format( $result->average, 2 ),
        'count'  => (int) $result->count
    ), $seller_id );

    return $rating_value;
}

/**
 * Get seller rating in a readable rating format
 *
 * @param int $seller_id
 * @return void
 */
function dokan_get_readable_seller_rating( $seller_id ) {
    $rating = dokan_get_seller_rating( $seller_id );

    if ( ! $rating['count'] ) {
        echo __( 'No ratings found yet!', 'dokan-lite' );
        return;
    }

    $long_text = _n( '%s rating from %d review', '%s rating from %d reviews', $rating['count'], 'dokan-lite' );
    $text = sprintf( __( 'Rated %s out of %d', 'dokan-lite' ), $rating['rating'], number_format( 5 ) );
    $width = ( $rating['rating']/5 ) * 100;
    ?>
        <span class="seller-rating">
            <span title="<?php echo esc_attr( $text ); ?>" class="star-rating" itemtype="http://schema.org/Rating" itemscope="" itemprop="reviewRating">
                <span class="width" style="width: <?php echo $width; ?>%"></span>
                <span style=""><strong itemprop="ratingValue"><?php echo $rating['rating']; ?></strong></span>
            </span>
        </span>

        <?php
            $review_text = sprintf( $long_text, $rating['rating'], $rating['count'] );

            if ( function_exists( 'dokan_get_review_url' ) ) {
                $review_text = sprintf( '<a href="%s">%s</a>', esc_url( dokan_get_review_url( $seller_id ) ), $review_text );
            }
        ?>
        <span class="text">
            <?php echo $review_text; ?>
        </span>
    <?php
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
 * @param  array $attr
 * @return array
 */
function dokan_exclude_child_customer_receipt( &$phpmailer ) {
    $subject      = $phpmailer->Subject;

    // order receipt
    $sub_receipt  = __( 'Your {site_title} order receipt from {order_date}', 'dokan-lite' );
    $sub_download = __( 'Your {site_title} order from {order_date} is complete', 'dokan-lite' );

    $sub_receipt  = str_replace( array('{site_title}', '{order_date}'), array(wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), ''), $sub_receipt);
    $sub_download = str_replace( array('{site_title}', '{order_date} is complete'), array(wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), ''), $sub_download);

    // not a customer receipt mail
    if ( ( stripos( $subject, $sub_receipt ) === false ) && ( stripos( $subject, $sub_download ) === false ) ) {
        return;
    }

    $message = $phpmailer->Body;
    $pattern = '/Order: #(\d+)/';
    preg_match( $pattern, $message, $matches );

    if ( isset( $matches[1] ) ) {
        $order_id = $matches[1];
        $order    = get_post( $order_id );

        // we found a child order
        if ( ! is_wp_error( $order ) && $order->post_parent != 0 ) {
            $phpmailer = new DokanFakeMailer();
        }
    }
}

add_action( 'phpmailer_init', 'dokan_exclude_child_customer_receipt' );

/**
 * A fake mailer class to replace phpmailer
 */
class DokanFakeMailer {
    public function Send() {}
}

add_filter( 'woocommerce_dashboard_status_widget_sales_query', 'dokan_filter_woocommerce_dashboard_status_widget_sales_query' );

/**
 * Woocommerce Admin dashboard Sales Report Synced with Dokan Dashboard report
 *
 * @since 2.4.3
 *
 * @global WPDB $wpdb
 * @param array $query
 *
 * @return $query
 */
function dokan_filter_woocommerce_dashboard_status_widget_sales_query( $query ) {
    global $wpdb;

    $query['where']  .= " AND posts.ID NOT IN ( SELECT post_parent FROM {$wpdb->posts} WHERE post_type IN ( '" . implode( "','", array_merge( wc_get_order_types( 'sales-reports' ), array( 'shop_order_refund' ) ) ) . "' ) )";

    return $query;
}

/**
 * Handle password edit and name update functions
 *
 * @since 2.4.10
 *
 * @return void
 */
function dokan_save_account_details(){

    if ( 'POST' !== strtoupper( $_SERVER[ 'REQUEST_METHOD' ] ) ) {
		return;
	}

	if ( empty( $_POST[ 'action' ] ) || 'dokan_save_account_details' !== $_POST[ 'action' ] || empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'dokan_save_account_details' ) ) {
		return;
	}

	$errors       = new WP_Error();
	$user         = new stdClass();

	$user->ID     = (int) get_current_user_id();
	$current_user = get_user_by( 'id', $user->ID );

	if ( $user->ID <= 0 ) {
		return;
	}

	$account_first_name = ! empty( $_POST[ 'account_first_name' ] ) ? wc_clean( $_POST[ 'account_first_name' ] ) : '';
	$account_last_name  = ! empty( $_POST[ 'account_last_name' ] ) ? wc_clean( $_POST[ 'account_last_name' ] ) : '';
	$account_email      = ! empty( $_POST[ 'account_email' ] ) ? sanitize_email( $_POST[ 'account_email' ] ) : '';
	$pass_cur           = ! empty( $_POST[ 'password_current' ] ) ? $_POST[ 'password_current' ] : '';
	$pass1              = ! empty( $_POST[ 'password_1' ] ) ? $_POST[ 'password_1' ] : '';
	$pass2              = ! empty( $_POST[ 'password_2' ] ) ? $_POST[ 'password_2' ] : '';
	$save_pass          = true;

	$user->first_name   = $account_first_name;
	$user->last_name    = $account_last_name;

	// Prevent emails being displayed, or leave alone.
	$user->display_name = is_email( $current_user->display_name ) ? $user->first_name : $current_user->display_name;

	// Handle required fields
	$required_fields = apply_filters( 'woocommerce_save_account_details_required_fields', array(
		'account_first_name' => __( 'First Name', 'dokan-lite' ),
		'account_last_name'  => __( 'Last Name', 'dokan-lite' ),
		'account_email'      => __( 'Email address', 'dokan-lite' ),
	) );

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
	do_action_ref_array( 'woocommerce_save_account_details_errors', array( &$errors, &$user ) );

	if ( $errors->get_error_messages() ) {
		foreach ( $errors->get_error_messages() as $error ) {
			wc_add_notice( $error, 'error' );
		}
	}

	if ( wc_notice_count( 'error' ) === 0 ) {

		wp_update_user( $user ) ;

		wc_add_notice( __( 'Account details changed successfully.', 'dokan-lite' ) );

		do_action( 'woocommerce_save_account_details', $user->ID );

		wp_safe_redirect( dokan_get_navigation_url( ' edit-account' ) );
		exit;
	}
}

add_action( 'template_redirect', 'dokan_save_account_details' );
