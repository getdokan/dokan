<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTAdminController;

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
class AdminNoticeController extends DokanRESTAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = '';

    /**
     * Register all routes related with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/notices', array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_notices' ),
                    'permission_callback' => array( $this, 'check_permission' ),
                ),
            )
        );
    }

    /**
     * Get help documents
     *
     * @return WP_REST_Response
     */
    public function get_notices() {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $notices = dokan_get_notices();

        return rest_ensure_response( $notices );
    }

}
