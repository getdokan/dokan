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
                        'scope' => [
                            'description' => __( 'Choose notice scope: "local" displays only on Dokan pages, "global" displays across the entire site.', 'dokan-lite' ),
                            'type'        => 'string',
                            'enum'        => [ 'local', 'global' ],
                            'required'    => false,
                            'default'     => '',
                            'sanitize_callback' => 'sanitize_text_field',
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
        $notice_scope = $request->get_param( 'scope' );
        $notice_scope = ! empty( $notice_scope ) ? $notice_scope : 'local';

        $notices = Helper::dokan_get_admin_notices();

        // Filter notices by scope
        $filter_notices = array_filter(
            $notices,
            function ( $notice ) use ( $notice_scope ) {
                return $notice_scope === ( $notice['scope'] ?? 'local' );
            }
        );
        $filter_notices = array_values( $filter_notices );

        return rest_ensure_response( $filter_notices );
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
