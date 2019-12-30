<?php

namespace WeDevs\Dokan\REST;

use DateTime;
use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTAdminController;

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
class AdminReportController extends DokanRESTAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'report';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base . '/summary', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_summary' ),
                'permission_callback' => array( $this, 'check_permission' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/overview', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_overview' ),
                'permission_callback' => array( $this, 'check_permission' ),
            ),
        ) );
    }

    /**
     * Get at a glance
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_summary( $request ) {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $params = $request->get_params();

        $from      = isset( $params['from'] ) ? sanitize_text_field( $params['from'] ) : null;
        $to        = isset( $params['to'] ) ? sanitize_text_field( $params['to'] ) : null;
        $seller_id = isset( $params['seller_id'] ) ? (int) $params['seller_id'] : 0;

        $sales = dokan_get_sales_count( $from, $to, $seller_id );

        $data = array(
            'products' => dokan_get_product_count( $from, $to, $seller_id ),
            'withdraw' => dokan_get_withdraw_count(),
            'vendors'  => dokan_get_seller_count( $from, $to ),
            'sales'    => $sales['sales'],
            'orders'   => $sales['orders'],
            'earning'  => $sales['earning']
        );

        return rest_ensure_response( $data );
    }

    /**
     * Get overview data
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_overview( $request ) {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $params = $request->get_params();

        $from      = isset( $params['from'] ) ? sanitize_text_field( $params['from'] ) : 'first day of this month';
        $to        = isset( $params['to'] ) ? sanitize_text_field( $params['to'] ) : '';
        $seller_id = isset( $params['seller_id'] ) ? (int) $params['seller_id'] : '';

        $start_date    = new DateTime( $from );
        $end_date      = new DateTime( $to );

        $date_modifier = $start_date->diff( $end_date )->m >= 11 ? '+1 month' : '+1 day';
        $group_by      = $date_modifier === '+1 month' ? 'month' : 'day';
        $data          = dokan_admin_report_data( $group_by, '', $start_date->format( 'Y-m-d' ), $end_date->format( 'Y-m-d' ), $seller_id );

        $labels          = array();
        $order_counts    = array();
        $order_amounts   = array();
        $order_commision = array();

        // initialize data
        for ( $i = $start_date; $i <= $end_date; $i->modify( $date_modifier ) ){
            $date                     = $i->format( 'Y-m-d' );
            $labels[ $date ]          = $date;
            $order_counts[ $date ]    = 0;
            $order_amounts[ $date ]   = 0;
            $order_commision[ $date ] = 0;
        }

        // fillup real datea
        foreach ( $data as $row ) {
            if ( 'month' == $group_by ) {
                $date = new DateTime( $row->order_date );
                $date->modify( 'first day of this month' );
                $date = $date->format( 'Y-m-d' );
            } else {
                $date = date( 'Y-m-d', strtotime( $row->order_date ) );
            }

            $order_counts[ $date ]    = (int) $row->total_orders;
            $order_amounts[ $date ]   = $row->order_total;
            $order_commision[ $date ] = $row->earning;
        }

        $response = array(
            'labels'   => array_values( $labels ),
            'datasets' => array(
                array(
                    'label'           => __( 'Total Sales', 'dokan-lite' ),
                    'borderColor'     => '#3498db',
                    'fill'            => false,
                    'data'            => array_values( $order_amounts ),
                    'tooltipLabel'    => __( 'Total', 'dokan-lite' ),
                    'tooltipPrefix'   => html_entity_decode( get_woocommerce_currency_symbol() )
                ),
                array(
                    'label'           => __( 'Number of orders', 'dokan-lite' ),
                    'borderColor'     => '#1abc9c',
                    'fill'            => false,
                    'data'            => array_values( $order_counts ),
                    'tooltipLabel'    => __( 'Orders', 'dokan-lite' ),
                ),
                array(
                    'label'           => __( 'Commision', 'dokan-lite' ),
                    'borderColor'     => '#73a724',
                    'fill'            => false,
                    'data'            => array_values( $order_commision ),
                    'tooltipPrefix'   => html_entity_decode( get_woocommerce_currency_symbol() )
                ),
            )
        );

        return rest_ensure_response( $response );
    }
}
