<?php

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Models\VendorBalance;

/**
 * Dokan get seller amount from order total
 *
 * @param int $order_id
 *
 * @deprecated 3.8.0
 *
 * @return float|array|WP_Error
 */
function dokan_get_seller_amount_from_order( $order_id, $get_array = false ) {
    wc_deprecated_function( 'dokan_get_seller_amount_from_order', '3.8.0', 'dokan()->commission->get_earning_by_order()' );

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return $order;
    }

    $seller_id  = dokan_get_seller_id_by_order( $order_id );
    $net_amount = dokan()->commission->get_earning_by_order( $order, 'seller' );

    if ( $get_array ) {
        $shipping_recipient = apply_filters( 'dokan_shipping_fee_recipient', dokan_get_option( 'shipping_fee_recipient', 'dokan_selling', 'seller' ), $order_id );
        $tax_recipient      = apply_filters( 'dokan_tax_fee_recipient', dokan_get_option( 'tax_fee_recipient', 'dokan_selling', 'seller' ), $order_id );
        $order_shipping     = $order->get_shipping_total();
        $order_tax          = $order->get_total_tax();

        $amount = [
            'net_amount' => $net_amount,
            'shipping'   => 0,
            'tax'        => 0,
        ];

        if ( 'seller' === $shipping_recipient ) {
            $amount['shipping'] = $order_shipping;
        }

        if ( 'seller' === $tax_recipient ) {
            $amount['tax'] = $order_tax;
        }

        return apply_filters( 'dokan_get_seller_amount_from_order_array', $amount, $order, $seller_id );
    }

    return apply_filters( 'dokan_get_seller_amount_from_order', $net_amount, $order, $seller_id );
}

/**
 * Get all the orders from a specific seller
 *
 * @since      3.6.3 Rewritten whole method
 *
 * @param int   $seller_id
 * @param array $args
 *
 * @deprecated 3.8.0 since this is an alias only.
 *
 * @return WP_Error|int[]|WC_Order[]
 */
function dokan_get_seller_orders( $seller_id, $args ) {
    wc_deprecated_function( 'dokan_get_seller_orders', '3.8.0', 'dokan()->order->all()' );

    $args['seller_id'] = $seller_id;

    if ( ! empty( $args['offset'] ) ) { // backward compatibility
        // max( $args['limit'], 1 ) to prevent division by zero if anyone gives $args['limit'] = 0
        $args['paged'] = $args['offset'] / max( $args['limit'], 1 ) + 1;
        unset( $args['offset'] );
    }

    return dokan()->order->all( $args );
}

/**
 * Get all the orders from a specific date range
 *
 * @param string    $start_date
 * @param string    $end_date
 * @param int|false $seller_id
 * @param string    $status
 *
 * @deprecated 3.8.0
 *
 * @return WP_Error|WC_Order[]
 */
function dokan_get_seller_orders_by_date( $start_date, $end_date, $seller_id = false, $status = 'all' ) {
    wc_deprecated_function( 'dokan_get_seller_orders_by_date', '3.8.0', 'dokan()->order->all()' );

    // format start and end date
    $start_date = dokan_current_datetime()->modify( $start_date );
    $end_date   = dokan_current_datetime()->modify( $end_date );

    $query_args = [
        'seller_id' => $seller_id,
        'date'      => [
            'from' => $start_date ? $start_date->format( 'Y-m-d' ) : dokan_current_datetime()->format( 'Y-m-d' ),
            'to'   => $end_date ? $end_date->format( 'Y-m-d' ) : dokan_current_datetime()->format( 'Y-m-d' ),
        ],
        'status'    => $status,
        'return'    => 'objects',
    ];

    return dokan()->order->all( $query_args );
}

/**
 * Get the orders total from a specific seller
 *
 * @param array $args
 *
 * @deprecated 3.8.0
 *
 * @return int
 */
function dokan_get_seller_orders_number( $args = [] ) {
    wc_deprecated_function( 'dokan_get_seller_orders_number', '3.8.0', 'dokan()->order->all()' );

    $args['return'] = 'count';

    return dokan()->order->all( $args );
}

/**
 * Get seller withdraw by date range
 *
 * @param string    $start_date
 * @param string    $end_date
 * @param int|false $seller_id
 *
 * @return object
 */
