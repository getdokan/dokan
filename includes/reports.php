<?php

if ( ! function_exists( 'dokan_get_order_report_data' ) ) :
/**
 * Generate SQL query and fetch the report data based on the arguments passed
 *
 * This function was cloned from WC_Admin_Report class.
 *
 * @since 1.0
 *
 * @global WPDB $wpdb
 * @global WP_User $current_user
 * @param array $args
 * @param string $start_date
 * @param string $end_date
 * @return obj
 */
function dokan_get_order_report_data( $args = array(), $start_date, $end_date ) {
    global $wpdb;

    $current_user = dokan_get_current_user_id();

    $defaults = array(
        'data'         => array(),
        'where'        => array(),
        'where_meta'   => array(),
        'query_type'   => 'get_row',
        'group_by'     => '',
        'order_by'     => '',
        'limit'        => '',
        'filter_range' => false,
        'nocache'      => false,
        'debug'        => false
    );

    $args = wp_parse_args( $args, $defaults );

    extract( $args );

    if ( empty( $data ) )
        return false;

    $select = array();

    foreach ( $data as $key => $value ) {
        $distinct = '';

        if ( isset( $value['distinct'] ) )
            $distinct = 'DISTINCT';

        if ( $value['type'] == 'meta' )
            $get_key = "meta_{$key}.meta_value";
        elseif( $value['type'] == 'post_data' )
            $get_key = "posts.{$key}";
        elseif( $value['type'] == 'order_item_meta' )
            $get_key = "order_item_meta_{$key}.meta_value";
        elseif( $value['type'] == 'order_item' )
            $get_key = "order_items.{$key}";

        if ( $value['function'] )
            $get = "{$value['function']}({$distinct} {$get_key})";
        else
            $get = "{$distinct} {$get_key}";

        $select[] = "{$get} as {$value['name']}";
    }

    $query['select'] = "SELECT " . implode( ',', $select );
    $query['from']   = "FROM {$wpdb->posts} AS posts";

    // Joins
    $joins         = array();
    $joins['do']  = "LEFT JOIN {$wpdb->prefix}dokan_orders AS do ON posts.ID = do.order_id";

    foreach ( $data as $key => $value ) {
        if ( $value['type'] == 'meta' ) {

            $joins["meta_{$key}"] = "LEFT JOIN {$wpdb->postmeta} AS meta_{$key} ON posts.ID = meta_{$key}.post_id";

        } elseif ( $value['type'] == 'order_item_meta' ) {

            $joins["order_items"] = "LEFT JOIN {$wpdb->prefix}woocommerce_order_items AS order_items ON posts.ID = order_items.order_id";
            $joins["order_item_meta_{$key}"] = "LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta AS order_item_meta_{$key} ON order_items.order_item_id = order_item_meta_{$key}.order_item_id";

        } elseif ( $value['type'] == 'order_item' ) {

            $joins["order_items"] = "LEFT JOIN {$wpdb->prefix}woocommerce_order_items AS order_items ON posts.ID = order_id";

        }
    }

    if ( ! empty( $where_meta ) ) {
        foreach ( $where_meta as $value ) {
            if ( ! is_array( $value ) )
                continue;

            $key = is_array( $value['meta_key'] ) ? $value['meta_key'][0] : $value['meta_key'];

            if ( isset( $value['type'] ) && $value['type'] == 'order_item_meta' ) {

                $joins["order_items"] = "LEFT JOIN {$wpdb->prefix}woocommerce_order_items AS order_items ON posts.ID = order_id";
                $joins["order_item_meta_{$key}"] = "LEFT JOIN {$wpdb->prefix}woocommerce_order_itemmeta AS order_item_meta_{$key} ON order_items.order_item_id = order_item_meta_{$key}.order_item_id";

            } else {
                // If we have a where clause for meta, join the postmeta table
                $joins["meta_{$key}"] = "LEFT JOIN {$wpdb->postmeta} AS meta_{$key} ON posts.ID = meta_{$key}.post_id";
            }
        }
    }

    $query['join'] = implode( ' ', $joins );

    $query['where']  = "
        WHERE   posts.post_type     = 'shop_order'
        AND     posts.post_status   != 'trash'
        AND     do.seller_id = {$current_user}
        AND     do.order_status IN ('" . implode( "','", apply_filters( 'woocommerce_reports_order_statuses', array( 'wc-completed', 'wc-processing', 'wc-on-hold' ) ) ) . "')
        ";

    if ( $filter_range ) {
        $query['where'] .= "
            AND     DATE(post_date) >= '" . $start_date . "'
            AND     DATE(post_date) <= '" . $end_date . "'
        ";
    }

    foreach ( $data as $key => $value ) {
        if ( $value['type'] == 'meta' ) {

            $query['where'] .= " AND meta_{$key}.meta_key = '{$key}'";

        } elseif ( $value['type'] == 'order_item_meta' ) {

            $query['where'] .= " AND order_items.order_item_type = '{$value['order_item_type']}'";
            $query['where'] .= " AND order_item_meta_{$key}.meta_key = '{$key}'";

        }
    }

    if ( ! empty( $where_meta ) ) {
        $relation = isset( $where_meta['relation'] ) ? $where_meta['relation'] : 'AND';

        $query['where'] .= " AND (";

        foreach ( $where_meta as $index => $value ) {
            if ( ! is_array( $value ) )
                continue;

            $key = is_array( $value['meta_key'] ) ? $value['meta_key'][0] : $value['meta_key'];

            if ( strtolower( $value['operator'] ) == 'in' ) {
                if ( is_array( $value['meta_value'] ) )
                    $value['meta_value'] = implode( "','", $value['meta_value'] );
                if ( ! empty( $value['meta_value'] ) )
                    $where_value = "IN ('{$value['meta_value']}')";
            } else {
                $where_value = "{$value['operator']} '{$value['meta_value']}'";
            }

            if ( ! empty( $where_value ) ) {
                if ( $index > 0 )
                    $query['where'] .= ' ' . $relation;

                if ( isset( $value['type'] ) && $value['type'] == 'order_item_meta' ) {
                    if ( is_array( $value['meta_key'] ) )
                        $query['where'] .= " ( order_item_meta_{$key}.meta_key   IN ('" . implode( "','", $value['meta_key'] ) . "')";
                    else
                        $query['where'] .= " ( order_item_meta_{$key}.meta_key   = '{$value['meta_key']}'";

                    $query['where'] .= " AND order_item_meta_{$key}.meta_value {$where_value} )";
                } else {
                    if ( is_array( $value['meta_key'] ) )
                        $query['where'] .= " ( meta_{$key}.meta_key   IN ('" . implode( "','", $value['meta_key'] ) . "')";
                    else
                        $query['where'] .= " ( meta_{$key}.meta_key   = '{$value['meta_key']}'";

                    $query['where'] .= " AND meta_{$key}.meta_value {$where_value} )";
                }
            }
        }

        $query['where'] .= ")";
    }

    if ( ! empty( $where ) ) {
        foreach ( $where as $value ) {
            if ( strtolower( $value['operator'] ) == 'in' ) {
                if ( is_array( $value['value'] ) )
                    $value['value'] = implode( "','", $value['value'] );
                if ( ! empty( $value['value'] ) )
                    $where_value = "IN ('{$value['value']}')";
            } else {
                $where_value = "{$value['operator']} '{$value['value']}'";
            }

            if ( ! empty( $where_value ) )
                $query['where'] .= " AND {$value['key']} {$where_value}";
        }
    }

    if ( $group_by ) {
        $query['group_by'] = "GROUP BY {$group_by}";
    }

    if ( $order_by ) {
        $query['order_by'] = "ORDER BY {$order_by}";
    }

    if ( $limit ) {
        $query['limit'] = "LIMIT {$limit}";
    }

    $query      = apply_filters( 'dokan_reports_get_order_report_query', $query );
    $query      = implode( ' ', $query );
    $query_hash = md5( $query_type . $query );

    if ( $debug ) {
        error_log( '<pre>%s</pre>', print_r( $query, true ) );
    }

    if ( $debug || $nocache || ( false === ( $result = get_transient( 'dokan_wc_report_' . $query_hash ) ) ) ) {
        $result = apply_filters( 'dokan_reports_get_order_report_data', $wpdb->$query_type( $query ), $data );

        if ( $filter_range ) {
            if ( $end_date == date('Y-m-d', current_time( 'timestamp' ) ) ) {
                $expiration = 60 * 60 * 1; // 1 hour
            } else {
                $expiration = 60 * 60 * 24; // 24 hour
            }
        } else {
            $expiration = 60 * 60 * 24; // 24 hour
        }

        set_transient( 'dokan_wc_report_' . $query_hash, $result, $expiration );
    }

    return $result;
}

