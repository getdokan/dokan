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
class AdminMiscController extends DokanRESTAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = '';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/help', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_help' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        ) );

    }

    /**
     * Get help documents
     *
     * @return WP_REST_Response
     */
    public function get_help() {
        require_once DOKAN_INC_DIR . '/Admin/functions.php';

        $help = dokan_admin_get_help();

        return rest_ensure_response( $help );
    }

}
