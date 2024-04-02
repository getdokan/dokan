<?php

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Utilities\OrderUtil;

if ( ! function_exists( 'dokan_dashboard_sales_overview' ) ) :

	/**
	 * Generate seller dashboard overview chart
	 *
	 * @since 1.0
	 * @return void
	 */
	function dokan_dashboard_sales_overview() {
        $now        = dokan_current_datetime();
        $start_date = $now->modify( 'first day of this month' )->modify( 'today' )->format( 'Y-m-d' );
        $end_date   = $now->modify( 'today' )->format( 'Y-m-d' );

		dokan_sales_overview_chart_data( $start_date, $end_date, 'day' );
	}

endif;


if ( ! function_exists( 'dokan_sales_overview_chart_data' ) ) :

	/**
	 * Prepares chart data for sales overview
	 *
	 * @since 1.0
	 *
	 * @param string $start_date
	 * @param string $end_date
	 * @param string $group_by
     *
     * @return void
	 */
	function dokan_sales_overview_chart_data( $start_date, $end_date, $group_by ) {
		global $wp_locale;

        $now                = dokan_current_datetime();
		$start_date_to_time = $now->modify( $start_date )->getTimestamp();
		$end_date_to_time   = $now->modify( $end_date )->getTimestamp();
        $chart_interval     = dokan_get_interval_between_dates( $start_date_to_time, $end_date_to_time, $group_by );

		if ( $group_by === 'day' ) {
			$group_by_query       = 'YEAR(post_date), MONTH(post_date), DAY(post_date)';
			$barwidth             = 60 * 60 * 24 * 1000;
		} else {
			$group_by_query = 'YEAR(post_date), MONTH(post_date)';
			$barwidth = 60 * 60 * 24 * 7 * 4 * 1000;
		}

		// Get orders and dates in range - we want the SUM of order totals, COUNT of order items, COUNT of orders, and the date
        $report = new \WeDevs\Dokan\AdminReport();
        $report->start_date = $start_date;
        $report->end_date = $end_date;

        $is_hpos_enabled = OrderUtil::is_hpos_enabled();
        $date_col        = $is_hpos_enabled ? 'date_created_gmt' : 'post_date';

		$orders = $report->get_order_report_data(
            array(
				'data' => array(
					'_order_total' => array(
						'type'     => 'meta',
						'function' => 'SUM',
						'name'     => 'total_sales',
					),
					'ID' => array(
						'type'     => 'post_data',
						'function' => 'COUNT',
						'name'     => 'total_orders',
						'distinct' => true,
					),
                    $date_col => [ // before it was 'post_date'. we need to update the start and end date to gmt date.
						'type'     => 'post_data',
						'function' => '',
						'name'     => 'post_date',
					],
				),
				'group_by'     => 'post_date',
				'order_by'     => 'post_date ASC',
				'query_type'   => 'get_results',
				'filter_range' => true,
				'debug' => false,
            ), $is_hpos_enabled
        );

		// Prepare data for report
		$order_counts      = dokan_prepare_chart_data( $orders, 'post_date', 'total_orders', $chart_interval, $start_date_to_time, $group_by );
		$order_amounts     = dokan_prepare_chart_data( $orders, 'post_date', 'total_sales', $chart_interval, $start_date_to_time, $group_by );

		// Encode in json format
		$chart_data = array(
			'order_counts'      => array_values( $order_counts ),
			'order_amounts'     => array_values( $order_amounts ),
		);

		$chart_colours = array(
			'order_counts'  => '#3498db',
			'order_amounts'   => '#1abc9c',
		);

		?>
    <div class="chart-container">
        <div class="chart-placeholder main" style="width: 100%; height: 350px;"></div>
    </div>

    <script type="text/javascript">
        jQuery(function($) {

            var order_data = JSON.parse( '<?php echo wp_json_encode( $chart_data ); ?>' );
            var isRtl = '<?php echo is_rtl() ? '1' : '0'; ?>';
            var series = [
                {
                    label: "<?php echo esc_js( __( 'Sales total', 'dokan-lite' ) ); ?>",
                    data: order_data.order_amounts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 1, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 2, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr( get_woocommerce_currency_symbol() ); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ); ?>",
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
                        monthNames: <?php echo json_encode( array_values( $wp_locale->month_abbrev ) ); ?>,
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
                    colors: ["<?php echo esc_attr( $chart_colours['order_counts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_amounts'] ); ?>"]
                }
            );

            jQuery('.chart-placeholder').resize();
        });

    </script>
		<?php
	}

endif;
