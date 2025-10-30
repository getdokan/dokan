<?php

namespace WeDevs\Dokan\REST;

use Automattic\WooCommerce\Admin\API\Reports\Export\Controller;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dokan Export Controller
 *
 * Extends WooCommerce's Export Controller to provide export functionality
 * for Dokan specific reports like withdraws.
 *
 * @since 4.1.3
 */
class ExportController extends Controller {
	protected $namespace = 'dokan/v1';
    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = '/reports/(?P<type>[a-z]+)/export';

    /**
     * Register routes.
     *
     * @since 4.1.3
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'export_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_export_collection_params(),
                ),
                'schema' => array( $this, 'get_export_public_schema' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<export_id>[a-z0-9]+)/status',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'export_status' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                'schema' => array( $this, 'get_export_status_public_schema' ),
            )
        );
    }

    /**
     * Check if a given request has access to read items.
     *
     * @param  \WP_REST_Request $request Full details about the request.
     * @return \WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'dokan_view_reports' ) ) {
            return new \WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return true;
    }
}
