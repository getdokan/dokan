<?php

use WeDevs\Dokan\Cache;

/**
 * Dokan get seller amount from order total
 *
 * @param int $order_id
 *
 * @return float
 */
function dokan_get_seller_amount_from_order( $order_id, $get_array = false ) {
    $order              = dokan()->order->get( $order_id );
    $seller_id          = dokan_get_seller_id_by_order( $order_id );
    $net_amount         = dokan_get_seller_earnings_by_order( $order, $seller_id );
    $order_shipping     = $order->get_total_shipping();
    $order_tax          = $order->get_total_tax();
    $shipping_recipient = dokan_get_option( 'shipping_fee_recipient', 'dokan_selling', 'seller' );
    $tax_recipient      = dokan_get_option( 'tax_fee_recipient', 'dokan_selling', 'seller' );

    if ( $get_array ) {
        $amount = array(
            'net_amount' => $net_amount,
            'shipping'   => 0,
            'tax'        => 0,
        );

        if ( 'seller' == $shipping_recipient ) {
            $amount['shipping'] = $order_shipping;
        }

        if ( 'seller' == $tax_recipient ) {
            $amount['tax'] = $order_tax;
        }

        return apply_filters( 'dokan_get_seller_amount_from_order_array', $amount, $order, $seller_id );
    }

    return apply_filters( 'dokan_get_seller_amount_from_order', $net_amount, $order, $seller_id );
}

/**
 * Get all the orders from a specific seller
 *
 * @global object $wpdb
 * @param int $seller_id
 * @param string $status
 * @param string $order_date
 * @param int $limit
 * @param int $offset
 * @param int $customer_id
 *
 * @return array
 */
function dokan_get_seller_orders( $seller_id, $status = 'all', $order_date = null, $limit = 10, $offset = 0, $customer_id = null ) {
    // get all function arguments as key => value pairs
    $args = get_defined_vars();

    global $wpdb;

    $pagenum     = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;
    $cache_group = "seller_order_data_{$seller_id}";
    $cache_key   = 'get_seller_orders_' . md5( wp_json_encode( array_merge( $args, [ 'page' => $pagenum ] ) ) );
    $orders      = Cache::get( $cache_key, $cache_group );

    if ( false === $orders ) {
        $getdata     = wp_unslash( $_GET );
        $order       = empty( $getdata['order'] ) ? 'DESC' : sanitize_text_field( $getdata['order'] );
        $order_by    = 'p.post_date';
        $exclude     = ! empty( $getdata['exclude'] ) ? ' AND do.order_id NOT IN (' . esc_sql( $getdata['exclude'] ) . ')' : '';

        if ( ! empty( $getdata['orderby'] ) &&
            in_array( sanitize_text_field( $getdata['orderby'] ), [ 'id', 'order_id', 'seller_id', 'order_total', 'net_amount', 'order_status' ], true ) ) {
            $order_by = 'do.' . sanitize_text_field( $getdata['orderby'] );
        }

        $join  = $customer_id ? "LEFT JOIN $wpdb->postmeta pm ON p.ID = pm.post_id" : '';
        $where = $customer_id ? sprintf( "pm.meta_key = '_customer_user' AND pm.meta_value = %d AND", $customer_id ) : '';

        $status_where = ( $status === 'all' ) ? '' : $wpdb->prepare( ' AND order_status = %s', $status );
        $date_query   = ( $order_date ) ? $wpdb->prepare( ' AND DATE( p.post_date ) = %s', $order_date ) : '';

        $orders = $wpdb->get_results(
            $wpdb->prepare(
            "SELECT do.order_id, p.post_date
            FROM {$wpdb->prefix}dokan_orders AS do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            {$join}
            WHERE
                do.seller_id = %d AND
                {$where}
                p.post_status != 'trash'
                {$date_query}
                {$status_where}
                {$exclude}
            GROUP BY do.order_id
            ORDER BY {$order_by} {$order}
            LIMIT %d, %d", $seller_id, $offset, $limit
            )
        );

        Cache::set( $cache_key, $orders, $cache_group );
    }

    return $orders;
}