function dokan_get_seller_withdraw_by_date( $start_date, $end_date, $seller_id = false ) {
    global $wpdb;

    $seller_id = ! $seller_id ? dokan_get_current_user_id() : intval( $seller_id );

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}dokan_withdraw
            WHERE user_id = %d AND DATE( date ) >= %s AND DATE( date ) <= %s AND status = %d
            ORDER BY date ASC",
            [ $seller_id, $start_date, $end_date, 1 ]
        )
    );
}

/**
 * Check if order is belonged to given seller
 *
 * @param int $seller_id
 * @param int $order_id
 *
 * @return bool
 */
function dokan_is_seller_has_order( $seller_id, $order_id ) {
    return dokan()->order->is_seller_has_order( $seller_id, $order_id );
}

/**
 * Count orders for a seller
 *
 * @since 3.8.0 moved the functionality of this function to Order Manager class
 *
 * @param int $seller_id
 *
 * @return array
 */
function dokan_count_orders( $seller_id ) {
    return dokan()->order->count_orders( $seller_id );
}

/**
 * Delete an order row from sync table when an order is deleted from WooCommerce
 *
 * @param int $order_id
 *
 * @deprecated 3.8.0
 *
 * @return void
 */
function dokan_delete_sync_order( $order_id ) {
    wc_deprecated_function( 'dokan_delete_sync_order', '3.8.0', 'dokan()->order->delete_seller_order()' );

    dokan()->order->delete_seller_order( $order_id );
}

/**
 * Delete an order row from sync table to not insert duplicate
 *
 * @since      2.4.11
 *
 * @param int $order_id
 * @param int $seller_id
 *
 * @deprecated 3.8.0
 *
 * @return void
 */
function dokan_delete_sync_duplicate_order( $order_id, $seller_id ) {
    wc_deprecated_function( 'dokan_delete_sync_duplicate_order', '3.8.0', 'dokan()->order->delete_seller_order()' );

    dokan()->order->delete_seller_order( $order_id, $seller_id );
}

/**
 * Insert an order in sync table once an order is created
 *
 * @param int $order_id
 *
 * @return void
 */
function dokan_sync_insert_order( $order_id ) {
    global $wpdb;

    if ( is_a( $order_id, 'WC_Order' ) ) {
        $order    = $order_id;
        $order_id = $order->get_id();
    } else {
        $order = wc_get_order( $order_id );
    }

    if ( ! $order || $order instanceof WC_Subscription ) {
        return;
    }

    if ( dokan()->order->is_order_already_synced( $order ) ) {
        return;
    }

    if ( (int) $order->get_meta( 'has_sub_order', true ) === 1 ) {
        return;
    }

    $seller_id    = dokan_get_seller_id_by_order( $order->get_id() );
    $order_total  = $order->get_total();
    $order_status = 'wc-' . $order->get_status();

    if ( dokan_is_admin_coupon_applied( $order, $seller_id ) ) {
        $net_amount = dokan()->commission->get_earning_by_order( $order, 'seller' );
    } else {
        $net_amount = dokan()->commission->get_earning_by_order( $order );
    }

    $net_amount    = apply_filters( 'dokan_order_net_amount', $net_amount, $order );
    $threshold_day = dokan_get_withdraw_threshold( $seller_id );

    dokan()->order->delete_seller_order( $order_id, $seller_id );

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
    $wpdb->insert(
        $wpdb->prefix . 'dokan_orders',
        [
            'order_id'     => $order_id,
            'seller_id'    => $seller_id,
            'order_total'  => $order_total,
            'net_amount'   => $net_amount,
            'order_status' => $order_status,
        ],
        [
            '%d',
            '%d',
            '%f',
            '%f',
            '%s',
        ]
    );

    $vendor_balance = dokan()->get_container()->get( VendorBalance::class );

    $vendor_balance->set_vendor_id( $seller_id );
    $vendor_balance->set_trn_id( $order_id );
    $vendor_balance->set_trn_type( $vendor_balance::TRN_TYPE_DOKAN_ORDERS );
    $vendor_balance->set_particulars( 'New order' );
    $vendor_balance->set_debit( $net_amount );
    $vendor_balance->set_trn_date( dokan_current_datetime()->format( 'Y-m-d H:i:s' ) );
    $vendor_balance->set_balance_date( dokan_current_datetime()->modify( "+ $threshold_day days" )->format( 'Y-m-d H:i:s' ) );
    $vendor_balance->save();
}

