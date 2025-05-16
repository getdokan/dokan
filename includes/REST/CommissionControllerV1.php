<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTController;
use WeDevs\Dokan\Commission\ProductCommission;
use WeDevs\Dokan\ProductCategory\Helper;
use WP_Error;
use WP_HTTP_Response;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class CommissionControllerV1 extends DokanRESTController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'commission';

    /**
     * Registering the commission routes here.
     *
     * @since 3.14.0
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_commission' ],
                    'args'                => [
                        'product_id' => [
                            'description'       => __( 'Products price', 'dokan-lite' ),
                            'type'              => 'integer',
                            'default'           => 0,
                            'required'          => true,
                            'sanitize_callback' => 'absint',
                        ],
                        'amount' => [
                            'description'       => __( 'The amount on that the commission will be calculated.', 'dokan-lite' ),
                            'type'              => 'number',
                            'default'           => 0,
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'vendor_id' => [
                            'description'       => __( 'Vendor id', 'dokan-lite' ),
                            'type'              => 'integer',
                            'default'           => 0,
                            'required'          => true,
                            'sanitize_callback' => 'absint',
                        ],
                        'category_ids' => [
                            'description'       => __( 'Category ids', 'dokan-lite' ),
                            'type'              => 'array',
                            'sanitize_callback' => 'wc_clean',
                            'items'             => array(
                                'type' => 'integer',
                            ),
                            'default'           => [],
                            'required'          => true,
                        ],
                        'context' => [
                            'required'    => false,
                            'description' => __( 'In which context the commission will be calculated', 'dokan-lite' ),
                            'type'        => 'string',
                            'enum'        => [ 'admin', 'seller' ],
                            'context'     => [ 'view', 'edit' ],
                            'default'     => 'seller',
                        ],
                    ],
                    'permission_callback' => [ $this, 'get_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Checking if have any permission.
     *
     * @since 3.14.0
     *
     * @return boolean
     */
    public function get_permissions_check() {
        // phpcs:ignore WordPress.WP.Capabilities.Unknown
        return current_user_can( 'dokandar' ) || current_user_can( 'manage_options' );
    }

    /**
     * Returns commission or earning based on context.
     *
     * @param WP_REST_Request $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_commission( $request ) {
        $product_id   = $request->get_param( 'product_id' );
        $amount       = $request->get_param( 'amount' );
        $vendor_id    = $request->get_param( 'vendor_id' );
        $category_ids = $request->get_param( 'category_ids' );
        $context      = $request->get_param( 'context' );

        $chosen_cats = Helper::generate_chosen_categories( $category_ids );
        $category_id = reset( $chosen_cats );

        if ( ! $category_id ) {
            $category_id = 0;
        }

        if ( ! $vendor_id ) {
            $vendor_id = dokan_get_vendor_by_product( $product_id, true );
            $vendor_id = $vendor_id ? $vendor_id : 0;
        }

        if ( ! is_numeric( $amount ) ) {
            $amount = 0;
        }
        try {
            $product_commission = dokan_get_container()->get( ProductCommission::class );
            $product_commission->set_product_id( $product_id );
            $product_commission->set_total_amount( $amount );
            $product_commission->set_vendor_id( $vendor_id );
            $product_commission->set_category_id( $category_id );
            $commission_or_earning = $product_commission->calculate();

            $data = 'seller' === $context ? $commission_or_earning->get_vendor_earning() : $commission_or_earning->get_admin_commission();
        } catch ( \Exception $exception ) {
            $data = 0;
        }

        return rest_ensure_response( wc_format_decimal( $data, wc_get_price_decimals() ) );
    }
}
