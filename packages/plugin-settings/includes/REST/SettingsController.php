<?php

namespace WeDevs\PluginSettings\REST;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;
use WeDevs\PluginSettings\SettingsManager;

/**
 * REST Settings Controller.
 *
 * @since 1.0.0
 */
class SettingsController extends WP_REST_Controller {

    /**
     * Settings Manager instance.
     *
     * @var SettingsManager
     */
    protected SettingsManager $manager;

    /**
     * Required capability for accessing settings.
     *
     * @var string
     */
    protected string $capability = 'manage_options';

    /**
     * Constructor.
     *
     * @param SettingsManager $manager   Settings manager instance.
     * @param string          $namespace REST namespace.
     */
    public function __construct( SettingsManager $manager, string $namespace = 'sf/v1' ) {
        $this->manager   = $manager;
        $this->namespace = $namespace;
        $this->rest_base = 'settings';
    }

    /**
     * Set the required capability.
     *
     * @param string $capability Capability name.
     *
     * @return static
     */
    public function set_capability( string $capability ): self {
        $this->capability = $capability;

        return $this;
    }

    /**
     * Register routes.
     *
     * @return void
     */
    public function register_routes(): void {
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
     * Check if the current user has permission.
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return bool|WP_Error
     */
    public function check_permission( WP_REST_Request $request ) {
        if ( ! current_user_can( $this->capability ) ) {
            return new WP_Error(
                'rest_forbidden',
                __( 'You do not have permission to access settings.', 'settings-framework' ),
                [ 'status' => rest_authorization_required_code() ]
            );
        }

        return true;
    }

    /**
     * Get settings.
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_items( $request ) {
        $settings_data = $this->manager->get_pages_data();

        /**
         * Filters the settings REST response.
         *
         * @since 1.0.0
         *
         * @param array $settings_data Settings data.
         */
        $settings_data = apply_filters(
            $this->manager->get_hook_prefix() . '_rest_settings_response',
            $settings_data
        );

        return rest_ensure_response( $settings_data );
    }

    /**
     * Update settings.
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function create_item( $request ) {
        try {
            $this->manager->save( $this->parse_settings_data( $request->get_params() ) );
        } catch ( \Exception $e ) {
            return new WP_Error(
                'settings_save_error',
                $e->getMessage(),
                [ 'status' => 400 ]
            );
        }

        $settings_data = $this->manager->get_pages_data();

        /**
         * Filters the settings REST response after save.
         *
         * @since 1.0.0
         *
         * @param array $settings_data Settings data.
         */
        $settings_data = apply_filters(
            $this->manager->get_hook_prefix() . '_rest_settings_response',
            $settings_data
        );

        return rest_ensure_response( $settings_data );
    }

    /**
     * Get item schema.
     *
     * @return array
     */
    public function get_item_schema(): array {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'settings',
            'type'       => 'array',
            'items'      => [
                'type'       => 'object',
                'properties' => [
                    'id'           => [
                        'description' => __( 'Settings element ID.', 'settings-framework' ),
                        'type'        => 'string',
                        'context'     => [ 'view', 'edit' ],
                        'required'    => true,
                    ],
                    'type'         => [
                        'description' => __( 'Settings element type.', 'settings-framework' ),
                        'type'        => 'string',
                        'context'     => [ 'view', 'edit' ],
                        'readonly'    => true,
                    ],
                    'title'        => [
                        'description' => __( 'Settings element title.', 'settings-framework' ),
                        'type'        => 'string',
                        'context'     => [ 'view', 'edit' ],
                        'readonly'    => true,
                    ],
                    'value'        => [
                        'description' => __( 'Settings element value.', 'settings-framework' ),
                        'type'        => [ 'string', 'integer', 'array', 'number', 'boolean', 'object' ],
                        'context'     => [ 'view', 'edit' ],
                        'required'    => true,
                    ],
                    'children'     => [
                        'description' => __( 'Settings element children.', 'settings-framework' ),
                        'type'        => 'array',
                        'context'     => [ 'view', 'edit' ],
                        'readonly'    => true,
                    ],
                    'dependencies' => [
                        'description' => __( 'Settings element dependencies.', 'settings-framework' ),
                        'type'        => 'array',
                        'context'     => [ 'view', 'edit' ],
                        'readonly'    => true,
                    ],
                ],
            ],
        ];
    }

    /**
     * Parse settings data for storage.
     *
     * @param array $settings_data Raw settings data.
     *
     * @return array
     */
    protected function parse_settings_data( array $settings_data ): array {
        $parsed = [];

        foreach ( $settings_data as $element ) {
            if ( ! isset( $element['id'] ) ) {
                continue;
            }

            if ( isset( $element['type'] ) && 'field' === $element['type'] ) {
                $parsed[ $element['id'] ] = $element['value'] ?? null;
            } elseif ( ! empty( $element['children'] ) ) {
                $parsed[ $element['id'] ] = $this->parse_settings_data( $element['children'] );
            } else {
                $parsed[ $element['id'] ] = [];
            }
        }

        return $parsed;
    }
}

