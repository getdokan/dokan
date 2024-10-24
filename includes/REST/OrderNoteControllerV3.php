<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Order_Notes_Controller;
use WP_Comment;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * REST API Order Notes controller for Dokan
 *
 * Handles requests to the /orders/<id>/notes endpoint.
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
class OrderNoteControllerV3 extends WC_REST_Order_Notes_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

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

        return $this->check_order_authorization( $request['order_id'] );
    }

    /**
     * Check if a given request has access delete a order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return bool|WP_Error
     */
    public function delete_item_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_delete', __( 'Sorry, you are not allowed to delete this resource.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return $this->check_order_authorization( $request['order_id'] );
    }

    /**
     * Check permission for the request
     *
     * @return bool
     */
    public function check_vendor_permission(): bool {
        return dokan_is_user_seller( dokan_get_current_user_id() );
    }

    /**
     * Create a single order note.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function create_item( $request ) {
        if ( empty( $request['note'] ) ) {
            return new WP_Error( 'dokan_rest_missing_note', __( 'Missing note parameter.', 'dokan-lite' ), array( 'status' => 400 ) );
        }

        $response = parent::create_item( $request );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( $response->get_status() === 201 ) {
            $note_id = $response->get_data()['id'];
            $this->update_note_author( get_comment( $note_id ), $request, true );

            $note = get_comment( $note_id );
            $response = $this->prepare_item_for_response( $note, $request );
            $response->set_status( 201 );
        }

        return $response;
    }

    /**
     * Update a single order note.
     *
     * @param WP_Comment $note Order note object.
     * @param WP_REST_Request $request Full details about the request.
     * @param bool $creating If the request is creating a new note.
     *
     * @return void
     */
    public function update_note_author( WP_Comment $note, WP_REST_Request $request, bool $creating ) {
        $user_id = dokan_get_current_user_id();
        $user = get_user_by( 'id', $user_id );

        if ( $creating && $user instanceof \WP_User && dokan_is_user_seller( $user_id ) ) {
            $data = array(
                'comment_ID' => $note->comment_ID,
                'user_id' => $user_id,
                'comment_author' => $user->display_name,
                'comment_author_email' => $user->user_email,
            );

            wp_update_comment( $data );

            // Update comment meta to indicate it's a vendor note
            update_comment_meta( (int) $note->comment_ID, 'dokan_vendor_note', 1 );
        }
    }
}