/**
 * Get a seller ID based on WooCommerce order.
 *
 * If Order has suborder, this method will return 0
 *
 * @since        3.2.11 rewritten entire function
 *
 * @param int|WC_Abstract_Order $order
 *
 * @return int | 0 on failure
 */
function dokan_get_seller_id_by_order( $order ) {
    global $wpdb;

    $order_id = $order;
    if ( ! is_numeric( $order ) ) {
        $order_id = $order->get_id();
    }

    $cache_key = 'get_seller_id_by_order_' . $order_id;
    $seller_id = Cache::get( $cache_key );
    $items     = [];

    if ( false === $seller_id ) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $seller_id = (int) $wpdb->get_var(
            $wpdb->prepare( "SELECT seller_id FROM {$wpdb->prefix}dokan_orders WHERE order_id = %d LIMIT 1", $order_id )
        );

        // store in cache
        if ( ! empty( $seller_id ) ) {
            Cache::set( $cache_key, $seller_id );
        }
    }

    if ( ! empty( $seller_id ) ) {
        return apply_filters( 'dokan_get_seller_id_by_order', (int) $seller_id, $items );
    }

    // get order instance
    $order = is_numeric( $order ) ? wc_get_order( $order_id ) : $order;

    if ( ! $order ) {
        return apply_filters( 'dokan_get_seller_id_by_order', 0, $items );
    }

    // if order has suborder, return 0
    if ( $order->get_meta( 'has_sub_order' ) ) {
        return apply_filters( 'dokan_get_seller_id_by_order', 0, $items );
    }

    // check order meta to get vendor id
    $seller_id = absint( $order->get_meta( '_dokan_vendor_id' ) );
    if ( $seller_id ) {
        return apply_filters( 'dokan_get_seller_id_by_order', $seller_id, $items );
    }

    // finally get vendor id from line items
    $items = $order->get_items( 'line_item' );
    if ( ! $items ) {
        return apply_filters( 'dokan_get_seller_id_by_order', 0, $items );
    }

    foreach ( $items as $item ) {
        $product_id = $item->get_product_id();
        $seller_id  = absint( get_post_field( 'post_author', $product_id ) );
        if ( $seller_id ) {
            return apply_filters( 'dokan_get_seller_id_by_order', $seller_id, $items );
        }
    }

    return apply_filters( 'dokan_get_seller_id_by_order', 0, $items );
}

/**
 * Get bootstrap label class based on order status
 *
 * @param string $status
 *
 * @return string
 */
function dokan_get_order_status_class( $status ) {
    $order_status_class = '';
    switch ( $status ) {
        case 'completed':
        case 'wc-completed':
            $order_status_class = 'success';
            break;

        case 'pending':
        case 'wc-pending':
        case 'failed':
        case 'wc-failed':
            $order_status_class = 'danger';
            break;

        case 'on-hold':
        case 'wc-on-hold':
            $order_status_class = 'warning';
            break;

        case 'processing':
        case 'wc-processing':
            $order_status_class = 'info';
            break;

        case 'refunded':
        case 'wc-refunded':
        case 'cancelled':
        case 'wc-cancelled':
        case 'checkout-draft':
            $order_status_class = 'default';
            break;
    }

    return apply_filters( 'dokan_get_order_status_class', $order_status_class, $status );
}

/**
 * Get translated string of order status
 *
 * @param string $status
 *
 * @return string
 */
function dokan_get_order_status_translated( $status ) {
    $translated_order_status = '';
    switch ( $status ) {
        case 'completed':
        case 'wc-completed':
            $translated_order_status = __( 'Completed', 'dokan-lite' );
            break;

        case 'pending':
        case 'wc-pending':
            $translated_order_status = __( 'Pending Payment', 'dokan-lite' );
            break;

        case 'on-hold':
        case 'wc-on-hold':
            $translated_order_status = __( 'On-hold', 'dokan-lite' );
            break;

        case 'processing':
        case 'wc-processing':
            $translated_order_status = __( 'Processing', 'dokan-lite' );
            break;

        case 'refunded':
        case 'wc-refunded':
            $translated_order_status = __( 'Refunded', 'dokan-lite' );
            break;

        case 'cancelled':
        case 'wc-cancelled':
            $translated_order_status = __( 'Cancelled', 'dokan-lite' );
            break;

        case 'failed':
        case 'wc-failed':
            $translated_order_status = __( 'Failed', 'dokan-lite' );
            break;

        case 'checkout-draft':
            $translated_order_status = __( 'Draft', 'dokan-lite' );
            break;
    }

    return apply_filters( 'dokan_get_order_status_translated', $translated_order_status, $status );
}

