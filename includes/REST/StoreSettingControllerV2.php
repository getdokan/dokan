<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Settings;
use WeDevs\Dokan\Vendor\Vendor;
use WP_HTTP_Response;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * StoreSettings API Controller
 *
 * @package dokan
 *
 * @author weDevs <info@wedevs.com>
 */
class StoreSettingControllerV2 extends WP_REST_Controller {
    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Route name
     *
     * @var string
     */
    protected $rest_base = 'settings';

    /**
     * @var Settings
     */
    protected $vendor_settings;

    /**
     * Constructor.
     *
     * @return void
     */
    public function __construct() {
        $this->vendor_settings = new Settings();
    }

    /**
     * Register all routes related to settings
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_settings_list' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<group_id>[\w-]+)', [
                'args'   => [
                    'group' => [
                        'description' => __( 'Settings group ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                ],
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_settings_group' ],
					'permission_callback' => [ $this, 'get_settings_permission_callback' ],
				],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'args'                => $this->update_settings_group_args(),
                    'callback'            => [ $this, 'update_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
			]
        );
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<group_id>[\w-]+)/(?P<id>[\w-]+)', [
                'args'   => [
                    'group' => [
                        'description' => __( 'Settings group ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'id' => [
                        'description' => __( 'Settings ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_single_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'args'                => $this->update_single_settings_args(),
                    'callback'            => [ $this, 'update_single_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<group_id>[\w-]+)/(?P<parent_id>[\w-]+)/(?P<id>[\w-]+)', [
                'args'   => [
                    'group' => [
                        'description' => __( 'Settings group ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'parent' => [
                        'description' => __( 'Settings parent ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'id' => [
                        'description' => __( 'Settings ID.', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_single_settings_field' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'args'                => $this->update_single_settings_args(),
                    'callback'            => [ $this, 'update_single_settings_field' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
            ]
        );
    }

    /**
     * Update Store
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function update_settings( $request ) {
        return rest_ensure_response( $this->vendor_settings->save_settings( $request ) );
    }

    /**
     * Update Store
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function update_single_settings( $request ) {
        return rest_ensure_response( $this->vendor_settings->save_single_settings( $request ) );
    }

    /**
     * Update Store single settings field
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function update_single_settings_field( $request ) {
        return rest_ensure_response( $this->vendor_settings->save_single_settings_field( $request ) );
    }

    /**
     * @param $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_settings_list( $request ) {
        return rest_ensure_response( $this->vendor_settings->list_settings() );
    }

    /**
     * @param $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_settings_group( $request ) {
        $group_id = $request->get_param( 'group_id' );
        return rest_ensure_response( $this->vendor_settings->settings_group( $group_id ) );
    }

    /**
     * @param $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_single_settings( $request ) {
        $group_id = $request->get_param( 'group_id' );
        $id       = $request->get_param( 'id' );
        return rest_ensure_response( $this->vendor_settings->single_settings( $group_id, $id ) );
    }

    /**
     * @param $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_single_settings_field( $request ) {
        $group_id = $request->get_param( 'group_id' );
        $parent_id = $request->get_param( 'parent_id' );
        $id       = $request->get_param( 'id' );
        return rest_ensure_response( $this->vendor_settings->single_settings_field( $group_id, $parent_id, $id ) );
    }

    /**
     * Permission callback for vendor settings
     *
     * @return bool|WP_Error
     */
    public function get_settings_permission_callback() {
        $vendor = $this->get_vendor();

        if ( is_wp_error( $vendor ) ) {
            return $vendor;
        }

        if ( empty( $vendor->get_id() ) ) {
            return new WP_Error( 'no_store_found', __( 'No vendor found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return true;
    }

    /**
     * Get vendor
     *
     * @return Vendor|WP_Error
     */
    protected function get_vendor() {
        $current_user = dokan_get_current_user_id();
        if ( $current_user ) {
            $vendor = dokan()->vendor->get( $current_user );
        }

        if ( ! $current_user ) {
            return new WP_Error( 'Unauthorized', __( 'You are not logged in', 'dokan-lite' ), [ 'code' => 401 ] );
        }

        return $vendor;
    }

    /**
     * Prepare links for the request.
     *
     * @param \WC_Data $object Object data.
     * @param WP_REST_Request $request Request object.
     *
     * @return array Links for the given post.
     */
    protected function prepare_links( $object, $request ) {
        $links = [
            'self' => [
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $object['id'] ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
            ],
        ];

        return $links;
    }

    /**
     * Prepare a single item output for response
     *
     * @param $store
     * @param WP_REST_Request $request Request object.
     * @param array $additional_fields (optional)
     *
     * @return WP_REST_Response $response Response data.
     */
    public function prepare_item_for_response( $store, $request, $additional_fields = [] ) {
        $data     = $store->to_array();
        $data     = array_merge( $data, apply_filters( 'dokan_rest_store_settings_additional_fields', $additional_fields, $store, $request ) );
        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $data, $request ) );

        return apply_filters( 'dokan_rest_prepare_store_settings_item_for_response', $response );
    }

    /**
     * Args for updating a single setting.
     *
     * @return array
     */
    private function update_single_settings_args() {
        return $this->vendor_settings->args_schema_for_save_single_settings();
    }

    /**
     * Args for updating a single setting.
     *
     * @return array
     */
    private function update_settings_group_args() {
        return $this->vendor_settings->args_schema_for_save_settings_group();
    }
}
