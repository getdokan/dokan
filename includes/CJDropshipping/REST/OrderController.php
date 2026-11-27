<?php

namespace WeDevs\Dokan\CJDropshipping\REST;

use WeDevs\Dokan\CJDropshipping\Order\Fulfilment;
use WeDevs\Dokan\CJDropshipping\Vendor\Access;
use WeDevs\Dokan\REST\DokanBaseVendorController;
use WC_Order;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Vendor endpoints for the CJ panel on the order page.
 *
 * @since DOKAN_SINCE
 */
class OrderController extends DokanBaseVendorController {

    /**
     * Namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'cj-dropshipping/orders';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'save' ],
                    'permission_callback' => [ $this, 'can_fulfil' ],
                    'args'                => [
                        'warehouse'   => [
                            'type'              => 'string',
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'cj_order_no' => [
                            'type'              => 'string',
                            'default'           => '',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'tracking_no' => [
                            'type'              => 'string',
                            'default'           => '',
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/delivered', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'delivered' ],
                    'permission_callback' => [ $this, 'can_fulfil' ],
                ],
            ]
        );
    }

    /**
     * Permission: the store owner of this order, with CJ allowed (E1).
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return bool|WP_Error
     */
    public function can_fulfil( $request ) {
        $user_id = get_current_user_id();

        if ( ! Access::can_use( $user_id ) ) {
            return new WP_Error( 'dokan_cj_forbidden', __( 'Only the store owner can fulfil CJ orders.', 'dokan-lite' ), [ 'status' => rest_authorization_required_code() ] );
        }

        $order = wc_get_order( (int) $request['id'] );

        if ( ! $order instanceof WC_Order || (int) dokan_get_seller_id_by_order( $order->get_id() ) !== $user_id || ! Fulfilment::has_cj_items( $order ) ) {
            return new WP_Error( 'dokan_cj_not_found', __( 'Order not found.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return true;
    }

    /**
     * Save CJ's order number and tracking for one warehouse group.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function save( $request ) {
        $order  = wc_get_order( (int) $request['id'] );
        $result = ( new Fulfilment() )->save( $order, get_current_user_id(), (string) $request['warehouse'], trim( (string) $request['cj_order_no'] ), trim( (string) $request['tracking_no'] ) );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        $result['duplicates'] = array_map(
            static function ( $order_id ) {
                $other = wc_get_order( $order_id );

                return $other ? $other->get_order_number() : (string) $order_id;
            },
            $result['duplicates']
        );
        $result['fully_ordered'] = ( new Fulfilment() )->is_fully_ordered( wc_get_order( $order->get_id() ) );

        return rest_ensure_response( $result );
    }

    /**
     * Mark the order delivered and complete it (D2).
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function delivered( $request ) {
        $result = ( new Fulfilment() )->mark_delivered( wc_get_order( (int) $request['id'] ) );

        return is_wp_error( $result ) ? $result : rest_ensure_response( [ 'status' => 'completed' ] );
    }
}