/**
 * Get all the orders from a specific date range
 *
 * @global object $wpdb
 * @param int $seller_id
 *
 * @return array
 */
function dokan_get_seller_orders_by_date( $start_date, $end_date, $seller_id = false, $status = 'all' ) {
    // get all function arguments as key => value pairs
    $args = get_defined_vars();

    global $wpdb;

    $seller_id = ! $seller_id ? dokan_get_current_user_id() : intval( $seller_id );
    $cache_group = 'seller_order_data_' . $seller_id;
    $cache_key   = 'get_seller_orders_by_date_' . md5( wp_json_encode( $args ) );
    $orders      = Cache::get( $cache_key, $cache_group );

    if ( false === $orders ) {
        // format start and end date
        $date_start = dokan_current_datetime()->setTime( 0, 0, 0);
        $date_end   = $date_start->setTime( 23, 59, 59 );
        $start_date = strtotime( $start_date ) ? $date_start->modify( $start_date ) : $date_start; // strtotime is needed because modify() method can return false
        $end_date   = strtotime( $end_date ) ? $date_end->modify( $end_date ) : $date_end;

        if ( is_array( $status ) ) {
            $status_where = sprintf( " AND order_status IN ('%s')", implode( "', '", $status ) );
        } else {
            $status_where = $wpdb->prepare( ' AND order_status = %s', $status );
        }

        $date_query = $wpdb->prepare( ' AND DATE( p.post_date ) >= %s AND DATE( p.post_date ) <= %s', $start_date->format( 'Y-m-d H:i:s' ), $end_date->format( 'Y-m-d H:i:s' ) );

        $orders = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT do.*, p.post_date
            FROM {$wpdb->prefix}dokan_orders AS do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            WHERE
                do.seller_id = %d AND
                p.post_status != 'trash'
                {$date_query}
                {$status_where}
            GROUP BY do.order_id
            ORDER BY p.post_date ASC", $seller_id
            )
        );

        Cache::set( $cache_key, $orders, $cache_group );
    }

    return $orders;
}

/**
 * Get seller withdraw by date range
 *
 * @param  string  $start_date
 * @param  string  $end_date
 * @param  int $seller_id
 *
 * @return object
 */
function dokan_get_seller_withdraw_by_date( $start_date, $end_date, $seller_id = false ) {
    global $wpdb;

    $seller_id             = ! $seller_id ? dokan_get_current_user_id() : intval( $seller_id );
    $withdraw_status_where = $wpdb->prepare( ' AND status = %d', 1 );
    $withdraw_date_query   = $wpdb->prepare( ' AND DATE( date ) >= %s AND DATE( date ) <= %s', $start_date, $end_date );

    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT *
        FROM {$wpdb->prefix}dokan_withdraw
        WHERE
            user_id = %d
            {$withdraw_date_query}
            {$withdraw_status_where}
        ORDER BY date ASC", $seller_id
        )
    );
}

/**
 * Get the orders total from a specific seller
 *
 * @global object $wpdb
 * @param array $args
 * @return int
 */
function dokan_get_seller_orders_number( $args = [] ) {
    global $wpdb;

    $seller_id   = ! empty( $args['seller_id'] ) ? $args['seller_id'] : 0;
    $status      = ! empty( $args['status'] ) ? $args['status'] : 'all';
    $cache_group = "seller_order_data_{$seller_id}";
    $cache_key   = 'get_seller_orders_number_' . md5( wp_json_encode( $args ) );
    $count       = Cache::get( $cache_key, $cache_group );

    if ( false === $count ) {
        $status_where = ( 'all' === $status ) ? '' : $wpdb->prepare( ' AND order_status = %s', $status );
        $join = '';
        $customer_where = '';
        if ( ! empty( $args['customer_id'] ) ) {
            $join = " LEFT JOIN $wpdb->postmeta pm ON p.ID = pm.post_id";
            $customer_where = $wpdb->prepare(" AND pm.meta_key = '_customer_user' AND pm.meta_value = %d", $args['customer_id'] );
        }
        $date_where = ! empty( $args['date'] ) ? $wpdb->prepare( ' AND DATE( p.post_date ) = %s', $args['date'] ) : '';

        $count = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(do.order_id) as count
                FROM {$wpdb->prefix}dokan_orders AS do
                LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
                {$join}
                WHERE
                    do.seller_id = %d AND
                    p.post_status != 'trash'
                    {$status_where}
                    {$customer_where}
                    {$date_where}", $seller_id
            )
        );

        Cache::set( $cache_key, $count, $cache_group );
    }

    return $count;
}

