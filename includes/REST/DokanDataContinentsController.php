<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Data_Continents_Controller;
use WP_Error;
use WP_REST_Request;

class DokanDataContinentsController extends WC_REST_Data_Continents_Controller {

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
    protected $rest_base = 'data/continents';

    /**
     * Check the permission of the request for dokan.
     *
     * @since 4.0.0
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function check_dokan_permission( $request ) {
        // phpcs:ignore WordPress.WP.Capabilities.Unknown
        if ( current_user_can( dokan_admin_menu_capability() ) || current_user_can( 'dokandar' ) ) {
            return true;
        }

        return new WP_Error(
            'dokan_pro_permission_failure',
            __( 'You are not allowed to do this action.', 'dokan-lite' ),
            [
                'status' => rest_authorization_required_code(),
            ]
        );
    }

    /**
     * Check if a given request has access to read an item.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        return $this->check_dokan_permission( $request );
    }

    /**
     * Check if a given request has access to read items.
     *
     * @since 4.0.0
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        return $this->check_dokan_permission( $request );
    }
}
