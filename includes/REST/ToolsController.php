<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Admin\Tools\ToolsActions;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Tools REST controller for the free admin Tools page.
 *
 * Pro keeps its own paths under the same `tools` base for its Pro-only actions.
 *
 * @since 5.0.9
 */
class ToolsController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'tools';

    /**
     * Tools actions service.
     *
     * @var ToolsActions
     */
    private $tools;

    /**
     * Constructor.
     *
     * @since 5.0.9
     */
    public function __construct() {
        $this->tools = new ToolsActions();
    }

    /**
     * Register routes.
     *
     * @since 5.0.9
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/create-pages', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_pages' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/check-all-dokan-pages-exists', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'check_all_dokan_pages_exists' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/clear-caches', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'clear_caches' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Create the Dokan default pages.
     *
     * @since 5.0.9
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function create_pages( WP_REST_Request $request ) {
        return rest_ensure_response( $this->tools->create_default_pages() );
    }

    /**
     * Check whether all Dokan pages exist.
     *
     * @since 5.0.9
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function check_all_dokan_pages_exists( WP_REST_Request $request ) {
        return rest_ensure_response( $this->tools->check_all_dokan_pages_exists() );
    }

    /**
     * Clear all Dokan caches.
     *
     * @since 5.0.9
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function clear_caches( WP_REST_Request $request ) {
        return rest_ensure_response( $this->tools->clear_dokan_caches() );
    }
}