/**
 * Get all the orders from a specific seller
 *
 * @global object $wpdb
 * @param int $seller_id
 * @return array
 */
function dokan_is_seller_has_order( $seller_id, $order_id ) {
    global $wpdb;
    return $wpdb->get_row(
        $wpdb->prepare(
            "SELECT do.order_id, p.post_date
        FROM {$wpdb->prefix}dokan_orders AS do
        LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
        WHERE
            do.seller_id = %d AND
            p.post_status != 'trash' AND
            do.order_id = %d
        GROUP BY do.order_id", $seller_id, $order_id
        )
    );
}

/**
 * Count orders for a seller
 *
 * @global WPDB $wpdb
 * @param int $user_id
 * @return array
 */
function dokan_count_orders( $user_id ) {
    global $wpdb;

    $cache_group = "seller_order_data_{$user_id}";
    $cache_key   = "count_orders_{$user_id}";
    $counts      = Cache::get( $cache_key, $cache_group );

    if ( false === $counts ) {
        $counts = [
            'wc-pending'    => 0,
            'wc-completed'  => 0,
            'wc-on-hold'    => 0,
            'wc-processing' => 0,
            'wc-refunded'   => 0,
            'wc-cancelled'  => 0,
            'wc-failed'     => 0,
            'total'         => 0,
        ];

        $counts = apply_filters( 'dokan_order_status_count', $counts );

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT do.order_status
            FROM {$wpdb->prefix}dokan_orders AS do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            WHERE
                do.seller_id = %d AND
                p.post_type = 'shop_order' AND
                p.post_status != 'trash'", $user_id
            )
        );

        if ( $results ) {
            foreach ( $results as $order ) {
                if ( isset( $counts[ $order->order_status ] ) ) {
                    $counts[ $order->order_status ] += 1;
                    $counts['total'] += 1;
                }
            }
        }

        $counts = (object) $counts;
        Cache::set( $cache_key, $counts, $cache_group );
    }

    return $counts;
}

/**
 * Delete a order row from sync table when a order is deleted from WooCommerce
 *
 * @global object $wpdb
 * @param type $order_id
 */
function dokan_delete_sync_order( $order_id ) {
    global $wpdb;
    $wpdb->delete( $wpdb->prefix . 'dokan_orders', array( 'order_id' => $order_id ) );
}

/**
 * Delete a order row from sync table to not insert duplicate
 *
 * @global object $wpdb
 * @param type $order_id, $seller_id
 *
 * @since  2.4.11
 */
function dokan_delete_sync_duplicate_order( $order_id, $seller_id ) {
    global $wpdb;
    $wpdb->delete(
        $wpdb->prefix . 'dokan_orders', array(
			'order_id' => $order_id,
			'seller_id' => $seller_id,
        )
    );
}

/**
 * Insert a order in sync table once a order is created
 *
 * @global object $wpdb
 * @param int $order_id
 */
