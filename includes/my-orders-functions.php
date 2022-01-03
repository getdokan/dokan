<?php

/**
 * @Get orders that match an order status
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param $customer_orders
 * @param $status
 *
 * @return array
 */
function dokan_filter_orders_by_status( $customer_orders, $status ) {
    $customer_orders_temp = [];
    $statuses             = wc_get_order_statuses();

    foreach ( $customer_orders as $customer_order ) {
        $order = new WC_Order( $customer_order );

        if ( empty( $status ) ) {
            $customer_orders_temp[] = $order;
            continue;
        }

        if ( isset( $statuses[ 'wc-' . dokan_get_prop( $order, 'status' ) ] ) && 'wc-' . dokan_get_prop( $order, 'status' ) === $status ) {
            $customer_orders_temp[] = $order;
        }
    }

    return $customer_orders_temp;
}

/**
 * Get WC orders after filteration
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param $start_date
 * @param $end_date
 * @param $limit
 * @param $page
 * @param $min_price
 * @param $max_price
 *
 * @return array
 */
function dokan_get_filtered_orders( $start_date, $end_date, $min_price, $max_price, $limit = '', $page = '' ) {
    $date_query = [];
    if ( ! empty( $start_date ) ) {
        $date_query = [
            'after'     => $start_date,
            'inclusive' => true,
        ];
    }

    if ( ! empty( $end_date ) ) {
        $date_query = [
            'before'    => $end_date,
            'inclusive' => true,
        ];
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
                'value'   => [ empty( $min_price ) ? 0 : $min_price, empty( $max_price ) ? 1000000000 : $max_price ],
                'type'    => 'numeric',
                'compare' => 'BETWEEN',
            ],
        ],
        'date_query'  => [ $date_query ],
    ];

    if ( ! empty( $limit ) && ! empty( $page ) ) {
        $args['numberposts'] = $limit;
        $args['offset']      = $limit * ( $page - 1 );
    }

    $customer_orders = get_posts(
        apply_filters(
            'woocommerce_my_account_my_orders_query',
            $args
        )
    );

    return $customer_orders;
}
