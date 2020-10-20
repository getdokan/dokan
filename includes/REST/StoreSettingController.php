<?php

namespace WeDevs\Dokan\REST;

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
			]
        );
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

        return true;
    }

    /**
     * Get vendor
     *
     * @return WP_Error | $vendor
     */
    protected function get_vendor() {
        $current_user = dokan_get_current_user_id();
        if ( $current_user ) {
            $vendor = dokan()->vendor->get( $current_user );
        }

        if ( ! $current_user ) {
            return new WP_Error( 'Unauthorized', __( 'You are not logged in' ), [ 'code' => 401 ] );
        }

        return $vendor;
    }

}
