<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTAdminController;

/**
* Admin Notice Controller
*
* @since DOKAN_LITE_SINCE
*
* @package dokan
*/
class AdminNoticeController extends DokanRESTAdminController {
    /**
     * Register all routes related with dokan admin notices
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/admin-notices', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'dokan_get_admin_notices' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/global-admin-notices', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'dokan_get_global_admin_notices' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/promo-notices', [
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
     *
     * @return WP_REST_Response
     */
    public function dokan_get_admin_notices() {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $notices = dokan_get_admin_notices();

        return rest_ensure_response( $notices );
    }

    /**
     * Get dokan global notices
     *
     * @return WP_REST_Response
     */
    public function dokan_get_global_admin_notices() {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $notices = dokan_get_global_admin_notices();

        return rest_ensure_response( $notices );
    }

    /**
     * Get dokan promotional notices
     *
     * @return WP_REST_Response
     */
    public function get_promo_notices() {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $notices = dokan_get_promo_notices();

        return rest_ensure_response( $notices );
    }
}