/**
 * Get product items list from order seperated by given glue
 *
 * @since 1.4
 *
 * @param WC_Order $order
 * @param string   $glue
 *
 * @return string list of products
 */
function dokan_get_product_list_by_order( $order, $glue = ',' ) {
    $product_names = [];
    foreach ( $order->get_items( 'line_item' ) as $line_item ) {
        $product_names[] = $line_item['name'];
    }

    return implode( $glue, $product_names );
}

/**
 * Get if an order is a sub order or not
 *
 * @since 2.4.11
 *
 * @param int|WC_Abstract_Order $order
 *
 * @return boolean
 */
function dokan_is_sub_order( $order ) {
    if ( is_numeric( $order ) ) {
        $order = wc_get_order( $order );
    }

    return ! ( ! $order || $order->get_parent_id() === 0 );
}

/**
 * Get total number of orders in Dokan order table
 *
 * @since      2.4.3
 *
 * @deprecated 3.8.0
 *
 * @return  int Order_count
 */
function dokan_total_orders() {
    wc_deprecated_function( 'dokan_total_orders', '3.8.0', 'dokan()->order->all()' );

    global $wpdb;

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $order_count = $wpdb->get_var( 'SELECT COUNT(id) FROM ' . $wpdb->prefix . 'dokan_orders ' );

    return (int) $order_count;
}

/**
 * Return array of sellers with items
 *
 * @since 2.4.4
 * @since 2.9.11 Param can be an instance of WC_Order
 *
 * @param WC_Order|int $order
 *
 * @return array $sellers_with_items
 */
function dokan_get_sellers_by( $order ) {
    if ( ! $order instanceof WC_Order ) {
        $order = dokan()->order->get( $order );
    }

    $sellers = [];
    if ( ! $order ) {
        return $sellers;
    }

    $order_items = $order->get_items();
    foreach ( $order_items as $item ) {
        $seller_id = get_post_field( 'post_author', $item['product_id'] );

        //New filter hook to modify the seller id at run time.
        $seller_id = apply_filters( 'dokan_get_sellers_by', $seller_id, $item );
        if ( ! empty( $seller_id ) ) {
            $sellers[ $seller_id ][] = $item;
        }
    }

    return $sellers;
}

/**
 * Return unique array of seller_ids from an order
 *
 * @since 2.4.9
 *
 * @param int $order_id
 *
 * @return array $seller_ids
 */
function dokan_get_seller_ids_by( $order_id ) {
    $sellers = dokan_get_sellers_by( $order_id );

    return array_unique( array_keys( $sellers ) );
}

/**
 * Get suborder ids by parent order id
 *
 * @param int $parent_order_id
 *
 * @return int[]|null
 */
function dokan_get_suborder_ids_by( $parent_order_id ) {
    $sub_orders = wc_get_orders(
        [
            'type'   => 'shop_order',
            'parent' => $parent_order_id,
            'return' => 'ids',
            'limit'  => -1,
        ]
    );

    if ( empty( $sub_orders ) ) {
        return null;
    }

    return $sub_orders;
}

/**
 * Return admin commission from an order
 *
 * @since      2.4.12
 *
 * @param WC_Order $order
 * @param string   $context accepted values are seller and admin
 *
 * @deprecated 2.9.21
 *
 * @return float
 */
function dokan_get_admin_commission_by( $order, $context ) {
    wc_deprecated_function( 'dokan_get_admin_commission_by', '2.9.21', 'dokan()->commission->get_earning_by_order( $order, $context )' );
    $context = 'seller' === $context ? $context : 'admin';

    return dokan()->commission->get_earning_by_order( $order, $context );
}

/**
 * Get Customer Order IDs by Seller
 *
 * @since      2.6.6
 *
 * @param int $customer_id
 * @param int $seller_id
 *
 * @deprecated 3.8.0
 *
 * @return array|null on failure
 */
