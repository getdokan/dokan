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
function dokan_get_filtered_orders( $args_parameter ) {
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

    $args_parameter = wp_parse_args( $args_parameter, $defaults );

    $min_price = empty( $args_parameter['min_price'] ) ? 0 : $args_parameter['min_price'];
    $max_price = empty( $args_parameter['max_price'] ) ? 1000000000 : $args_parameter['max_price'];

    $vendor_id = $args_parameter['vendor_id'];

    $date_query = [];

    if ( ! empty( $args_parameter['start_date'] ) ) {
        $date_query['after']     = $args_parameter['start_date'];
        $date_query['inclusive'] = true;
    }

    if ( ! empty( $args_parameter['end_date'] ) ) {
        $y_m_d = explode( '-', $args_parameter['end_date'] );

        $date_query['before']    = [
            'year'   => $y_m_d[0],
            'month'  => $y_m_d[1],
            'day'    => $y_m_d[2],
            'hour'   => 23,
            'minute' => 59,
            'second' => 59,
        ];

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
                'compare' => '=',
            ],
            [
                'key'     => '_order_total',
                'value'   => [ $min_price, $max_price ],
                'type'    => 'DECIMAL(10, 2)',
                'compare' => 'BETWEEN',
            ],
        ],
        'date_query'  => [ $date_query ],
    ];

    if ( ! empty( $args_parameter['limit'] ) && ! empty( $args_parameter['page'] ) ) {
        $args['numberposts'] = $args_parameter['limit'];
        $args['offset']      = $args_parameter['limit'] * ( $args_parameter['page'] - 1 );
    } else {
        $args['numberposts'] = -1;
        $args['offset']      = 0;
    }

    if ( empty( $args_parameter['sort_order'] ) || ! in_array( $args_parameter['sort_order'], [ 'ASC', 'DESC' ], true ) ) {
        $args_parameter['sort_order'] = 'DESC';
    }

    $args['orderby'] = 'ID';
    $args['order']   = $args_parameter['sort_order'];

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
