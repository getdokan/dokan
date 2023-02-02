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
     * @since DOKAN_SINCE
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

        // Returns withdraw disbursement.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/disbursement', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_withdraw_disbursement' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'args'                => $this->get_product_collection_params(),
                    'callback'            => [ $this, 'save_withdraw_disbursement' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Returns withdraw settings for vendors.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_withdraw_summary() {
        $summary = dokan()->withdraw->get_user_withdraw_summary();
        return rest_ensure_response( $summary );
    }

    /**
     * Returns withdraw disbursement data.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_withdraw_disbursement() {
        $withdraw_disbursement['enabled']                  = false;
        $withdraw_disbursement['selected_schedule']        = '';
        $withdraw_disbursement['schedules']                = [];
        $withdraw_disbursement['minimum_amount_list']      = [];
        $withdraw_disbursement['minimum_amount_selected']  = 0;
        $withdraw_disbursement['reserve_balance_list']     = [];
        $withdraw_disbursement['reserve_balance_selected'] = 0;
        $withdraw_disbursement['active_methods']           = [];
        $withdraw_disbursement['default_method']           = '';
        $withdraw_disbursement['method_additional_info']   = [];

        return apply_filters( 'dokan_withdraw_disbursement_data', $withdraw_disbursement );
    }

    /**
     * Undocumented function
     *
     * @since DOKAN_SINCE
     *
     * @param  \WP_REST_Request $requests Request object.
     *
     * @return \WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function save_withdraw_disbursement( $requests ) {
        $data = [
            'schedule' => $requests->get_param('schedule'),
            'minimum'  => $requests->get_param('minimum'),
            'reserve'  => $requests->get_param('reserve'),
            'method'   => $requests->get_param('method'),
        ];

        do_action( 'dokan_rest_save_withdraw_disbursement', $data );

        return rest_ensure_response( array( 'success' => true ) );
    }


    /**
     * Disbursement save API query parameters collections.
     *
     * @since DOKAN_SINCE
     *
     * @return array Query parameters.
     */
    public function get_product_collection_params() {
        $params = parent::get_collection_params();

        $params['schedule'] = array(
            'description'       => __( 'Preferred Payment Schedule', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => true,
        );

        $params['minimum'] = array(
            'description'       => __( 'Only When Balance Is', 'dokan-lite' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => true,
        );

        $params['reserve'] = array(
            'description'       => __( 'Maintain Reserve Balance', 'dokan-lite' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => true,
        );

        $params['method'] = array(
            'description'       => __( 'Preferred Payment Method', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => true,
        );

        return $params;
    }
}