function dokan_get_customer_orders_by_seller( $customer_id, $seller_id ) {
    wc_deprecated_function( 'dokan_get_customer_orders_by_seller', '3.8.0', 'dokan()->order->get_customer_order_ids_by_seller()' );

    return dokan()->order->get_customer_order_ids_by_seller( $customer_id, $seller_id );
}

/**
 * Header rows for CSV order export
 *
 * @since 2.8.6
 *
 * @return array
 */
function dokan_order_csv_headers() {
    return apply_filters(
        'dokan_csv_export_headers', [
            'order_id'             => __( 'Order No', 'dokan-lite' ),
            'order_items'          => __( 'Order Items', 'dokan-lite' ),
            'order_shipping'       => __( 'Shipping method', 'dokan-lite' ),
            'order_shipping_cost'  => __( 'Shipping Cost', 'dokan-lite' ),
            'order_payment_method' => __( 'Payment method', 'dokan-lite' ),
            'order_total'          => __( 'Order Total', 'dokan-lite' ),
            'earnings'             => __( 'Earnings', 'dokan-lite' ),
            'order_status'         => __( 'Order Status', 'dokan-lite' ),
            'order_date'           => __( 'Order Date', 'dokan-lite' ),
            'billing_company'      => __( 'Billing Company', 'dokan-lite' ),
            'billing_first_name'   => __( 'Billing First Name', 'dokan-lite' ),
            'billing_last_name'    => __( 'Billing Last Name', 'dokan-lite' ),
            'billing_full_name'    => __( 'Billing Full Name', 'dokan-lite' ),
            'billing_email'        => __( 'Billing Email', 'dokan-lite' ),
            'billing_phone'        => __( 'Billing Phone', 'dokan-lite' ),
            'billing_address_1'    => __( 'Billing Address 1', 'dokan-lite' ),
            'billing_address_2'    => __( 'Billing Address 2', 'dokan-lite' ),
            'billing_city'         => __( 'Billing City', 'dokan-lite' ),
            'billing_state'        => __( 'Billing State', 'dokan-lite' ),
            'billing_postcode'     => __( 'Billing Postcode', 'dokan-lite' ),
            'billing_country'      => __( 'Billing Country', 'dokan-lite' ),
            'shipping_company'     => __( 'Shipping Company', 'dokan-lite' ),
            'shipping_first_name'  => __( 'Shipping First Name', 'dokan-lite' ),
            'shipping_last_name'   => __( 'Shipping Last Name', 'dokan-lite' ),
            'shipping_full_name'   => __( 'Shipping Full Name', 'dokan-lite' ),
            'shipping_address_1'   => __( 'Shipping Address 1', 'dokan-lite' ),
            'shipping_address_2'   => __( 'Shipping Address 2', 'dokan-lite' ),
            'shipping_city'        => __( 'Shipping City', 'dokan-lite' ),
            'shipping_state'       => __( 'Shipping State', 'dokan-lite' ),
            'shipping_postcode'    => __( 'Shipping Postcode', 'dokan-lite' ),
            'shipping_country'     => __( 'Shipping Country', 'dokan-lite' ),
            'customer_ip'          => __( 'Customer IP', 'dokan-lite' ),
            'customer_note'        => __( 'Customer Note', 'dokan-lite' ),
        ]
    );
}

/**
 * Export orders to a CSV file
 *
 * @since 2.8.6
 *
 * @param array  $orders
 * @param string $file A file name to write to
 *
 * @return void
 */
