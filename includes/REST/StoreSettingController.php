<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Vendor;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;

/**
 * StoreSettings API Controller
 *
 * @package dokan
 *
 * @author weDevs <info@wedevs.com>
 */
class StoreSettingController extends WP_REST_Controller {
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
    protected $rest_base = 'settings';

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
					'callback'            => [ $this, 'get_settings' ],
					'permission_callback' => [ $this, 'get_settings_permission_callback' ],
				],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                ],
			]
        );
    }

    /**
     * Update Store
     *
     * @param \WP_REST_Request $request
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return WP_Error|\WP_REST_Response
     */
    public function update_settings( $request ) {
        $vendor   = $this->get_vendor();
        $params   = $request->get_params();
        $store_id = dokan()->vendor->update( $vendor->get_id(), $params );

        if ( is_wp_error( $store_id ) ) {
            return new WP_Error( $store_id->get_error_code(), $store_id->get_error_message() );
        }

        $store = dokan()->vendor->get( $store_id );

        do_action( 'dokan_rest_store_settings_after_update', $store, $request );

        $stores_data = $this->prepare_item_for_response( $store, $request );
        $response    = rest_ensure_response( $stores_data );

        return $response;
    }

    /**
     * @param $request
     *
     * @return mixed|WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_settings( $request ) {
        $vendor   = $this->get_vendor();
        $response = dokan_get_store_info( $vendor->id );

        return rest_ensure_response( $response );
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
     * @return WP_Error|Vendor
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
     * @param \WP_REST_Request $request Request object.
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
     * @param \WP_REST_Request $request Request object.
     * @param array $additional_fields (optional)
     *
     * @return \WP_REST_Response $response Response data.
     */
    public function prepare_item_for_response( $store, $request, $additional_fields = [] ) {
        $data     = $store->to_array();
        $data     = array_merge( $data, apply_filters( 'dokan_rest_store_settings_additional_fields', $additional_fields, $store, $request ) );
        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $data, $request ) );

        return apply_filters( 'dokan_rest_prepare_store_settings_item_for_response', $response );
    }
}
