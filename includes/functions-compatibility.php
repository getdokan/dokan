<?php

/**
 * Wrapper functions to keep BackWards compatibility with WC 2.6 and older versions
 */

/**
 * Get product method made backwards compatible
 *
 * @since 2.5.7
 *
 * @param WC_Product $product
 *
 * @return WC_Product
 */
function dokan_wc_get_product( $product ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        return wc_get_product( $product );
    }

    return get_product( $product );
}

/**
 * Dynamically access new properties with backwards compatibility
 *
 * @since 2.5.7
 *
 * @param Object $object
 *
 * @param String $prop
 *
 * @param String $callback If the object is fetched using a different callback
 *
 * @return $prop
 */
function dokan_get_prop( $object, $prop, $callback = false ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        $fn_name = $callback ? $callback : 'get_' . $prop;
        return $object->$fn_name();
    }

    return $object->$prop;
}

/**
 * Dynamically access new properties with backwards compatibility
 *
 * @since 2.5.7
 *
 * @param Object $object
 *
 * @param String $prop
 *
 * @param String $callback If the object is fetched using a different callback
 *
 * @return $prop
 */
function dokan_replace_func( $old_method, $new_method, $object = null ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        return $object ? $object->$new_method() : call_user_func( $new_method );
    }

    return $object ? $object->$old_method() : call_user_func( $old_method );
}

/**
 * Get order created date
 *
 * @since 2.5.7
 *
 * @param WC_Order $order
 *
 * @return String date
 */
function dokan_get_date_created( $order ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        return wc_format_datetime( $order->get_date_created(), get_option( 'date_format' ) . ', ' . get_option( 'time_format' ) );
    }

    return $order->order_date;
}

/**
 * Get meta data for given item_id
 *
 * @since 2.5.7
 *
 * @param WC_Order $order
 *
 * @param int $item_id
 *
 * @return $metadata
 */
function dokan_get_metadata( $order, $item_id ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        $item = new WC_Order_Item( $order );
        return $item->get_meta_data();
    }

    return $order->has_meta( $item_id );
}

/**
 * Get download files for given product
 *
 * @since 2.5.8
 *
 * @param WC_Product $product
 * @return array $downloads
 */
function dokan_get_product_downloads( $product ) {
    if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
        return $product->get_downloads();
    }

    return $product->get_files();
}

/**
 * Save variation product price.
 *
 * @since 2.5.8
 *
 * @param int $product_id
 * @param string $regular_price
 * @param string $sale_price
 * @param string $date_from
 * @param string $date_to
 */
function dokan_save_product_price( $product_id, $regular_price, $sale_price = '', $date_from = '', $date_to = '' ) {
    $product = wc_get_product( absint( $product_id ) );

    if ( ! $product instanceof WC_Product ) {
        return;
    }

    $regular_price = wc_format_decimal( $regular_price );
    $sale_price    = '' === $sale_price ? '' : wc_format_decimal( $sale_price );
    $date_from     = wc_clean( $date_from );
    $date_to       = wc_clean( $date_to );
    $now           = dokan_current_datetime();

    $product->set_regular_price( $regular_price );
    $product->set_sale_price( $sale_price );

    // Save Dates
    if ( $date_from && $date_to ) {
        $product->set_date_on_sale_from( $now->modify( $date_from )->modify( 'today' )->getTimestamp() );
        $product->set_date_on_sale_to( $now->modify( $date_to )->setTime( 23, 59, 59 )->getTimestamp() );
    }

    if ( $date_to && ! $date_from ) {
        $product->set_date_on_sale_from( $now->getTimestamp() );
    }

    // Update price if on sale
    if ( '' !== $sale_price && '' === $date_to && '' === $date_from ) {
        $product->set_price( $sale_price );
    } else {
        $product->set_price( $regular_price );
    }

    if ( '' !== $sale_price && $date_from && $now->modify( $date_from )->getTimestamp() < $now->getTimestamp() ) {
        $product->set_price( $sale_price );
    }

    if ( $date_to && $now->modify( $date_to )->getTimestamp() < $now->getTimestamp() ) {
        $product->set_price( $regular_price );
        $product->set_date_on_sale_from();
        $product->set_date_on_sale_to();
    }

    $product->save();
}

/**
 * Process product files download paths
 *
 * @since 2.5.8
 *
 * @global type $wpdb
 * @param int $product_id
 * @param int $variation_id
 * @param array $downloadable_files
 */
function dokan_process_product_file_download_paths_permission( $product_id, $variation_id, $downloadable_files ) {
    global $wpdb;

    if ( $variation_id ) {
        $product_id = $variation_id;
    }

    $product               = wc_get_product( $product_id );
    $p_downloads           = dokan_get_product_downloads( $product );
    $existing_download_ids = array_keys( (array) $p_downloads );
    $updated_download_ids  = array_keys( (array) $downloadable_files );

    $new_download_ids     = array_filter( array_diff( $updated_download_ids, $existing_download_ids ) );
    $removed_download_ids = array_filter( array_diff( $existing_download_ids, $updated_download_ids ) );

    if ( ! empty( $new_download_ids ) || ! empty( $removed_download_ids ) ) {
        // determine whether downloadable file access has been granted via the typical order completion, or via the admin ajax method
        $existing_permissions = $wpdb->get_results( $wpdb->prepare( "SELECT * from {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE product_id = %d GROUP BY order_id", $product_id ) );

        foreach ( $existing_permissions as $existing_permission ) {
            $order = wc_get_order( $existing_permission->order_id );

            if ( ! empty( $order->get_id() ) ) {
                // Remove permissions
                if ( ! empty( $removed_download_ids ) ) {
                    foreach ( $removed_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_remove_access_to_old_file', true, $download_id, $product_id, $order ) ) {
                            $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE order_id = %d AND product_id = %d AND download_id = %s", $order->get_id(), $product_id, $download_id ) );
                        }
                    }
                }
                // Add permissions
                if ( ! empty( $new_download_ids ) ) {
                    foreach ( $new_download_ids as $download_id ) {
                        if ( apply_filters( 'woocommerce_process_product_file_download_paths_grant_access_to_new_file', true, $download_id, $product_id, $order ) ) {
                            // grant permission if it doesn't already exist
                            if ( ! $wpdb->get_var( $wpdb->prepare( "SELECT 1=1 FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE order_id = %d AND product_id = %d AND download_id = %s", $order->get_id(), $product_id, $download_id ) ) ) {
                                wc_downloadable_file_permission( $download_id, $product_id, $order );
                            }
                        }
                    }
                }
            }
        }
    }
}

add_action( 'dokan_process_file_download', 'dokan_process_product_file_download_paths_permission', 10, 3 );