function dokan_order_csv_export( $orders, $file = null ) {
    $headers  = dokan_order_csv_headers();
    $statuses = wc_get_order_statuses();

    $resource = ( $file === null ) ? 'php://output' : $file;
    $output   = fopen( $resource, 'w' ); // phpcs:ignore

    fputcsv( $output, $headers );

    foreach ( $orders as $the_order ) {
        $line      = [];
        $the_order = wc_get_order( $the_order );
        if ( ! $the_order ) {
            continue;
        }

        foreach ( $headers as $row_key => $label ) {
            switch ( $row_key ) {
                case 'order_id':
                    $line[ $row_key ] = $the_order->get_id();
                    break;
                case 'order_items':
                    $line[ $row_key ] = dokan_get_product_list_by_order( $the_order, '; ' );
                    break;
                case 'order_shipping':
                    $line[ $row_key ] = $the_order->get_shipping_method();
                    break;
                case 'order_shipping_cost':
                    $line[ $row_key ] = $the_order->get_shipping_total();
                    break;
                case 'order_payment_method':
                    $line[ $row_key ] = $the_order->get_payment_method_title();
                    break;
                case 'order_total':
                    $line[ $row_key ] = $the_order->get_total();
                    break;
                case 'earnings':
                    $line[ $row_key ] = dokan()->commission->get_earning_by_order( $the_order );
                    break;
                case 'order_status':
                    $line[ $row_key ] = $statuses[ 'wc-' . $the_order->get_status() ];
                    break;
                case 'order_date':
                    $line[ $row_key ] = dokan_get_date_created( $the_order );
                    break;

                // billing details
                case 'billing_company':
                    $line[ $row_key ] = $the_order->get_billing_company();
                    break;
                case 'billing_first_name':
                    $line[ $row_key ] = $the_order->get_billing_first_name();
                    break;
                case 'billing_last_name':
                    $line[ $row_key ] = $the_order->get_billing_last_name();
                    break;
                case 'billing_full_name':
                    $line[ $row_key ] = $the_order->get_formatted_billing_full_name();
                    break;
                case 'billing_email':
                    $line[ $row_key ] = $the_order->get_billing_email();
                    break;
                case 'billing_phone':
                    $line[ $row_key ] = $the_order->get_billing_phone();
                    break;
                case 'billing_address_1':
                    $line[ $row_key ] = $the_order->get_billing_address_1();
                    break;
                case 'billing_address_2':
                    $line[ $row_key ] = $the_order->get_billing_address_2();
                    break;
                case 'billing_city':
                    $line[ $row_key ] = $the_order->get_billing_city();
                    break;
                case 'billing_state':
                    $line[ $row_key ] = $the_order->get_billing_state();
                    break;
                case 'billing_postcode':
                    $line[ $row_key ] = $the_order->get_billing_postcode();
                    break;
                case 'billing_country':
                    $line[ $row_key ] = $the_order->get_billing_country();
                    break;

                // shipping details
                case 'shipping_company':
                    $line[ $row_key ] = $the_order->get_shipping_company();
                    break;
                case 'shipping_first_name':
                    $line[ $row_key ] = $the_order->get_shipping_first_name();
                    break;
                case 'shipping_last_name':
                    $line[ $row_key ] = $the_order->get_shipping_last_name();
                    break;
                case 'shipping_full_name':
                    $line[ $row_key ] = $the_order->get_formatted_shipping_full_name();
                    break;
                case 'shipping_address_1':
                    $line[ $row_key ] = $the_order->get_shipping_address_1();
                    break;
                case 'shipping_address_2':
                    $line[ $row_key ] = $the_order->get_shipping_address_2();
                    break;
                case 'shipping_city':
                    $line[ $row_key ] = $the_order->get_shipping_city();
                    break;
                case 'shipping_state':
                    $line[ $row_key ] = $the_order->get_shipping_state();
                    break;
                case 'shipping_postcode':
                    $line[ $row_key ] = $the_order->get_shipping_postcode();
                    break;
                case 'shipping_country':
                    $line[ $row_key ] = $the_order->get_shipping_country();
                    break;

                // custom details
                case 'customer_ip':
                    $line[ $row_key ] = $the_order->get_customer_ip_address();
                    break;
                case 'customer_note':
                    $line[ $row_key ] = $the_order->get_customer_note();
                    break;

                default:
                    $line[ $row_key ] = '';
                    break;
            }
        }

        $line = apply_filters( 'dokan_csv_export_lines', $line, $the_order );

        fputcsv( $output, $line );
    }

    fclose( $output ); // phpcs:ignore
}

/**
 * Dokan get seller id by order id
 *
 * @param int $order_id
 *
 * @deprecated 3.8.0
 *
 * @return int
 */
function dokan_get_seller_id_by_order_id( $order_id ) {
    wc_deprecated_function( 'dokan_get_seller_id_by_order_id', '2.9.10', 'dokan_get_seller_id_by_order' );

    return dokan_get_seller_id_by_order( $order_id );
}