endif;


if ( ! function_exists( 'dokan_dashboard_sales_overview' ) ) :

/**
 * Generate seller dashboard overview chart
 *
 * @since 1.0
 * @return void
 */
function dokan_dashboard_sales_overview() {
    $start_date = date( 'Y-m-01', current_time('timestamp') );
    $end_date   = date( 'Y-m-d', strtotime( 'midnight', current_time( 'timestamp' ) ) );

    dokan_sales_overview_chart_data( $start_date, $end_date, 'day' );
}

endif;


if ( ! function_exists( 'dokan_sales_overview_chart_data' ) ) :

/**
 * Prepares chart data for sales overview
 *
 * @since 1.0
 *
 * @global type $wp_locale
 * @param type $start_date
 * @param type $end_date
 * @param type $group_by
 */
function dokan_sales_overview_chart_data( $start_date, $end_date, $group_by ) {
    global $wp_locale;

    $start_date_to_time = strtotime( $start_date );
    $end_date_to_time   = strtotime( $end_date );

    if ( $group_by == 'day' ) {
        $group_by_query       = 'YEAR(post_date), MONTH(post_date), DAY(post_date)';
        $chart_interval       = ceil( max( 0, ( $end_date_to_time - $start_date_to_time ) / ( 60 * 60 * 24 ) ) );
        $barwidth             = 60 * 60 * 24 * 1000;
    } else {
        $group_by_query = 'YEAR(post_date), MONTH(post_date)';
        $chart_interval = 0;
        $min_date             = $start_date_to_time;

        while ( ( $min_date   = strtotime( "+1 MONTH", $min_date ) ) <= $end_date_to_time ) {
            $chart_interval ++;
        }

        $barwidth             = 60 * 60 * 24 * 7 * 4 * 1000;
    }

    // Get orders and dates in range - we want the SUM of order totals, COUNT of order items, COUNT of orders, and the date
    $orders = dokan_get_order_report_data( array(
        'data' => array(
            '_order_total' => array(
                'type'     => 'meta',
                'function' => 'SUM',
                'name'     => 'total_sales'
            ),
            'ID' => array(
                'type'     => 'post_data',
                'function' => 'COUNT',
                'name'     => 'total_orders',
                'distinct' => true,
            ),
            'post_date' => array(
                'type'     => 'post_data',
                'function' => '',
                'name'     => 'post_date'
            ),
        ),
        'group_by'     => $group_by_query,
        'order_by'     => 'post_date ASC',
        'query_type'   => 'get_results',
        'filter_range' => true,
        'debug' => false
    ), $start_date, $end_date );

    // Prepare data for report
    $order_counts      = dokan_prepare_chart_data( $orders, 'post_date', 'total_orders', $chart_interval, $start_date_to_time, $group_by );
    $order_amounts     = dokan_prepare_chart_data( $orders, 'post_date', 'total_sales', $chart_interval, $start_date_to_time, $group_by );

    // Encode in json format
    $chart_data = array(
        'order_counts'      => array_values( $order_counts ),
        'order_amounts'     => array_values( $order_amounts )
    );

    $chart_colours = array(
        'order_counts'  => '#3498db',
        'order_amounts'   => '#1abc9c'
    );

    ?>
    <div class="chart-container">
        <div class="chart-placeholder main" style="width: 100%; height: 350px;"></div>
    </div>

    <script type="text/javascript">
        jQuery(function($) {

            var order_data = jQuery.parseJSON( '<?php echo wp_json_encode($chart_data); ?>' );
            var isRtl = '<?php echo is_rtl() ? "1" : "0"; ?>';
            var series = [
                {
                    label: "<?php echo esc_js( __( 'Sales total', 'dokan-lite' ) ) ?>",
                    data: order_data.order_amounts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 1, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 2, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr( get_woocommerce_currency_symbol()); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ) ?>",
                    data: order_data.order_counts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 2, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 3, fill: false },
                    shadowSize: 0,
                    append_tooltip: " <?php echo esc_html__( 'Sales', 'dokan-lite' ); ?>"
                },
            ];

            var main_chart = jQuery.plot(
                jQuery('.chart-placeholder.main'),
                series,
                {
                    legend: {
                        show: true,
                        position: 'nw'
                    },
                    series: {
                        lines: { show: true, lineWidth: 4, fill: false },
                        points: { show: true }
                    },
                    grid: {
                        borderColor: '#eee',
                        color: '#aaa',
                        borderWidth: 1,
                        hoverable: true,
                        show: true,
                        aboveData: false,
                    },
                    xaxis: {
                        color: '#aaa',
                        position: "bottom",
                        tickColor: 'transparent',
                        mode: "time",
                        timeformat: "<?php if ( $group_by == 'day' ) echo '%d %b'; else echo '%b'; ?>",
                        monthNames: <?php echo json_encode( array_values( $wp_locale->month_abbrev ) ) ?>,
                        tickLength: 1,
                        minTickSize: [1, "<?php echo esc_attr( $group_by ); ?>"],
                        font: {
                            color: "#aaa"
                        },
                        transform: function (v) { return ( isRtl == '1' ) ? -v : v; },
                        inverseTransform: function (v) { return ( isRtl == '1' ) ? -v : v; }
                    },
                    yaxes: [
                        {
                            position: ( isRtl == '1' ) ? "right" : "left",
                            min: 0,
                            minTickSize: 1,
                            tickDecimals: 0,
                            color: '#d4d9dc',
                            font: { color: "#aaa" }
                        },
                        {
                            position: ( isRtl == '1' ) ? "right" : "left",
                            min: 0,
                            tickDecimals: 2,
                            alignTicksWithAxis: 1,
                            color: 'transparent',
                            font: { color: "#aaa" }
                        }
                    ],
                    colors: ["<?php echo esc_attr($chart_colours['order_counts']); ?>", "<?php echo esc_attr($chart_colours['order_amounts']); ?>"]
                }
            );

            jQuery('.chart-placeholder').resize();
        });

    </script>
    <?php
}

endif;
