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
            DOKAN_DIR . '/includes/api/class-store-controller.php'             => 'Dokan_Store_Controller',
            DOKAN_DIR . '/includes/api/class-product-controller.php'           => 'Dokan_Product_Controller',
            DOKAN_DIR . '/includes/api/class-order-controller.php'             => 'Dokan_Order_Controller',
            DOKAN_DIR . '/includes/api/class-store-controller.php'             => 'Dokan_Store_Controller',
            DOKAN_DIR . '/includes/api/class-dokan-settings-controller.php'    => 'Dokan_REST_Settings_Controller',
            DOKAN_DIR . '/includes/api/class-product-variation-controller.php' => 'Dokan_Product_Variation_Controller'
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

        foreach ( $this->class_map as $file_name => $controller ) {
            require_once $file_name;
            $controller = new $controller();
            $controller->register_routes();
        }
    }
}
