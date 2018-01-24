<?php

/**
 * API_Registrar class
 */
class Dokan_API_Register {

    /**
     * Class dir and class name mapping
     *
     * @var array
     */
    protected $class_map;

    /**
     * Constructor
     */
    public function __construct() {
        if ( ! class_exists( 'WP_REST_Server' ) ) {
            return;
        }

        $this->class_map = apply_filters( 'dokan_rest_api_class_map', array(
            'class-store-controller' => 'Dokan_Store_Controller'
        ) );

        // Init REST API routes.
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
    }

    /**
     * Register REST API routes.
     *
     * @since 1.2.0
     */
    public function register_rest_routes() {
        $classes_dir = DOKAN_DIR . '/classes/';

        foreach ( $this->class_map as $file_name => $controller ) {
            require_once $classes_dir . 'api/'. $file_name . '.php';
            $controller = new $controller();
            $controller->register_routes();
        }
    }
}
