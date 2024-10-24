<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Data_Countries_Controller;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Dokan REST API Data Countries controller class.
 *
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\REST
 */
class DataCountryController extends WC_REST_Data_Countries_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Check whether a given request has permission to read countries data.
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
     * Check vendor permission.
     *
     * @return bool
     */
    protected function check_vendor_permission(): bool {
        return dokan_is_user_seller( dokan_get_current_user_id() );
    }
}
