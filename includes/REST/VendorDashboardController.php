<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Vendor;
use WP_REST_Server;

class VendorDashboardController extends \WP_REST_Controller {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'vendor-dashboard';

    /**
     * Vendor dashboard controller constructor
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_dashboard_statistics' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/profile', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_profile_completeness' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/sales', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_sales_reports' ],
                    'args'                => [
                        'from' => [
                            'type'        => 'string',
                            'description' => __( 'From Date', 'dokan-lite' ),
                            'required'    => true,
                        ],
                        'to' => [
                            'type'        => 'string',
                            'description' => __( 'To Date', 'dokan-lite' ),
                            'required'    => true,
                        ],
                    ],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/products', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_products_summary' ],
                    'args'                => [],
                    'permission_callback' => '__return_true',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/orders', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_orders_summary' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
    }

    public function get_dashboard_statistics() {

    }
}
