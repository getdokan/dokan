<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTAdminController;
use WeDevs\Dokan\Cache;
use WP_REST_Server;

/**
 * Dokan Change log
 *
 * @since DOKAN_LITE_SINCE
 */
class ChangeLogController extends DokanRESTAdminController {
    /**
     * Register all routes related with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/changelog', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_change_log' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Get Change Logs
     *
     * @return WP_REST_Response
     */
    public function get_change_log() {
        $cache_key = 'changelog_lite_' . DOKAN_PLUGIN_VERSION;
        $changelog = Cache::get_transient( $cache_key );

        if ( false === $changelog ) {
            require_once DOKAN_DIR . '/templates/whats-new.php';
            $changelog = wp_json_encode( $changelog );
            Cache::set_transient( $cache_key, $changelog );
        }

        return rest_ensure_response( $changelog );
    }
}