/**
 * Check if an order with same id is exists in database
 *
 * @param int $order_id
 *
 * @deprecated 3.8.0
 *
 * @return boolean
 */
function dokan_is_order_already_exists( $order_id ) {
    wc_deprecated_function( 'dokan_is_order_already_exists', '3.8.0', 'dokan()->order->is_order_already_synced()' );

    return dokan()->order->is_order_already_synced( $order_id );
}

/**
 * Customer has order from current seller
 *
 * @since 2.8.6
 * @since 3.8.0 moved this function from includes/functions.php
 *
 * @param int      $customer_id
 * @param int|null $seller_id
 *
 * @return bool
 */
function dokan_customer_has_order_from_this_seller( $customer_id, $seller_id = null ) {
    $seller_id = ! empty( $seller_id ) ? $seller_id : dokan_get_current_user_id();
    $args = [
        'seller_id'   => $seller_id,
        'customer_id' => $customer_id,
        'return'      => 'count',
    ];
    $count = dokan()->order->all( $args );

    return $count > 0;
}

/**
 * Get total sales amount of a seller
 *
 * @since 3.8.0 moved from includes/functions.php
 *
 * @param int $seller_id
 *
 * @return float
 */
function dokan_author_total_sales( $seller_id ) {
    $vendor = dokan()->vendor->get( $seller_id );

    if ( $vendor->id === 0 ) {
        return 0;
    }

    return $vendor->get_total_sales();
}

if ( ! function_exists( 'dokan_get_seller_earnings_by_order' ) ) {

    /**
     * Get Seller's net Earnings from a order
     *
     * @since      2.5.2
     * @since      3.8.0 moved from includes/functions.php
     *
     * @param WC_ORDER $order
     * @param int      $seller_id
     *
     * @deprecated 3.8.0
     *
     * @return int $earned
     */
    function dokan_get_seller_earnings_by_order( $order, $seller_id ) {
        wc_deprecated_function( 'dokan_get_seller_earnings_by_order', '3.8.0', 'dokan()->commission->get_earning_by_order( $order, \'seller\' )' );
        $earned = dokan()->commission->get_earning_by_order( $order, 'seller' );

        return apply_filters( 'dokan_get_seller_earnings_by_order', $earned, $order, $seller_id );
    }
}

/**
 * Dokan get vendor order details by order ID
 *
 * @since 3.2.11 rewritten entire function
 * @since 3.8.0 Moved this function from includes/functions.php
 *
 * @param int      $order_id
 * @param int|null $vendor_id will remove this parameter in future
 *
 * @return array will return empty array in case order has suborders
 */
function dokan_get_vendor_order_details( $order_id, $vendor_id = null ) {
    $order      = wc_get_order( $order_id );
    $order_info = [];

    if ( ! $order || $order->get_meta( 'has_sub_order' ) ) {
        return apply_filters( 'dokan_get_vendor_order_details', $order_info, $order_id, $vendor_id );
    }

    foreach ( $order->get_items( 'line_item' ) as $item ) {
        $info = [
            'product'  => $item['name'],
            'quantity' => $item['quantity'],
            'total'    => $item['total'],
        ];
        array_push( $order_info, $info );
    }

    return apply_filters( 'dokan_get_vendor_order_details', $order_info, $order_id, $vendor_id );
}

/**
 * Updates bulk orders status by orders ids.
 *
 * @since 3.7.10
 * @since 3.8.0 Moved this method from includes/functions.php file
 *
 * @param array $postdata
 *
 * @return void
 */
function dokan_apply_bulk_order_status_change( $postdata ) {
    if ( ! isset( $postdata['status'] ) || ! isset( $postdata['bulk_orders'] ) ) {
        return;
    }

    $status = sanitize_text_field( wp_unslash( $postdata['status'] ) );
    $orders = array_map( 'absint', $postdata['bulk_orders'] );

    // -1 means bluk action option value
    $excluded_status = [ '-1', 'cancelled', 'refunded' ];

    if ( in_array( $status, $excluded_status, true ) ) {
        return;
    }

    foreach ( $orders as $order_id ) {
        $order = wc_get_order( $order_id );

        if ( ! $order instanceof \WC_Order ) {
            continue;
        }

        if ( in_array( $order->get_status(), $excluded_status, true ) || $order->get_status() === $status ) {
            continue;
        }

        $order->update_status( $status );
    }
}
