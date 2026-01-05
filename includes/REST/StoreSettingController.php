<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Vendor\Vendor;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;

/**
 * StoreSettings API Controller
 * @package dokan
 *
 * @author weDevs <info@wedevs.com>
 */
class StoreSettingController extends StoreController {
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
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                    'args'                => [
                        'vendor_id' => [
                            'required'          => false,
                            'type'              => 'integer',
                            'validate_callback' => function ( $param ) {
                                return is_numeric( $param ) && (int) $param > 0;
                            },
                            'description'       => __( 'Optional vendor ID', 'dokan-lite' ),
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_settings' ],
                    'permission_callback' => [ $this, 'get_settings_permission_callback' ],
                    'args'                => [
                        'vendor_id' => [
                            'required'          => false,
                            'type'              => 'integer',
                            'validate_callback' => function ( $param ) {
                                return is_numeric( $param ) && (int) $param > 0;
                            },
                            'description'       => __( 'Optional vendor ID', 'dokan-lite' ),
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Update Store
     *
     * @param \WP_REST_Request $request
     *
     * @since 3.2.12
     *
     * @return WP_Error|\WP_REST_Response
     */
    public function update_settings( $request ) {
        $vendor_id = (int) $request->get_param( 'vendor_id' );
        $request->set_param( 'id', $vendor_id );
        $response = parent::update_store( $request );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $store = dokan()->vendor->get( $vendor_id );

        do_action( 'dokan_rest_store_settings_after_update', $store, $request );

        return $response;
    }

    /**
     * @param \WP_REST_Request $request
     *
     * @return mixed|WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_settings( $request ) {
        $vendor_id = (int) $request->get_param( 'vendor_id' );
        $request->set_param( 'id', $vendor_id );

        return parent::get_store( $request );
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
     * @param \WP_REST_Request|null
     *
     * @return WP_Error|Vendor
     */
    protected function get_vendor( $request = null ) {
        $vendor_id = is_a( $request, \WP_REST_Request::class ) && $request->get_param( 'vendor_id' ) ? $request->get_param( 'vendor_id' ) : '';
        if ( $vendor_id ) {
            $vendor = dokan()->vendor->get( (int) $vendor_id );
        } else {
            $current_user = dokan_get_current_user_id();

            if ( ! $current_user ) {
                return new WP_Error( 'Unauthorized', __( 'You are not logged in', 'dokan-lite' ), [ 'code' => 401 ] );
            }

            if ( $current_user ) {
                $vendor = dokan()->vendor->get( $current_user );
            }
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
        $response = parent::prepare_item_for_response( $store, $request, $additional_fields );
        $data = $response->get_data();
        $data     = array_merge( $data, apply_filters( 'dokan_rest_store_settings_additional_fields', $additional_fields, $store, $request ) );
        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $data, $request ) );

        return apply_filters( 'dokan_rest_prepare_store_settings_item_for_response', $response );
    }
}
