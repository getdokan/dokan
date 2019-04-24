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
            DOKAN_DIR . '/includes/api/class-settings-controller.php'                => 'Dokan_REST_Settings_Controller',
        ) );

        // Init REST API routes.
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ), 10 );
        add_filter( 'woocommerce_rest_prepare_product_object', array( $this, 'prepeare_product_response' ), 10, 3 );
        add_filter( 'dokan_vendor_to_array', array( $this, 'filter_store_open_close_option' ) );

        // populate admin commission data for admin
        add_filter( 'dokan_rest_store_additional_fields', array( $this, 'populate_admin_commission' ), 10, 2 );
    }

    /**
     * Register REST API routes.
     *
     * @since 1.2.0
     */
    public function register_rest_routes() {

        foreach ( $this->class_map as $file_name => $controller ) {
            require_once $file_name;
            $this->$controller = new $controller();
            $this->$controller->register_routes();
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

    /**
     * If store open close is truned off by admin, unset store_open_colse from api response
     *
     * @param  array $data
     *
     * @since  2.9.13
     *
     * @return array
     */
    public function filter_store_open_close_option( $data ) {
        if ( 'on' !== dokan_get_option( 'store_open_close', 'dokan_general', 'on' ) ) {
            unset( $data['store_open_close'] );
        }

        return $data;
    }

    /**
     * Populate admin commission
     *
     * @param  array $data
     * @param  array $store
     *
     * @since  2.9.13
     *
     * @return data
     */
    public function populate_admin_commission( $data, $store ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return $data;
        }

        $store_id = $store->get_id();

        if ( ! $store_id ) {
            return $data;
        }

        $commission                    = get_user_meta( $store_id, 'dokan_admin_percentage', true );
        $commission_type               = get_user_meta( $store_id, 'dokan_admin_percentage_type', true );
        $data['admin_commission']      = $commission;
        $data['admin_commission_type'] = $commission_type;

        return $data;
    }
}
