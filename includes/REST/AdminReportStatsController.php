<?php

namespace WeDevs\Dokan\REST;

use DateTime;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WeDevs\Dokan\Models\AdminReportStats;

/**
 * Admin Report Stats Controller
 *
 * @since SUSPENDED
 *
 * @package dokan
 */
class AdminReportStatsController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'report-stats';

    /**
     * Register all routes related with report stats.
     *
     * @since SUSPENDED
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base . '/summary', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_summary' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_summary_params(),
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/overview', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_overview' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_overview_params(),
                ],
            ]
        );
    }

    /**
     * Get summary data.
     *
     * @since SUSPENDED
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_summary( $request ) {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $from      = $request->get_param( 'from' ) ? sanitize_text_field( $request->get_param( 'from' ) ) : null;
        $to        = $request->get_param( 'to' ) ? sanitize_text_field( $request->get_param( 'to' ) ) : null;
        $seller_id = (int) $request->get_param( 'seller_id' );

        $now = dokan_current_datetime();

        // Current month dates.
        $current_start = $now->format( 'Y-m-01' );
        $current_end   = $now->format( 'Y-m-d' );

        // Last month dates.
        $last_start = $now->modify( 'first day of previous month' )->format( 'Y-m-d' );
        $last_end   = $now->modify( 'last day of previous month' )->format( 'Y-m-d' );

        // Net sales.
        $this_month_sales = AdminReportStats::get_net_sales( $current_start, $current_end, $seller_id );
        $last_month_sales = AdminReportStats::get_net_sales( $last_start, $last_end, $seller_id );

        // Commission.
        $this_month_commission = AdminReportStats::get_commission_earned( $current_start, $current_end, $seller_id );
        $last_month_commission = AdminReportStats::get_commission_earned( $last_start, $last_end, $seller_id );

        // Orders.
        $this_month_orders = AdminReportStats::get_order_count( $current_start, $current_end, $seller_id );
        $last_month_orders = AdminReportStats::get_order_count( $last_start, $last_end, $seller_id );

        $data = [
            'products' => AdminReportStats::get_product_data( $from, $to, $seller_id ),
            'withdraw' => AdminReportStats::get_withdraw_data(),
            'vendors'  => AdminReportStats::get_vendor_data( $from, $to ),
            'sales'    => [
                'this_month' => $this_month_sales,
                'last_month' => $last_month_sales,
            ],
            'orders'   => [
                'this_month' => $this_month_orders,
                'last_month' => $last_month_orders,
            ],
            'earning'  => [
                'this_month' => $this_month_commission,
                'last_month' => $last_month_commission,
            ],
        ];

        return rest_ensure_response( apply_filters( 'dokan_admin_report_stats_summary', $data, $request ) );
    }

    /**
     * Get overview chart data.
     *
     * @since SUSPENDED
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_overview( $request ) {
        $from      = $request->get_param( 'from' ) ? sanitize_text_field( $request->get_param( 'from' ) ) : 'first day of this month';
        $to        = $request->get_param( 'to' ) ? sanitize_text_field( $request->get_param( 'to' ) ) : '';
        $seller_id = (int) $request->get_param( 'seller_id' );

        $start_date    = new DateTime( $from );
        $end_date      = new DateTime( $to );
        $date_modifier = $start_date->diff( $end_date )->m >= 11 ? '+1 month' : '+1 day';
        $group_by      = '+1 month' === $date_modifier ? 'month' : 'day';

        $data = AdminReportStats::get_overview_chart_data(
            $start_date->format( 'Y-m-d' ),
            $end_date->format( 'Y-m-d' ),
            $group_by,
            $seller_id
        );

        $data = apply_filters( 'dokan_admin_report_stats_overview_data', $data, $group_by, $start_date->format( 'Y-m-d' ), $end_date->format( 'Y-m-d' ), $seller_id );

        // Build chart response (same shape as existing for Reports.vue compatibility).
        $labels          = [];
        $order_counts    = [];
        $order_amounts   = [];
        $order_commision = [];

        // Initialize data.
        for ( $i = clone $start_date; $i <= $end_date; $i->modify( $date_modifier ) ) {
            $date                     = $i->format( 'Y-m-d' );
            $labels[ $date ]          = $date;
            $order_counts[ $date ]    = 0;
            $order_amounts[ $date ]   = 0;
            $order_commision[ $date ] = 0;
        }

        // Fill up real data.
        foreach ( $data as $row ) {
            if ( 'month' === $group_by ) {
                $date_obj = new DateTime( $row['date'] );
                $date_obj->modify( 'first day of this month' );
                $date = $date_obj->format( 'Y-m-d' );
            } else {
                $date = $row['date'];
            }

            if ( isset( $labels[ $date ] ) ) {
                $order_counts[ $date ]    = (int) ( $row['total_orders'] ?? 0 );
                $order_amounts[ $date ]   = (float) ( $row['net_sales'] ?? 0 );
                $order_commision[ $date ] = (float) ( $row['commission'] ?? 0 );
            }
        }

        $response = [
            'labels'   => array_values( $labels ),
            'datasets' => [
                [
                    'label'         => __( 'Total Sales', 'dokan-lite' ),
                    'borderColor'   => '#3498db',
                    'fill'          => false,
                    'data'          => array_values( $order_amounts ),
                    'tooltipLabel'  => __( 'Total', 'dokan-lite' ),
                    'tooltipPrefix' => html_entity_decode( get_woocommerce_currency_symbol() ),
                ],
                [
                    'label'        => __( 'Number of orders', 'dokan-lite' ),
                    'borderColor'  => '#1abc9c',
                    'fill'         => false,
                    'data'         => array_values( $order_counts ),
                    'tooltipLabel' => __( 'Orders', 'dokan-lite' ),
                ],
                [
                    'label'         => __( 'Commission', 'dokan-lite' ),
                    'borderColor'   => '#73a724',
                    'fill'          => false,
                    'data'          => array_values( $order_commision ),
                    'tooltipPrefix' => html_entity_decode( get_woocommerce_currency_symbol() ),
                ],
            ],
        ];

        return rest_ensure_response( apply_filters( 'dokan_admin_report_stats_overview_response', $response, $request ) );
    }

    /**
     * Get the query params for the summary endpoint.
     *
     * @since SUSPENDED
     *
     * @return array
     */
    public function get_summary_params() {
        return [
            'from' => [
                'description'       => __( 'Start date for the report.', 'dokan-lite' ),
                'type'              => 'string',
                'format'            => 'date',
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'to' => [
                'description'       => __( 'End date for the report.', 'dokan-lite' ),
                'type'              => 'string',
                'format'            => 'date',
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'seller_id' => [
                'description'       => __( 'Seller ID to filter by.', 'dokan-lite' ),
                'type'              => 'integer',
                'default'           => 0,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'absint',
            ],
        ];
    }

    /**
     * Get the query params for the overview endpoint.
     *
     * @since SUSPENDED
     *
     * @return array
     */
    public function get_overview_params() {
        return [
            'from' => [
                'description'       => __( 'Start date for the overview.', 'dokan-lite' ),
                'type'              => 'string',
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'to' => [
                'description'       => __( 'End date for the overview.', 'dokan-lite' ),
                'type'              => 'string',
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'seller_id' => [
                'description'       => __( 'Seller ID to filter by.', 'dokan-lite' ),
                'type'              => 'integer',
                'default'           => 0,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'absint',
            ],
        ];
    }
}
