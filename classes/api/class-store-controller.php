<?php

/**
* Store API Controller
*
* @package dokan
*
* @author weDevs <info@wedevs.com>
*/
class Dokan_Store_Controller extends WP_REST_Controller {

    /**
     * Endpoint version
     *
     * @var string
     */
    protected $version = '1';

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v' . $version;

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'stores';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base, array(
            array(
                'methods'         => WP_REST_Server::READABLE,
                'callback'        => array( $this, 'get_stores' ),
            ),
        ) );
    }

    /**
     * Get stores
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_stores() {

    }

}