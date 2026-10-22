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
     * Anyone who can edit pages, as they can place the block; titles of pages they can't edit are left out.
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
        $data = [];

        foreach ( dokan_get_container()->get( FieldIndex::class )->get_fields() as $field ) {
            $data[] = $this->prepare_response_for_collection( $this->prepare_item_for_response( $field, $request ) );
        }

        $response = rest_ensure_response( $data );
        $response->add_links(
            [
                'self' => [ 'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ) ],
            ]
        );

        return $response;
    }

    /**
     * Prepare one field for the response.
     *
     * @since DOKAN_SINCE
     *
     * @param array           $item    Field from the field index.
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ) {
        $data = [
            'key'     => (string) $item['key'],
            'label'   => (string) $item['label'],
            'type'    => (string) $item['type'],
            'options' => array_values( (array) ( $item['options'] ?? [] ) ),
            // IDs keep the editor's "used on another page" check right; titles only for pages the user can edit.
            'pages'   => array_map(
                function ( $page ) {
                    return [
                        'id'    => (int) $page['id'],
                        'title' => current_user_can( 'edit_post', (int) $page['id'] ) ? (string) $page['title'] : '',
                    ];
                },
                (array) ( $item['pages'] ?? [] )
            ),
            'answers' => (int) ( $item['answers'] ?? 0 ),
            'removed' => (bool) ( $item['removed'] ?? false ),
        ];

        /**
         * Filter a registration field in the REST response.
         *
         * @since DOKAN_SINCE
         *
         * @param array           $data    Response data.
         * @param array           $item    Field from the field index.
         * @param WP_REST_Request $request Request.
         */
        $data = apply_filters( 'dokan_rest_prepare_vendor_registration_field', $data, $item, $request );

        return rest_ensure_response( $data );
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