function dokan_sync_insert_order( $order_id ) {
    global $wpdb;

    if ( dokan_is_order_already_exists( $order_id ) ) {
        return;
    }

    if ( get_post_meta( $order_id, 'has_sub_order', true ) == '1' ) {
        return;
    }

    $order        = dokan()->order->get( $order_id );
    $seller_id    = dokan_get_seller_id_by_order( $order_id );
    $order_total  = $order->get_total();
    $order_status = dokan_get_prop( $order, 'status' );

    if ( dokan_is_admin_coupon_applied( $order, $seller_id ) ) {
        $net_amount = dokan()->commission->get_earning_by_order( $order, 'seller' );
    } else {
        $admin_commission = dokan()->commission->get_earning_by_order( $order, 'admin' );
        $net_amount       = $order_total - $admin_commission;
    }

    $net_amount         = apply_filters( 'dokan_order_net_amount', $net_amount, $order );
    $threshold_day      = dokan_get_withdraw_threshold( $seller_id );

    dokan_delete_sync_duplicate_order( $order_id, $seller_id );

    // make sure order status contains "wc-" prefix
    if ( stripos( $order_status, 'wc-' ) === false ) {
        $order_status = 'wc-' . $order_status;
    }

    $wpdb->insert(
        $wpdb->prefix . 'dokan_orders',
        array(
            'order_id'     => $order_id,
            'seller_id'    => $seller_id,
            'order_total'  => $order_total,
            'net_amount'   => $net_amount,
            'order_status' => $order_status,
        ),
        array(
            '%d',
            '%d',
            '%f',
            '%f',
            '%s',
        )
    );

    $wpdb->insert(
        $wpdb->prefix . 'dokan_vendor_balance',
        array(
            'vendor_id'     => $seller_id,
            'trn_id'        => $order_id,
            'trn_type'      => 'dokan_orders',
            'perticulars'   => 'New order',
            'debit'         => $net_amount,
            'credit'        => 0,
            'status'        => $order_status,
            'trn_date'      => current_time( 'mysql' ),
            'balance_date'  => date( 'Y-m-d h:i:s', strtotime( current_time( 'mysql' ) . ' + ' . $threshold_day . ' days' ) ),
        ),
        array(
            '%d',
            '%d',
            '%s',
            '%s',
            '%f',
            '%f',
            '%s',
            '%s',
            '%s',
        )
    );
}

/**
 * Get a seller ID based on WooCommerce order.
 *
 * If Order has suborder, this method will return 0
 *
 * @global object $wpdb
 * @param int $order_id
 *
 * @since 3.2.11 rewritten entire function
 *
 * @return int | 0 on failure
 */
