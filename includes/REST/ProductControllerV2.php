<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\ProductCategory\Categories;
use WeDevs\Dokan\REST\ProductController;
use WP_REST_Server;

class ProductControllerV2 extends ProductController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Register all routes related with stores
     *
     * @return void
     */
    public function register_routes() {
        parent::register_routes();

        register_rest_route(
            $this->namespace, '/' . $this->base . '/categories', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_categories' ],
                    'permission_callback' => [ $this, 'get_product_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Returns all categories.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_categories() {
        $categories_controller = new Categories();
        $categories = apply_filters( 'dokan_rest_product_categories', $categories_controller->get());

        return rest_ensure_response( $categories );
    }
}
