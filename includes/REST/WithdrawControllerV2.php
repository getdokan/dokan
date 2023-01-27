<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WP_Error;
use WP_REST_Response;

class WithdrawControllerV2 extends WithdrawController {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Register all routes releated with stores.
     *
     * @since 3.7.10
     *
     * @return void
     */
    public function register_routes() {
        // Get withdraw settings for vendor.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/settings', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_withdraw_settings' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
            ]
        );

        // Returns withdraw summary.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/summary', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_withdraw_summary' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Returns withdraw settings for vendors.
     *
     * @since 3.7.10
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_withdraw_settings() {
        $payment_methods         = array_intersect( dokan_get_seller_active_withdraw_methods(), dokan_withdraw_get_active_methods() );
        $default_withdraw_method = dokan_withdraw_get_default_method( dokan_get_current_user_id() );

        $payment_methods = array_map(
            function( $payment_method ) {
                return [
                    'label' => dokan_withdraw_get_method_title( $payment_method ),
                    'value' => $payment_method,
                ];
            }, $payment_methods
        );

        return rest_ensure_response(
            [
                'withdraw_method' => $default_withdraw_method,
                'payment_methods' => $payment_methods,
            ]
        );
    }

    /**
     * Returns withdraw summary.
     *
     * @since 3.7.10
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_withdraw_summary() {
        $summary = dokan()->withdraw->get_user_withdraw_summary();
        return rest_ensure_response( $summary );
    }
}
