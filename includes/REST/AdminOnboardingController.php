<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTAdminController;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Admin Onboarding REST Controller
 *
 * @since 3.7.0
 */
class AdminOnboardingController extends DokanBaseAdminController {
    /**
     * API namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * API base
     *
     * @var string
     */
    protected $rest_base = 'admin-onboarding';

    /**
     * Register routes
     *
     * @since 3.7.0
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_onboarding' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( true ),
                ],
                [
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_onboarding' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Get the schema for the endpoint
     *
     * @since 3.7.0
     *
     * @return array
     */
    public function get_item_schema(): array {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'admin_onboarding',
            'type'       => 'object',
            'properties' => [
                'onboarding' => [
                    'description' => __( 'Onboarding data', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                ],
                'marketplace_goal' => [
                    'description' => __( 'Marketplace goal', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'marketplace_focus' => [
                                'description' => __( 'Marketplace focus', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'required'    => true,
                            ],
                            'handle_delivery' => [
                                'description' => __( 'Handle delivery', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'required'    => true,
                            ],
                            'top_priority' => [
                                'description' => __( 'Top priority', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'required'    => true,
                            ],
                        ],
                    ],
                ],
                'custom_store_url' => [
                    'description' => __( 'Custom store URL', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => false,
                ],
                'share_essentials' => [
                    'description' => __( 'Share essentials', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => false,
                ],
                'plugins' => [
                    'description' => __( 'Plugins to install', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'   => [
                                'description' => __( 'Plugin ID', 'dokan-lite' ),
                                'type'        => 'string',
                            ],
                            'info' => [
                                'description' => __( 'Plugin info', 'dokan-lite' ),
                                'type'        => 'object',
                            ],
                        ],
                    ],
                    'required'    => false,
                ],
            ],
        ];
    }

    /**
     * Create onboarding data
     *
     * @since 3.7.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response|WP_Error
     */
    public function create_onboarding( WP_REST_Request $request ) {
        $data = $request->get_json_params();

        if ( ! isset( $data['onboarding'] ) ) {
            return new WP_Error(
                'invalid_request',
                __( 'Invalid request', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $onboarding = $data['onboarding'];
        $general_options = get_option( 'dokan_general', [] );

        // Save the onboarding data to the database
        update_option( 'dokan_onboarding', $onboarding );

        // Update custom store URL if provided
        if ( isset( $data['custom_store_url'] ) ) {
            $general_options['custom_store_url'] = ! empty( $data['custom_store_url'] )
                ? sanitize_text_field( wp_unslash( $data['custom_store_url'] ) )
                : '';

            update_option( 'dokan_general', $general_options );
        }

        // Update share essentials
        $share_essentials = isset( $data['share_essentials'] );
        $this->update_share_essentials( $share_essentials );

        // Update marketplace goal option
        $this->update_marketplace_goal( $data );

        // Install required plugins
        if ( isset( $data['plugins'] ) && is_array( $data['plugins'] ) ) {
            $this->install_required_plugins( $data['plugins'] );
        }

        return new WP_REST_Response(
            [
                'message'          => __( 'Onboarding created successfully', 'dokan-lite' ),
                'onboarding'       => $onboarding,
                'general_options'  => $general_options,
                'share_essentials' => $share_essentials,
            ],
            200
        );
    }

    /**
     * Get onboarding data
     *
     * @since 3.7.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_onboarding( WP_REST_Request $request ): WP_REST_Response {
        $onboarding = get_option( 'dokan_onboarding', [] );
        $general_options = get_option( 'dokan_general', [] );
        $share_essentials = get_option( 'dokan_share_essentials', false );
        $marketplace_goal = get_option( 'dokan_marketplace_goal', [] );

        return new WP_REST_Response(
            [
                'onboarding'       => $onboarding,
                'general_options'  => $general_options,
                'share_essentials' => $share_essentials,
                'marketplace_goal' => $marketplace_goal,
            ],
            200
        );
    }

    /**
     * Update share essentials option
     *
     * @since 3.7.0
     *
     * @param bool $share_essentials
     *
     * @return void
     */
    protected function update_share_essentials( bool $share_essentials ): void {
        if ( $share_essentials ) {
            dokan()->tracker->insights->optin();
        } else {
            dokan()->tracker->insights->optout();
        }

        // Store this value for later use
        update_option( 'dokan_share_essentials', $share_essentials );

        // Call a hook for other plugins to do their thing
        do_action( 'dokan_share_essentials_updated', $share_essentials );
    }

    /**
     * Update marketplace goal settings
     *
     * @since 3.7.0
     *
     * @param array $data Request data
     *
     * @return void
     */
    protected function update_marketplace_goal( array $data ): void {
        if ( ! isset( $data['marketplace_goal'] ) ) {
            return;
        }

        $marketplace_goal = get_option( 'dokan_marketplace_goal', [] );
        $marketplace_goal['marketplace_focus'] = $data['marketplace_goal']['marketplace_focus'] ?? '';
        $marketplace_goal['handle_delivery'] = $data['marketplace_goal']['handle_delivery'] ?? false;
        $marketplace_goal['top_priority'] = $data['marketplace_goal']['top_priority'] ?? '';

        update_option( 'dokan_marketplace_goal', $marketplace_goal );
    }

    /**
     * Install required plugins
     *
     * @since 3.7.0
     *
     * @param array $plugins
     *
     * @return void
     */
    protected function install_required_plugins( array $plugins ): void {
        $setup_wizard = new \WeDevs\Dokan\Admin\SetupWizard();

        foreach ( $plugins as $plugin ) {
            if ( isset( $plugin['id'], $plugin['info'] ) ) {
                $setup_wizard->install_plugin( $plugin['id'], $plugin['info'] );
            }
        }
    }
}
