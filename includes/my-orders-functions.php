<?php

/**
 * @Get orders that match an order status
 *
 * @since DOKAN_SINCE
 *
 * @param $customer_orders
 * @param $status
 *
 * @return array
 */
function dokan_filter_orders_by_status( $customer_orders, $status ) {
    $customer_orders_temp = [];

    foreach ( $customer_orders as $customer_order ) {
        $order = wc_get_order( $customer_order );

        if ( ! ( $order instanceof WC_Order ) ) {
            continue;
        }

        if ( empty( $status ) ) {
            $customer_orders_temp[] = $order;
            continue;
        }

        if ( 'wc-' . $order->get_status() === $status ) {
            $customer_orders_temp[] = $order;
        }
    }

    return $customer_orders_temp;
}

/**
 * Get WC orders after filtration
 *
 * @since DOKAN_SINCE
 *
 * @param array $args
 *
 * @return array
 */
function dokan_get_filtered_orders( $args ) {
    global $wpdb;

    $defaults = [
        'start_date' => '',
        'end_date'   => '',
        'min_price'  => '',
        'max_price'  => '',
        'vendor_id'  => '',
        'sort_order' => '',
        'limit'      => '',
        'page'       => '',
    ];

    $args = wp_parse_args( $args, $defaults );

    $min_price = empty( $args['min_price'] ) ? 0 : $args['min_price'];
    $max_price = empty( $args['min_price'] ) ? 1000000000 : $args['max_price'];

    $vendor_id = $args['vendor_id'];

    $date_query = [];

    if ( ! empty( $args['start_date'] ) ) {
        $date_query['after']     = $args['start_date'];
        $date_query['inclusive'] = true;
    }

    if ( ! empty( $args['end_date'] ) ) {
        $date_query['before']    = $args['end_date'];
        $date_query['inclusive'] = true;
    }

    $args = [
        'post_type'   => 'shop_order',
        'post_status' => 'wc-publish',
        'meta_query'  => [
            'relation' => 'AND',
            [
                'key'     => '_customer_user',
                'value'   => get_current_user_id(),
                'compage' => '=',
            ],
            [
                'key'     => '_order_total',
                'value'   => [ $min_price, $max_price ],
                'type'    => 'numeric',
                'compare' => 'BETWEEN',
            ],
        ],
        'date_query'  => [ $date_query ],
    ];

    if ( ! empty( $args['limit'] ) && ! empty( $args['page'] ) ) {
        $args['numberposts'] = $args['limit'];
        $args['offset']      = $args['limit'] * ( $args['page'] - 1 );
    }

    if ( empty( $args['sort_order'] ) || ! in_array( $args['sort_order'], [ 'ASC', 'DESC' ], true ) ) {
        $args['sort_order'] = 'DESC';
    }

    $args['orderby'] = 'ID';
    $args['order']   = $args['sort_order'];

    if ( ! empty( $vendor_id ) ) {
        $order_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT order_id FROM {$wpdb->prefix}dokan_orders WHERE seller_id = %d",
                $vendor_id
            )
        );

        if ( empty( $order_ids ) ) {
            $order_ids = [ 0 ];
        }

        $args['post__in'] = $order_ids;
    }

    return get_posts(
        apply_filters(
            'woocommerce_my_account_my_orders_query',
            $args
        )
    );
}
