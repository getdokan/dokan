<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Shipping_Methods_Controller;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Dokan REST API Shipping Methods controller class.
 *
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\REST
 */
class ShippingMethodController extends WC_REST_Shipping_Methods_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Check if a given request has access to read shipping methods.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }
        return true;
    }

    /**
     * Check if a given request has access to read a shipping method.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        if ( ! $this->check_vendor_permission() ) {
            return new WP_Error( 'dokan_rest_cannot_view', __( 'Sorry, you cannot view this resource.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }
        return true;
    }

    /**
     * Check vendor permission.
     *
     * @return bool
     */
    protected function check_vendor_permission(): bool {
        return dokan_is_user_seller( dokan_get_current_user_id() );
    }
}
