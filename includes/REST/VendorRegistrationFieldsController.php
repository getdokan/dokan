<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\VendorRegistration\FieldIndex;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Lists the custom field keys the Vendor Registration Form block's editor can reuse.
 *
 * @since DOKAN_SINCE
 */
class VendorRegistrationFieldsController extends DokanBaseController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'vendor-registration/fields';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );
    }

    /**
     * Admins and shop managers only: the list spans every page and counts vendor answers.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return bool
     */
    public function get_items_permissions_check( $request ) {
        // Anyone who can edit pages can set up the block, so they need the keys other forms use.
        return current_user_can( 'edit_pages' );
    }

    /**
     * Get the saved custom field keys.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ) {
        $fields = dokan_get_container()->get( FieldIndex::class )->get_fields();

        return rest_ensure_response( array_values( $fields ) );
    }

    /**
     * Item schema.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_item_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'vendor-registration-field',
            'type'       => 'object',
            'properties' => [
                'key'     => [
                    'description' => __( 'Meta key the answers are saved under.', 'dokan-lite' ),
                    'type'        => 'string',
                ],
                'label'   => [
                    'description' => __( 'Field label.', 'dokan-lite' ),
                    'type'        => 'string',
                ],
                'type'    => [
                    'description' => __( 'Field type.', 'dokan-lite' ),
                    'type'        => 'string',
                ],
                'options' => [
                    'description' => __( 'Options of choice fields.', 'dokan-lite' ),
                    'type'        => 'array',
                ],
                'pages'   => [
                    'description' => __( 'Pages whose form uses the key.', 'dokan-lite' ),
                    'type'        => 'array',
                ],
                'answers' => [
                    'description' => __( 'Number of vendors who answered.', 'dokan-lite' ),
                    'type'        => 'integer',
                ],
                'removed' => [
                    'description' => __( 'Whether no form uses the key any more.', 'dokan-lite' ),
                    'type'        => 'boolean',
                ],
            ],
        ];
    }
}
