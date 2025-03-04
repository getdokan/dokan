<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTAdminController;
use WP_REST_Request;

class AdminOnboardingController extends DokanRESTAdminController {
    protected $namespace = 'dokan/v1';
    protected $rest_base = 'admin-onboarding';

    public function register_routes() {
        // Register the route for creating onboarding
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_onboarding' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

		// get onboarding
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_onboarding' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }
    /**
     * Get the schema for the endpoint.
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

	public function create_onboarding( $request ) {
	    $data = $request->get_json_params();

	    if ( ! isset( $data['onboarding'] ) ) {
	        return new \WP_Error( 'invalid_request', __( 'Invalid request', 'dokan-lite' ), [ 'status' => 400 ] );
	    }

	    $onboarding = $data['onboarding'];
	    $general_options = get_option( 'dokan_general', [] );

	    // Save the onboarding data to the database or perform any necessary actions
	    update_option( 'dokan_onboarding', $onboarding );

	    // Update dokan_general option
	    if ( isset( $data['custom_store_url'] ) ) {
	        $general_options['custom_store_url'] = ! empty( $data['custom_store_url'] ) ? sanitize_text_field( wp_unslash( $data['custom_store_url'] ) ) : '';
	    }

	    $share_essentials = isset( $data['share_essentials'] );

	    $this->update_share_essentials( $share_essentials );

        // Update dokan marketplace goal option

        $dokan_marketplace_goal = get_option( 'dokan_marketplace_goal', [] );
        if ( isset( $data['marketplace_goal'] ) ) {
            $dokan_marketplace_goal['marketplace_focus'] = $data['marketplace_goal'];
            $dokan_marketplace_goal['handle_delivery'] = $data['handle_delivery'];
            $dokan_marketplace_goal['top_priority'] = $data['top_priority'];
            update_option( 'dokan_marketplace_goal', $dokan_marketplace_goal );
        }
	    // Install required plugins
	    if ( isset( $data['plugins'] ) && is_array( $data['plugins'] ) ) {
	        $this->install_required_plugins( $data['plugins'] );
	    }

	    return new \WP_REST_Response(
	        [
	            'message' => __( 'Onboarding created successfully', 'dokan-lite' ),
	            'onboarding' => $onboarding,
	            'general_options' => $general_options,
	            'share_essentials' => $share_essentials,
	        ], 200
	    );
	}
    /**
     * Get onboarding data.
     *
     * @param WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response The response object.
     */
    public function get_onboarding( WP_REST_Request $request ): \WP_REST_Response {
        $onboarding = get_option( 'dokan_onboarding', [] );
        $general_options = get_option( 'dokan_general', [] );
        $share_essentials = get_option( 'dokan_share_essentials', false );
        $marketplace_goal = get_option( 'dokan_marketplace_goal', [] );

        return new \WP_REST_Response(
            [
                'onboarding' => $onboarding,
                'general_options' => $general_options,
                'share_essentials' => $share_essentials,
                'marketplace_goal' => $marketplace_goal,
            ], 200
        );
    }
	protected function update_share_essentials( $share_essentials ) {
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

	protected function install_required_plugins( $plugins ) {
	    $setup_wizard = new \WeDevs\Dokan\Admin\SetupWizard();
	    foreach ( $plugins as $plugin ) {
	        if ( isset( $plugin['id'], $plugin['info'] ) ) {
	            $setup_wizard->install_plugin( $plugin['id'], $plugin['info'] );
	        }
	    }
	}
}
