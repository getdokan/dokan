<?php

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
class Dokan_REST_Admin_Report_Controller extends WP_REST_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'admin/report';

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
                'permission_callback' => array( $this, 'get_overview_permissions_check' ),
            ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->base . '/feed', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_feeds' ),
                'permission_callback' => array( $this, 'get_overview_permissions_check' ),
                'args'                => array(
                    'item' => array(
                        'type'        => 'integer',
                        'description' => __( 'Number of feed item', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => 5
                    ),
                    'show_summary' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing summary', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => false
                    ),
                    'show_author' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing author', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => false
                    ),
                    'show_date' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing date', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => true
                    ),
                )
            ),
        ) );
    }

    /**
     * Get overview reports
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_overview_permissions_check() {
        return current_user_can( 'manage_options' );
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

    /**
     * Get rss feeds
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function get_feeds( $request ) {

    }

}
