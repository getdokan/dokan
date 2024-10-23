<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Data_Continents_Controller;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

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
     * Register routes.
     *
     * @since 3.5.0
     */
    public function register_routes() {
        parent::register_routes();
    }

    /**
     * Return the list of states for all countries.
     *
     * @since  3.5.0
     * @param  WP_REST_Request $request Request data.
     * @return WP_Error|WP_REST_Response
     */
    public function get_items( $request ) {
        $this->set_woocommerce_rest_check_permissions();

        return parent::get_items( $request );
    }

    /**
     * Return the list of states for a given country.
     *
     * @since  3.5.0
     * @param  WP_REST_Request $request Request data.
     * @return WP_Error|WP_REST_Response
     */
    public function get_item( $request ) {
        $this->set_woocommerce_rest_check_permissions();
        return parent::get_item( $request );
    }

    /**
     * Check if a given request has access to read an item.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        $this->set_woocommerce_rest_check_permissions();
        $item_permission = $this->get_items_permissions_check( $request );

        if ( is_wp_error( $item_permission ) ) {
            return $item_permission;
        }

        return parent::get_item_permissions_check( $request );
    }

    /**
     * Check if a given request has access to read items.
     *
     * @since DOKAN_SINCE
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
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

    private function set_woocommerce_rest_check_permissions() {
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'add_subscriptions_read_permission_to_vendors' ], 10, 4 );
    }

    /**
     * Add permissions.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param $permission
     * @param $context
     * @param $object_id
     * @param $obj
     *
     * @return true
     */
    public function add_subscriptions_read_permission_to_vendors( $permission, $context, $object_id, $obj ) {
        if ( 'read' === $context ) {
            return true;
        }

        return $permission;
    }
}