function dokan_get_seller_id_by_order( $order_id ) {
    global $wpdb;

    $cache_key   = 'get_seller_id_by_order_' . $order_id;
    $seller_id   = Cache::get( $cache_key );
    $items       = [];

    // hack: delete old cached data, will delete this code later version of dokan lite
    if ( is_array( $seller_id ) ) {
        $seller_id = false;
    }

    if ( false === $seller_id ) {
        $seller_id = (int) $wpdb->get_var(
            $wpdb->prepare( "SELECT seller_id FROM {$wpdb->prefix}dokan_orders WHERE order_id = %d LIMIT 1", $order_id )
        );
        Cache::set( $cache_key, $seller_id );
    }

    if ( ! empty( $seller_id ) ) {
        return apply_filters( 'dokan_get_seller_id_by_order', (int) $seller_id, $items );
    }

    // get order instance
    $order = wc_get_order( $order_id );

    if ( ! $order instanceof WC_Abstract_Order ) {
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
 * @return string
 */
function dokan_get_order_status_class( $status ) {
    switch ( $status ) {
        case 'completed':
        case 'wc-completed':
            return 'success';
            break;

        case 'pending':
        case 'wc-pending':
            return 'danger';
            break;

        case 'on-hold':
        case 'wc-on-hold':
            return 'warning';
            break;

        case 'processing':
        case 'wc-processing':
            return 'info';
            break;

        case 'refunded':
        case 'wc-refunded':
            return 'default';
            break;

        case 'cancelled':
        case 'wc-cancelled':
            return 'default';
            break;

        case 'failed':
        case 'wc-failed':
            return 'danger';
            break;

        default:
            return apply_filters( 'dokan_get_order_status_class', '', $status );
            break;
    }
}

/**
 * Get translated string of order status
 *
 * @param string $status
 * @return string
 */
function dokan_get_order_status_translated( $status ) {
    switch ( $status ) {
        case 'completed':
        case 'wc-completed':
            return __( 'Completed', 'dokan-lite' );
            break;

        case 'pending':
        case 'wc-pending':
            return __( 'Pending Payment', 'dokan-lite' );
            break;

        case 'on-hold':
        case 'wc-on-hold':
            return __( 'On-hold', 'dokan-lite' );
            break;

        case 'processing':
        case 'wc-processing':
            return __( 'Processing', 'dokan-lite' );
            break;

        case 'refunded':
        case 'wc-refunded':
            return __( 'Refunded', 'dokan-lite' );
            break;

        case 'cancelled':
        case 'wc-cancelled':
            return __( 'Cancelled', 'dokan-lite' );
            break;

        case 'failed':
        case 'wc-failed':
            return __( 'Failed', 'dokan-lite' );
            break;

        default:
            return apply_filters( 'dokan_get_order_status_translated', '', $status );
            break;
    }
}

/**
 * Get product items list from order
 *
 * @since 1.4
 *
 * @param  object $order
 * @param  string $glue
 *
 * @return string list of products
 */
function dokan_get_product_list_by_order( $order, $glue = ',' ) {
    $product_list = '';
    $order_item   = $order->get_items();

    foreach ( $order_item as $product ) {
        $prodct_name[] = $product['name'];
    }

    $product_list = implode( $glue, $prodct_name );

    return $product_list;
}

/**
 * Get if an order is a sub order or not
 *
 * @since 2.4.11
 *
 * @param int $order_id
 *
 * @return boolean
 */
function dokan_is_sub_order( $order_id ) {
    $parent_order_id = wp_get_post_parent_id( $order_id );

    if ( 0 != $parent_order_id ) {
        return true;
    }

    return false;
}

/**
 * Get toal number of orders in Dokan order table
 *
 * @since 2.4.3
 *
 * @return  int Order_count
 */
function dokan_total_orders() {
    global $wpdb;

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

    $order_items = $order->get_items();

    $sellers = array();

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
 * @param type $order_id
 *
 * @return array $seller_ids
 */
function dokan_get_seller_ids_by( $order_id ) {
    $sellers = dokan_get_sellers_by( $order_id );
    return array_unique( array_keys( $sellers ) );
}

/**
 *
 * @global object $wpdb
 * @param type $parent_order_id
 * @return type
 */
function dokan_get_suborder_ids_by( $parent_order_id ) {
    global $wpdb;

    $sub_orders = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts}
         WHERE post_type = 'shop_order'
         AND post_parent = %d", $parent_order_id
        )
    );

    if ( ! $sub_orders ) {
        return null;
    }

    return $sub_orders;
}

/**
 * Return admin commisson from an order
 *
 * @since 2.4.12
 *
 * @param object $order
 *
 * @return float $commission
 */
function dokan_get_admin_commission_by( $order, $context ) {
    $context = 'seller' === $context ? $context : 'admin';
    wc_deprecated_function( 'dokan_get_admin_commission_by', '2.9.21', 'dokan()->commission->get_earning_by_order()' );

    return dokan()->commission->get_earning_by_order( $order, $context );

    if ( get_posts(
        array(
			'post_parent' => $order->get_id(),
			'post_type' => 'shop_order',
			'post_status' => 'any',
        )
    ) ) {
        return;
    }

    $saved_admin_fee = get_post_meta( $order->get_id(), '_dokan_admin_fee', true );

    if ( $saved_admin_fee != '' ) {
        return apply_filters( 'dokan_order_admin_commission', $saved_admin_fee, $order );
    }

    $admin_commission   = 0;
    $refund_t           = 0;
    $commissions        = array();
    $i                  = 0;
    $total_line         = 0;
    $shipping_recipient = dokan_get_option( 'shipping_fee_recipient', 'dokan_selling', 'seller' );
    $tax_recipient      = dokan_get_option( 'tax_fee_recipient', 'dokan_selling', 'seller' );

    foreach ( $order->get_items() as $item_id => $item ) {
        $refund_t                      += $order->get_total_refunded_for_item( $item_id );
        $commissions[ $i ]['total_line'] = $item->get_total() - $order->get_total_refunded_for_item( $item_id );
        $commissions[ $i ]['fee_type']   = dokan_get_commission_type( $seller_id, $item['product_id'] );
        $commissions[ $i ]['admin_fee']  = ( 'percentage' == $commissions[ $i ]['fee_type'] ) ? 100 - dokan_get_seller_percentage( $seller_id, $item['product_id'] ) : dokan_get_seller_percentage( $seller_id, $item['product_id'] );
        $total_line                    += $commissions[ $i ]['total_line'];

        $i++;
    }

    $refund_t += $order->get_total_tax_refunded() + $order->get_total_shipping_refunded();
    $refund_ut = $order->get_total_refunded() - $refund_t;

    if ( $total_line ) {
        foreach ( $commissions as $commission ) {
            $commission['ut_amount'] = $refund_ut * ( $commission['total_line'] / $total_line );

            if ( 'percentage' == $commission['fee_type'] ) {
                $admin_commission += ( $commission['total_line'] + $commission['ut_amount'] ) * $commission['admin_fee'] / 100;
            } else {
                $admin_commission += $commission['admin_fee'];
            }
        }
    }

    if ( 'admin' == $shipping_recipient ) {
        $admin_commission += $order->get_total_shipping() - $order->get_total_shipping_refunded();
    }

    if ( 'admin' == $tax_recipient ) {
        $admin_commission += $order->get_total_tax() - $order->get_total_tax_refunded();
    }

    return apply_filters( 'dokan_order_admin_commission', $admin_commission, $order );
}

