<?php

/**
 * API_Registrar class
 */
class Dokan_API_Manager {

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

        require_once DOKAN_DIR . '/includes/api/admin/class-admin-controller.php';

        $this->class_map = apply_filters( 'dokan_rest_api_class_map', array(
            DOKAN_DIR . '/includes/api/admin/class-report-controller.php'            => 'Dokan_REST_Admin_Report_Controller',
            DOKAN_DIR . '/includes/api/admin/class-dashboard-controller.php'         => 'Dokan_REST_Admin_Dashboard_Controller',
            DOKAN_DIR . '/includes/api/admin/class-misc-controller.php'              => 'Dokan_REST_Admin_Misc_Controller',
            DOKAN_DIR . '/includes/api/class-store-controller.php'                   => 'Dokan_REST_Store_Controller',
            DOKAN_DIR . '/includes/api/class-product-controller.php'                 => 'Dokan_REST_Product_Controller',
            DOKAN_DIR . '/includes/api/class-product-attribute-controller.php'       => 'Dokan_REST_Product_Attribute_Controller',
            DOKAN_DIR . '/includes/api/class-product-attribute-terms-controller.php' => 'Dokan_REST_Product_Attribute_Terms_Controller',
            DOKAN_DIR . '/includes/api/class-order-controller.php'                   => 'Dokan_REST_Order_Controller',
            DOKAN_DIR . '/includes/api/class-withdraw-controller.php'                => 'Dokan_REST_Withdraw_Controller',
            DOKAN_DIR . '/includes/api/class-store-controller.php'                   => 'Dokan_REST_Store_Controller',
            DOKAN_DIR . '/includes/api/class-settings-controller.php'                => 'Dokan_REST_Settings_Controller',
        ) );

        // Init REST API routes.
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
        add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'prepeare_product_response' ), 10, 3 );
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

    /**
     * Prepare object for product response
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function prepeare_product_response( $response, $object, $request ) {
        $data = $response->get_data();
        $author_id = get_post_field( 'post_author', $data['id'] );

        $store = dokan()->vendor->get( $author_id );

        $data['store'] = array(
            'id'        => $store->get_id(),
            'name'      => $store->get_name(),
            'shop_name' => $store->get_shop_name(),
            'url'       => $store->get_shop_url(),
            'address'   => $store->get_address()
        );

        $response->set_data( $data );
        return $response;
    }
}
