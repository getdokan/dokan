<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Request;
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

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/make-default-method', [
                'methods'  => WP_REST_Server::CREATABLE,
                'callback' => [ $this, 'handle_make_default_method' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
                'args'     => [
                    'method' => [
                        'description' => __( 'Withdraw method key', 'dokan-lite' ),
                        'type'        => 'string',
                        'required'    => true,
                    ],
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
        $active_methods          = dokan_withdraw_get_withdrawable_active_methods();
        $payment_methods         = array_intersect( dokan_get_seller_active_withdraw_methods(), dokan_withdraw_get_active_methods() );
        $default_withdraw_method = dokan_withdraw_get_default_method( dokan_get_current_user_id() );
        $setup_url               = dokan_get_navigation_url( 'settings/payment' );

        $payment_methods = array_map(
            function ( $payment_method ) {
                return [
                    'label' => dokan_withdraw_get_method_title( $payment_method ),
                    'value' => $payment_method,
                ];
            }, $payment_methods
        );

        $active_methods = array_map(
            function ( $active_method ) {
                return [
                    'label' => dokan_withdraw_get_method_title( $active_method ),
                    'value' => $active_method,
                    'icon'  => dokan_withdraw_get_method_icon( $active_method ),
                    'info'  => dokan_withdraw_get_method_additional_info( $active_method ),
                    'has_information'  => in_array( $active_method, dokan_get_seller_active_withdraw_methods(), true ),
                ];
            }, $active_methods
        );

        return rest_ensure_response(
            [
                'withdraw_method' => $default_withdraw_method,
                'payment_methods' => array_values( $payment_methods ),
                'active_methods'  => $active_methods,
                'setup_url'       => $setup_url,
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

    /**`
     * Make a withdraw method default for a vendor.
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response|WP_Error
     */
    public function handle_make_default_method( WP_REST_Request $request ) {
        $method = $request->get_param( 'method' );

        if ( empty( $method ) ) {
            return new WP_Error( 'no_method', __( 'Please provide Withdraw method.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( ! in_array( $method, dokan_withdraw_get_active_methods(), true ) ) {
            return new WP_Error( 'method_not_active', __( 'Method not active.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $user_id = dokan_get_current_user_id();
        update_user_meta( $user_id, 'dokan_withdraw_default_method', $method );

        return new WP_REST_Response( __( 'Default method update successful.', 'dokan-lite' ), 200 );
    }
}
