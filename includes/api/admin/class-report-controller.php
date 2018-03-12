<?php

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_REST_Admin_Report_Controller extends Dokan_REST_Admin_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'report';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->base . '/summary', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_overview' ),
                'permission_callback' => array( $this, 'check_permission' ),
            ),
        ) );
    }

    /**
     * Get overview data
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_overview( $request ) {
        require_once DOKAN_INC_DIR . '/admin-functions.php';

        $sales = dokan_get_sales_count();
        $data = array(
            'products'  => dokan_get_product_count(),
            'withdraw'  => dokan_get_withdraw_count(),
            'vendors'   => dokan_get_seller_count(),
            'orders'    => $sales['orders'],
            'earning'   => $sales['earning']
        );

        return rest_ensure_response( $data );
    }

}
