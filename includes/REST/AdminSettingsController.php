<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Admin\Settings\Settings;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class AdminSettingsController extends DokanBaseAdminController {

    /**
     * The namespace of this controller's route.
     *
     * @var string $rest_base The base URL for the REST API.
     */
    protected $rest_base = 'settings';

    /**
     * Register all routes.
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
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                ],

                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );
    }

    /**
     * Get settings.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return \WP_Error| WP_REST_Response
     */
    public function get_items( $request ) {
        /**
         * @var Settings $setup_guide The admin settings manager.
         */
        $settings = dokan_get_container()->get( Settings::class );

        $settings_array = $settings->get_pages_data();

        /**
         * Filter the admin settings response.
         *
         * Allows modification of the settings response data before it is returned.
         *
         * @since DOKAN_SINCE
         *
         * @param array  $settings_array The populated step data.
         */
        $settings_array = apply_filters( 'dokan_admin_settings_response', $settings_array );

        return rest_ensure_response( $settings_array );
    }

    /**
     * Update settings.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return \WP_Error| WP_REST_Response
     */
    public function create_item( $request ) {
        try {
            /**
             * @var Settings $setup_guide The admin settings manager.
             */
            $settings_manager = dokan_get_container()->get( Settings::class );

            $settings_manager->save( $this->parse_settings_data( $request->get_params() ) );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'dokan_rest_invalid_settings', $e->getMessage(), [ 'status' => 400 ] );
        }

        /**
         * Filter the admin settings response.
         *
         * Allows modification of the settings response data before it is returned.
         *
         * @since DOKAN_SINCE
         *
         * @param array  $settings_array The populated step data.
         */
        $settings_array = apply_filters( 'dokan_admin_settings_response', $settings_manager->get_pages_data() );

        return rest_ensure_response( $settings_array );
    }

    /**
     * Item schema.
     *
     * @return array
     */
    public function get_item_schema(): array {
        $schema = array(
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title'   => 'dokan_admin_settings',
            'type'    => 'array',
            'items'   => array(
                'type'       => 'object',
                'properties' => array(
                    'id'           => array(
                        'description' => __( 'Settings element id.', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => false,
                        'required'    => true,

                    ),
                    'type'         => array(
                        'description' => __( 'Settings element type', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'title'        => array(
                        'description' => __( 'Settings element title', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'icon'         => array(
                        'description' => __( 'Settings element icon', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'variant'      => array(
                        'description' => __( 'Settings Input variant', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'value'        => array(
                        'description' => __( 'Settings element value', 'dokan-lite' ),
                        'type'        => array( 'string', 'integer', 'array', 'number', 'boolean', 'object' ),
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => false,
                        'required'    => true,
                    ),
                    'description'  => array(
                        'description' => __( 'Settings element description', 'dokan-lite' ),
                        'type'        => 'string',
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'dependencies' => array(
                        'description' => __( 'Settings element dependencies', 'dokan-lite' ),
                        'type'        => 'array',
                        'items'       => array(),
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                    'children'     => array(
                        'description' => __( 'Settings element children', 'dokan-lite' ),
                        'type'        => 'array',
                        'items'       => array(),
                        'context'     => array( 'view', 'edit' ),
                        'readonly'    => true,
                        'required'    => false,
                    ),
                ),
            ),
        );

        return $schema;
    }

    /**
     * Parse settings for storage.
     *
     * @param array $settings_data Settings data for parsing.
     *
     * @return array
     */
    private function parse_settings_data( array $settings_data ): array {
        $settings_parsed_data = array();
        foreach ( $settings_data as $settings_element ) {
            if ( ! isset( $settings_element['id'] ) ) {
                continue;
            }

            if ( isset( $settings_element['type'] ) && 'field' === $settings_element['type'] ) {
                $settings_parsed_data[ $settings_element['id'] ] = $settings_element['value'];
            } elseif ( ! empty( $settings_element['children'] ) ) {
                $settings_parsed_data[ $settings_element['id'] ] = $this->parse_settings_data( $settings_element['children'] );
            } else {
                $settings_parsed_data[ $settings_element['id'] ] = array();
            }
        }

        return $settings_parsed_data;
    }
}
