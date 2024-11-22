<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Admin\Notices\Helper;
use WP_REST_Response;
use WP_REST_Server;
use WP_REST_Request;
use WeDevs\Dokan\Abstracts\DokanRESTAdminController;

/**
* Admin Notice Controller
*
* @since 3.3.3
*
* @package dokan
*/
class AdminNoticeController extends DokanRESTAdminController {
    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'notices';

    /**
     * Register all routes related with dokan admin notices
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base . '/admin', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'dokan_get_admin_notices' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'context' => [
                            'description' => __( 'Notice context', 'dokan-lite' ),
                            'type'        => 'string',
                            'required'    => false,
                            'default'     => 'all',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/promo', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_promo_notices' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Get dokan specific notices
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function dokan_get_admin_notices( WP_REST_Request $request ) {
        $notice_context = $request->get_param( 'context' );
        $notices = Helper::dokan_get_admin_notices( $notice_context );

        return rest_ensure_response( $notices );
    }

    /**
     * Get dokan promotional notices
     *
     * @return WP_REST_Response
     */
    public function get_promo_notices() {
        $notices = Helper::dokan_get_promo_notices();

        return rest_ensure_response( $notices );
    }
}