/**
 * Get Customer Order IDs by Seller
 *
 * @since 2.6.6
 *
 * @param int $customer_id
 *
 * @param int $seller_id
 *
 * @return array|null on failure
 */
function dokan_get_customer_orders_by_seller( $customer_id, $seller_id ) {
    if ( ! $customer_id || ! $seller_id ) {
        return null;
    }

    $args = [
        'customer_id'   => $customer_id,
        'post_type'     => 'shop_order',
        'meta_key'      => '_dokan_vendor_id',
        'meta_value'    => $seller_id,
        'post_status'   => array_keys( wc_get_order_statuses() ),
        'return'        => 'ids',
        'numberposts'   => -1,
    ];

    $orders = wc_get_orders( apply_filters( 'dokan_get_customer_orders_by_seller', $args ) );

    return $orders ? $orders : null;
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
        'dokan_csv_export_headers', array(
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
        )
    );
}

/**
 * Export orders to a CSV file
 *
 * @since 2.8.6
 *
 * @param  array $orders
 * @param  string $file     A file name to write to
 *
 * @return void
 */
function dokan_order_csv_export( $orders, $file = null ) {
    $headers  = dokan_order_csv_headers();
    $statuses = wc_get_order_statuses();

    $resource = ( $file == null ) ? 'php://output' : $file;
    $output   = fopen( $resource, 'w' );

    fputcsv( $output, $headers );

    foreach ( $orders as $order ) {
        $line      = array();
        $the_order = dokan()->order->get( $order->order_id );

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
                    $line[ $row_key ] = $the_order->get_total_shipping();
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
                    $line[ $row_key ] = $statuses[ 'wc-' . dokan_get_prop( $the_order, 'status' ) ];
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
                    $line[ $row_key ] = $the_order->get_formatted_billing_full_name();
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

    fclose( $output );
}

/**
 * Dokan get seller id by order id
 *
 * @param  int order_id
 *
 * @return int
 */
function dokan_get_seller_id_by_order_id( $id ) {
    wc_deprecated_function( 'dokan_get_seller_id_by_order_id', '2.9.10', 'dokan_get_seller_id_by_order' );
    return dokan_get_seller_id_by_order( $id );
}

/**
 * Check if an order with same id is exists in database
 *
 * @param  int order_id
 *
 * @return boolean
 */
function dokan_is_order_already_exists( $id ) {
    global $wpdb;

    if ( ! $id || ! is_numeric( $id ) ) {
        return false;
    }

    $order_id = $wpdb->get_var( $wpdb->prepare( "SELECT order_id FROM {$wpdb->prefix}dokan_orders WHERE order_id=%d", $id ) );

    return $order_id ? true : false;
}
