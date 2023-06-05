<?php
/**
 * Get help documents for admin
 *
 * @since 2.8
 *
 * @return Object
 */
function dokan_admin_get_help() {
    $help_docs = get_transient( 'dokan_help_docs', '[]' );

    if ( false === $help_docs ) {
        $help_url  = 'https://dokan.co/wp-json/org/help';
        $response  = wp_remote_get( $help_url, array( 'timeout' => 15 ) );
        $help_docs = wp_remote_retrieve_body( $response );

        if ( is_wp_error( $response ) || (int) $response['response']['code'] !== 200 ) {
            $help_docs = '[]';
        }

        set_transient( 'dokan_help_docs', $help_docs, 12 * HOUR_IN_SECONDS );
    }

    $help_docs = json_decode( $help_docs );

    return $help_docs;
}

/**
 * Dokan Get Admin report data
 *
 * @since 2.8.0
 *
 * @param string $group_by
 * @param string $year
 * @param string $start
 * @param string $end
 * @param int $seller_id
 *
 * @return array
 */
function dokan_admin_report_data( $group_by = 'day', $year = '', $start = '', $end = '', $seller_id = 0 ) {
    global $wpdb;

    $now          = dokan_current_datetime();
    $group_by     = apply_filters( 'dokan_report_group_by', $group_by );
    $start_date   = ! empty( $start ) ? sanitize_text_field( $start ) : ''; // WPCS: CSRF ok.
    $end_date     = ! empty( $end ) ? sanitize_text_field( $end ) : ''; // WPCS: CSRF ok.
    $current_year = $now->format( 'Y' );

    if ( empty( $start_date ) ) {
        $start_date = $now->modify( 'first day of this month' )->format( 'Y-m-d' );

        if ( $group_by === 'year' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( empty( $end_date ) ) {
        $end_date = $now->format( 'Y-m-d' );

        if ( $group_by === 'year' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $date_where = '';

    if ( 'day' === $group_by ) {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date), DAY(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
    } else {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
    }

    $left_join    = apply_filters( 'dokan_report_left_join', $date_where );
    $date_where   = apply_filters( 'dokan_report_where', $date_where );
    $seller_where = $seller_id ? "seller_id = {$seller_id}" : 'seller_id != ' . 0;

    $sql = "SELECT
                SUM((do.order_total - do.net_amount)) as earning,
                SUM(do.order_total) as order_total,
                COUNT(DISTINCT p.ID) as total_orders,
                p.post_date as order_date
            FROM {$wpdb->prefix}dokan_orders do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            $left_join
            WHERE
                $seller_where AND
                p.post_status != 'trash' AND
                do.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')
                $date_where
            GROUP BY $group_by_query";

    $data = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL

    return $data;
}

/**
 * Generate report in admin area
 *
 * @global WPDB $wpdb
 * @global object $wp_locale
 *
 * @param string $group_by
 * @param string $year
 * @param string $start
 * @param string $end
 *
 * @return array
 */
function dokan_admin_report( $group_by = 'day', $year = '', $start = '', $end = '' ) {
    global $wp_locale;

    $data = dokan_admin_report_data( $group_by, $year, $start, $end );

    $now          = current_datetime();
    $start_date   = ! empty( $start ) ? sanitize_text_field( $start ) : '';
    $end_date     = ! empty( $start ) ? sanitize_text_field( $end ) : '';
    $current_year = $year ? $year : $now->format( 'Y' );

    if ( ! $start_date ) {
        $start_date = $now->modify( 'first day of this month' )->format( 'Y-m-d' );

        if ( $group_by === 'year' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( ! $end_date ) {
        $end_date = $now->format( 'Y-m-d' );

        if ( $group_by === 'year' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $start_date_to_time = $now->modify( $start_date );
    $end_date_to_time   = $now->modify( $end_date );
    $chart_interval     = dokan_get_interval_between_dates( $start_date_to_time, $end_date_to_time, $group_by );

    if ( $group_by === 'day' ) {
        $barwidth = 60 * 60 * 24 * 1000;
    } else {
        $barwidth = 60 * 60 * 24 * 7 * 4 * 1000;
    }

    // Prepare data for report
    $order_counts    = dokan_prepare_chart_data( $data, 'order_date', 'total_orders', $chart_interval, $start_date_to_time->getTimestamp(), $group_by );
    $order_amounts   = dokan_prepare_chart_data( $data, 'order_date', 'order_total', $chart_interval, $start_date_to_time->getTimestamp(), $group_by );
    $order_commision = dokan_prepare_chart_data( $data, 'order_date', 'earning', $chart_interval, $start_date_to_time->getTimestamp(), $group_by );

    // Encode in json format
    $chart_data = array(
        'order_counts'    => array_values( $order_counts ),
        'order_amounts'   => array_values( $order_amounts ),
        'order_commision' => array_values( $order_commision ),
    );

    $chart_colours = array(
        'order_counts'    => '#3498db',
        'order_amounts'   => '#1abc9c',
        'order_commision' => '#73a724',
    );

    ?>

    <style type="text/css">
        .chart-tooltip {
            position: absolute;
            display: none;
            line-height: 1;
            background: #333;
            color: #fff;
            padding: 3px 5px;
            font-size: 11px;
            border-radius: 3px;
        }
    </style>
    <script type="text/javascript">
        jQuery(function($) {

            $(document).ready( function() {

                var order_data = JSON.parse( '<?php echo wp_json_encode( $chart_data ); ?>' );
                var isRtl = '<?php echo is_rtl() ? '1' : '0'; ?>';
                var series = [
                    {
                        label: "<?php echo esc_js( __( 'Total Sales', 'dokan-lite' ) ); ?>",
                        data: order_data.order_amounts,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        prepend_tooltip: "<?php echo esc_attr__( 'Total: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                    },
                    {
                        label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ); ?>",
                        data: order_data.order_counts,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        append_tooltip: " <?php echo esc_attr__( 'sales', 'dokan-lite' ); ?>"
                    },
                    {
                        label: "<?php echo esc_js( __( 'Commision', 'dokan-lite' ) ); ?>",
                        data: order_data.order_commision,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        prepend_tooltip: "<?php echo esc_attr__( 'Commision: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
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
                            backgroundColor: '#fff',
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
                            timeformat: "<?php echo ( $group_by === 'day' ) ? '%d %b' : '%b'; ?>",
                            monthNames: <?php echo wp_json_encode( array_values( $wp_locale->month_abbrev ) ); ?>,
                            tickLength: 1,
                            minTickSize: [1, "<?php echo ( esc_attr( $group_by ) === 'year' ) ? 'month' : esc_attr( $group_by ); ?>"],
                            font: {
                                color: "#aaa"
                            },
                            transform: function (v) { return ( isRtl === '1' ) ? -v : v; },
                            inverseTransform: function (v) { return ( isRtl === '1' ) ? -v : v; }
                        },
                        yaxes: [
                            {
                                position: ( isRtl === '1' ) ? "right" : "left",
                                min: 0,
                                minTickSize: 1,
                                tickDecimals: 0,
                                color: '#d4d9dc',
                                font: { color: "#aaa" }
                            },
                            {
                                position: ( isRtl === '1' ) ? "right" : "left",
                                min: 0,
                                tickDecimals: 2,
                                alignTicksWithAxis: 1,
                                color: 'transparent',
                                font: { color: "#aaa" }
                            }
                        ],
                        colors: ["<?php echo esc_attr( $chart_colours['order_counts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_amounts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_commision'] ); ?>"]
                    }
                );

                jQuery('.chart-placeholder').resize();


                function showTooltip(x, y, contents) {
                    jQuery('<div class="chart-tooltip">' + contents + '</div>').css({
                        top: y - 16,
                        left: x + 20
                    }).appendTo("body").fadeIn(200);
                }

                var prev_data_index = null;
                var prev_series_index = null;

                jQuery(".chart-placeholder").bind("plothover", function(event, pos, item) {
                    if (item) {
                        if (prev_data_index != item.dataIndex || prev_series_index != item.seriesIndex) {
                            prev_data_index = item.dataIndex;
                            prev_series_index = item.seriesIndex;

                            jQuery(".chart-tooltip").remove();

                            if (item.series.points.show || item.series.enable_tooltip) {

                                var y = item.series.data[item.dataIndex][1];

                                tooltip_content = '';

                                if (item.series.prepend_label)
                                    tooltip_content = tooltip_content + item.series.label + ": ";

                                if (item.series.prepend_tooltip)
                                    tooltip_content = tooltip_content + item.series.prepend_tooltip;

                                tooltip_content = tooltip_content + y;

                                if (item.series.append_tooltip)
                                    tooltip_content = tooltip_content + item.series.append_tooltip;

                                if (item.series.pie.show) {

                                    showTooltip(pos.pageX, pos.pageY, tooltip_content);

                                } else {

                                    showTooltip(item.pageX, item.pageY, tooltip_content);

                                }

                            }
                        }
                    } else {
                        jQuery(".chart-tooltip").remove();
                        prev_data_index = null;
                    }
                });

            });

        });

    </script>
    <?php

    return $data;
}

/**
 * Generate Earning report By seller in admin area
 *
 * @global WPDB $wpdb
 * @global object $wp_locale
 *
 * @param int $chosen_seller_id
 *
 * @return array
 */
function dokan_admin_report_by_seller( $chosen_seller_id = 0 ) {
    global $wpdb, $wp_locale;

    $group_by     = 'day';
    $group_by     = apply_filters( 'dokan_report_group_by', $group_by );
    $now          = dokan_current_datetime();
    $year         = $now->format( 'Y' );
    $start_date   = '';
    $end_date     = '';
    $current_year = $now->format( 'Y' );

    if ( empty( $chosen_seller_id ) ) {
        return [];
    }

    if ( ! empty( $start_date ) ) {
        $start_date = $now->modify( 'first day of this month' )->format( 'Y-m-d' );

        if ( $group_by === 'month' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( ! empty( $end_date ) ) {
        $end_date = $now->format( 'Y-m-d' );

        if ( $group_by === 'month' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $date_where         = '';
    $start_date_to_time = strtotime( $start_date );
    $end_date_to_time   = strtotime( $end_date );
    $chart_interval     = dokan_get_interval_between_dates( $start_date_to_time, $end_date_to_time, $group_by );

    if ( $group_by === 'day' ) {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date), DAY(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
        $barwidth       = 60 * 60 * 24 * 1000;
    } else {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date)';
        $barwidth       = 60 * 60 * 24 * 7 * 4 * 1000;
    }

    $left_join  = apply_filters( 'dokan_report_left_join', $date_where );
    $date_where = apply_filters( 'dokan_report_where', $date_where );

    $sql = "SELECT
                SUM((do.order_total - do.net_amount)) as earning,
                SUM(do.order_total) as order_total,
                COUNT(DISTINCT p.ID) as total_orders,
                p.post_date as order_date
            FROM {$wpdb->prefix}dokan_orders do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            $left_join
            WHERE
                seller_id = $chosen_seller_id AND
                p.post_status != 'trash' AND
                do.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')
                $date_where
            GROUP BY $group_by_query";

    $data = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL

    // Prepare data for report
    $order_counts      = dokan_prepare_chart_data( $data, 'order_date', 'total_orders', $chart_interval, $start_date_to_time, $group_by );
    $order_amounts     = dokan_prepare_chart_data( $data, 'order_date', 'order_total', $chart_interval, $start_date_to_time, $group_by );
    $order_commision   = dokan_prepare_chart_data( $data, 'order_date', 'earning', $chart_interval, $start_date_to_time, $group_by );

    // Encode in json format
    $chart_data = array(
        'order_counts'    => array_values( $order_counts ),
        'order_amounts'   => array_values( $order_amounts ),
        'order_commision' => array_values( $order_commision ),
    );

    $chart_colours = array(
        'order_counts'    => '#3498db',
        'order_amounts'   => '#1abc9c',
        'order_commision' => '#73a724',
    );
    ?>

    <style type="text/css">
        .chart-tooltip {
            position: absolute;
            display: none;
            line-height: 1;
            background: #333;
            color: #fff;
            padding: 3px 5px;
            font-size: 11px;
            border-radius: 3px;
        }
    </style>
    <script type="text/javascript">
        jQuery(function($) {

            var order_data = JSON.parse( '<?php echo wp_json_encode( $chart_data ); ?>' );
            var series = [
                {
                    label: "<?php echo esc_js( __( 'Total Sales', 'dokan-lite' ) ); ?>",
                    data: order_data.order_amounts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr__( 'Total: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ); ?>",
                    data: order_data.order_counts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    append_tooltip: "<?php echo esc_attr__( 'sales', 'dokan-lite' ); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Commision', 'dokan-lite' ) ); ?>",
                    data: order_data.order_commision,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr__( 'Commision: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
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
                        backgroundColor: '#fff',
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
                        timeformat: "<?php echo ( $group_by === 'day' ) ? '%d %b' : '%b'; ?>",
                        monthNames: <?php echo wp_json_encode( array_values( $wp_locale->month_abbrev ) ); ?>,
                        tickLength: 1,
                        minTickSize: [1, "<?php echo esc_attr( $group_by ); ?>"],
                        font: {
                            color: "#aaa"
                        }
                    },
                    yaxes: [
                        {
                            min: 0,
                            minTickSize: 1,
                            tickDecimals: 0,
                            color: '#d4d9dc',
                            font: { color: "#aaa" }
                        },
                        {
                            position: "right",
                            min: 0,
                            tickDecimals: 2,
                            alignTicksWithAxis: 1,
                            color: 'transparent',
                            font: { color: "#aaa" }
                        }
                    ],
                    colors: ["<?php echo esc_attr( $chart_colours['order_counts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_amounts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_commision'] ); ?>"]
                }
            );

            jQuery('.chart-placeholder').resize();


            function showTooltip(x, y, contents) {
                jQuery('<div class="chart-tooltip">' + contents + '</div>').css({
                    top: y - 16,
                    left: x + 20
                }).appendTo("body").fadeIn(200);
            }

            var prev_data_index = null;
            var prev_series_index = null;

            jQuery(".chart-placeholder").bind("plothover", function(event, pos, item) {
                if (item) {
                    if (prev_data_index != item.dataIndex || prev_series_index != item.seriesIndex) {
                        prev_data_index = item.dataIndex;
                        prev_series_index = item.seriesIndex;

                        jQuery(".chart-tooltip").remove();

                        if (item.series.points.show || item.series.enable_tooltip) {

                            var y = item.series.data[item.dataIndex][1];

                            tooltip_content = '';

                            if (item.series.prepend_label)
                                tooltip_content = tooltip_content + item.series.label + ": ";

                            if (item.series.prepend_tooltip)
                                tooltip_content = tooltip_content + item.series.prepend_tooltip;

                            tooltip_content = tooltip_content + y;

                            if (item.series.append_tooltip)
                                tooltip_content = tooltip_content + item.series.append_tooltip;

                            if (item.series.pie.show) {

                                showTooltip(pos.pageX, pos.pageY, tooltip_content);

                            } else {

                                showTooltip(item.pageX, item.pageY, tooltip_content);

                            }

                        }
                    }
                } else {
                    jQuery(".chart-tooltip").remove();
                    prev_data_index = null;
                }
            });
        });

    </script>
    <?php

    return $data;
}
