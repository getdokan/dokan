<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Order_Refunds_Controller;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * REST API Order Refunds controller for Dokan
 *
 * Handles requests to the /orders/<id>/refunds endpoint.
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
class OrderRefundControllerV3 extends WC_REST_Order_Refunds_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Get all orders
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ): WP_REST_Response {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::get_items( $request );
            }
        );
    }

    /**
     * Get a single item.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_item( $request ) {
        $order_id = (int) $request['id'];
        $result = $this->check_order_authorization( $order_id );
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::get_item( $request );
            }
        );
    }

    /**
     * Create a single order.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function create_item( $request ) {
        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::create_item( $request );
            }
        );
    }

    /**
     * Update a single post.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function update_item( $request ) {
        $order_id = (int) $request['id'];
        $result = $this->check_order_authorization( $order_id );
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::update_item( $request );
            }
        );
    }

    /**
     * Delete a single item.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item( $request ) {
        $order_id = (int) $request['order_id'];
        $result = $this->check_order_authorization( $order_id );
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return $this->perform_vendor_action(
            function () use ( $request ) {
                return parent::delete_item( $request );
            }
        );
    }

    /**
     * Perform an action with vendor permission check.
     *
     * @param callable $action The action to perform.
     *
     * @return mixed The result of the action.
     */
    private function perform_vendor_action( callable $action ) {
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ] );
        $result = $action();
        remove_filter( 'woocommerce_rest_check_permissions', [ $this, 'check_vendor_permission' ] );
        return $result;
    }

    /**
     * Check if a given request has access to read items.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return $this->check_order_authorization( $request['order_id'] );
    }

    /**
     * Check if a given request has access to create an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function create_item_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_create', esc_html__( 'Sorry, you are not allowed to create resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return $this->check_order_authorization( $request['order_id'] );
    }

    /**
     * Check if a given request has access to read an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_view', esc_html__( 'Sorry, you cannot view this resource.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        $refund = $this->get_object( (int) $request['id'] );
        if ( ! $refund || 0 === $refund->get_id() ) {
            return new WP_Error( 'dokan_rest_invalid_id', __( 'Invalid ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return $this->check_order_authorization( $refund->get_parent_id() );
    }

    /**
     * Check if a given request has access to delete an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return bool|WP_Error
     */
    public function delete_item_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_delete', esc_html__( 'Sorry, you are not allowed to delete this resource.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        $refund = $this->get_object( (int) $request['id'] );
        if ( ! $refund || 0 === $refund->get_id() ) {
            return new WP_Error( 'dokan_rest_invalid_id', __( 'Invalid ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return $this->check_order_authorization( $refund->get_parent_id() );
    }

    /**
     * Check if the current user has authorization for a specific order.
     *
     * @param int $order_id The order ID to check authorization for.
     * @return bool|WP_Error True if authorized, WP_Error if not.
     */
    protected function check_order_authorization( int $order_id ) {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return new WP_Error( 'dokan_rest_invalid_order', __( 'Invalid order ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $vendor_id = dokan_get_seller_id_by_order( $order_id );
        if ( $vendor_id !== dokan_get_current_user_id() ) {
            return new WP_Error( 'dokan_rest_unauthorized_order', __( 'You do not have permission to access this order', 'dokan-lite' ), array( 'status' => 403 ) );
        }
        return true;
    }

    /**
     * Check permission for the request
     *
     * @return bool
     */
    public function check_vendor_permission(): bool {
        return dokan_is_user_seller( dokan_get_current_user_id() );
    }
}
