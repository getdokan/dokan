<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Admin Onboarding REST Controller
 *
 * @since 4.0.0
 */
class AdminOnboardingController extends DokanBaseAdminController {

    /**
     * API base
     *
     * @var string
     */
    protected $rest_base = 'onboarding';

    /**
     * Register routes
     *
     * @since 4.0.0
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
     * @since 4.0.0
     *
     * @return array
     */
    public function get_item_schema(): array {
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'admin_onboarding',
            'type'       => 'object',
            'properties' => [
                'onboarding' => [
                    'description' => esc_html__( 'Onboarding data', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                ],
                'marketplace_goal' => [
                    'description' => esc_html__( 'Marketplace goal', 'dokan-lite' ),
                    'type'        => 'object',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                    'properties'  => [
                        'marketplace_focus' => [
                            'description' => esc_html__( 'Marketplace focus', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => [ 'view', 'edit' ],
                            'required'    => true,
                        ],
                        'handle_delivery' => [
                            'description' => esc_html__( 'Handle delivery', 'dokan-lite' ),
                            'type' => 'string',
                            'context'     => [ 'view', 'edit' ],
                            'required'    => true,
                        ],
                        'top_priority' => [
                            'description' => esc_html__( 'Top priority', 'dokan-lite' ),
                            'type'        => 'string',
                            'context'     => [ 'view', 'edit' ],
                            'required'    => true,
                        ],
                    ],
                ],
                'custom_store_url' => [
                    'description' => esc_html__( 'Custom store URL', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => false,
                ],
                'share_essentials' => [
                    'description' => esc_html__( 'Share essentials', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                ],
                'plugins' => [
                    'description' => esc_html__( 'Plugins to install', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'   => [
                                'description' => esc_html__( 'Plugin ID', 'dokan-lite' ),
                                'type'        => 'string',
                            ],
                            'info' => [
                                'description' => esc_html__( 'Plugin info', 'dokan-lite' ),
                                'type'        => 'object',
                            ],
                        ],
                    ],
                    'required'    => false,
                ],
            ],
        ];

        /**
         * Filter the admin onboarding schema.
         *
         * @since 4.0.0
         *
         * @param array $schema The schema definition.
         */
        return apply_filters( 'dokan_admin_onboarding_schema', $schema );
    }

    /**
     * Create onboarding data
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response|WP_Error
     */
    public function create_onboarding( WP_REST_Request $request ) {
        $data = $request->get_params();
        if ( ! isset( $data['onboarding'] ) ) {
            return new WP_Error(
                'invalid_request',
                esc_html__( 'Invalid request', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $onboarding      = $data['onboarding'];
        $general_options = get_option( 'dokan_general', [] );

        /**
         * Fires before saving onboarding data.
         *
         * @since 4.0.0
         *
         * @param array $data The request data.
         */
        do_action( 'dokan_before_save_admin_onboarding', $data );

        update_option( 'dokan_onboarding', $onboarding );

        if ( isset( $data['custom_store_url'] ) ) {
            $general_options['custom_store_url'] = ! empty( $data['custom_store_url'] )
                ? sanitize_text_field( wp_unslash( $data['custom_store_url'] ) )
                : '';

            update_option( 'dokan_general', $general_options );
        }

        $share_essentials = isset( $data['share_essentials'] ) ? (bool) $data['share_essentials'] : false;
        $this->update_share_essentials( $share_essentials );

        // Update marketplace goal & install required plugins
        $this->update_marketplace_goal( $data );
        if ( isset( $data['plugins'] ) && is_array( $data['plugins'] ) ) {
            $this->install_required_plugins( $data['plugins'] );
        }

        $response_data = [
            'message'          => esc_html__( 'Onboarding created successfully', 'dokan-lite' ),
            'onboarding'       => get_option( 'dokan_onboarding', false ),
            'general_options'  => get_option( 'dokan_general', [] ),
            'share_essentials' => get_option( 'dokan_share_essentials', false ),
            'marketplace_goal' => get_option( 'dokan_marketplace_goal', [] ),
        ];

        /**
         * Filter the response data after saving onboarding settings.
         *
         * @since 4.0.0
         *
         * @param array $response_data The response data.
         * @param array $data The request data.
         */
        $response_data = apply_filters( 'dokan_admin_onboarding_response', $response_data, $data );
        /**
         * Flush rewrite rules for custom store URL.
         *
         * @since 4.0.0
         */
        do_action( 'woocommerce_flush_rewrite_rules' );
        /**
         * Fires after saving onboarding data.
         *
         * @since 4.0.0
         *
         * @param array $data The request data.
         * @param array $response_data The response data.
         */
        do_action( 'dokan_after_save_admin_onboarding', $data, $response_data );

        return new WP_REST_Response( $response_data, 200 );
    }

    /**
     * Get onboarding data
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_onboarding( WP_REST_Request $request ): WP_REST_Response {
        $onboarding          = get_option( 'dokan_onboarding', false );
        $recommended_plugins = ( new \WeDevs\Dokan\Admin\RecommendedPlugins() )->get();

        // rest api response
        $data = [
            'onboarding' => $onboarding,
            'plugins'    => array_values( $recommended_plugins ),
        ];

        /**
         * Filter the response data for get onboarding request.
         *
         * @since 4.0.0
         *
         * @param array $data The response data.
         * @param WP_REST_Request $request The request object.
         */
        $data = apply_filters( 'dokan_rest_onboarding_data', $data, $request );

        return rest_ensure_response( $data );
    }

    /**
     * Update share essentials option
     *
     * @since 4.0.0
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

        /**
         * Fires after updating share essentials option.
         *
         * @since 4.0.0
         *
         * @param bool $share_essentials Whether sharing essentials is enabled.
         */
        do_action( 'dokan_share_essentials_updated', $share_essentials );
    }

    /**
     * Update marketplace goal settings
     *
     * @since 4.0.0
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
        $goal_data        = $data['marketplace_goal'];

        $marketplace_goal['marketplace_focus'] = $goal_data['marketplace_focus'] ?? '';
        $marketplace_goal['handle_delivery']   = $goal_data['handle_delivery'] ?? '';
        $marketplace_goal['top_priority']      = $goal_data['top_priority'] ?? '';

        /**
         * Filter the marketplace goal data before saving.
         *
         * @since 4.0.0
         *
         * @param array $marketplace_goal The marketplace goal data.
         * @param array $data The original request data.
         */
        $marketplace_goal = apply_filters( 'dokan_marketplace_goal_data', $marketplace_goal, $data );

        update_option( 'dokan_marketplace_goal', $marketplace_goal );

        /**
         * Fires after updating marketplace goal settings.
         *
         * @since 4.0.0
         *
         * @param array $marketplace_goal The marketplace goal data.
         * @param array $data The original request data.
         */
        do_action( 'dokan_marketplace_goal_updated', $marketplace_goal, $data );
    }

    /**
     * Install required plugins
     *
     * @since 4.0.0
     *
     * @param array $plugins
     *
     * @return void
     */
    protected function install_required_plugins( array $plugins ): void {
        $setup_wizard = new \WeDevs\Dokan\Admin\SetupWizard();

        /**
         * Filter the plugins to install during onboarding.
         *
         * @since 4.0.0
         *
         * @param array $plugins The plugins to install.
         */
        $plugins = apply_filters( 'dokan_admin_onboarding_plugins', $plugins );

        foreach ( $plugins as $plugin ) {
            if ( isset( $plugin['id'], $plugin['info'] ) ) {
                /**
                 * Fires before installing a specific plugin during onboarding.
                 *
                 * @since 4.0.0
                 *
                 * @param string $plugin_id The plugin ID.
                 * @param array $plugin_info The plugin info.
                 */
                do_action( 'dokan_before_install_plugin', $plugin['id'], $plugin['info'] );

                $setup_wizard->install_plugin( $plugin['id'], $plugin['info'] );

                /**
                 * Fires after installing a specific plugin during onboarding.
                 *
                 * @since 4.0.0
                 *
                 * @param string $plugin_id The plugin ID.
                 * @param array $plugin_info The plugin info.
                 */
                do_action( 'dokan_after_install_plugin', $plugin['id'], $plugin['info'] );
            }
        }

        /**
         * Fires after installing all plugins during onboarding.
         *
         * @since 4.0.0
         *
         * @param array $plugins The installed plugins.
         */
        do_action( 'dokan_admin_onboarding_plugins_installed', $plugins );
    }
}
