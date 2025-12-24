<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Admin\OnboardingSetup\AdminSetupGuide;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class AdminSetupGuideController extends DokanBaseAdminController {

    /**
     * The namespace of this controller's route.
     *
     * @var string $rest_base The base URL for the REST API.
     */
    protected $rest_base = 'setup-guide';

    /**
     * Register all routes releated with stores.
     *
     * @since 4.0.0
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
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'set_items_as_completed' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'setup_completed' => [
                            'required' => true,
                            'type'     => 'boolean',
                            'default'  => false,
                        ],
                    ],
                ],

                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\w-]+)',
            [
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_item' ],
					'permission_callback' => [ $this, 'check_permission' ],
					'args'                => [],
				],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [],
                ],
            ]
        );
    }

    /**
     * Get all items.
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function get_items( $request ): WP_REST_Response {
        /**
         * @var AdminSetupGuide $setup_guide The admin setup guide steps.
         */
        $setup_guide = dokan_get_container()->get( AdminSetupGuide::class );

        $steps = $setup_guide->get_steps_mapper();

		// Apply a filter to modify the steps progress data before returning it.
        /**
         * Filter the admin setup guide steps progress.
         *
         * Allows modification of the steps progress data before it is returned.
         *
         * @since 4.0.0
         *
         * @param array $steps The steps progress data.
         * @return array The modified steps progress data.
         */
        $steps = apply_filters( 'dokan_admin_setup_guide_steps_progress', $steps );
        return rest_ensure_response( $steps );
    }

    /**
     * Get a single item.
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return \WP_Error| WP_REST_Response
     */
    public function get_item( $request ) {
        $id = $request->get_param( 'id' );

        /**
         * @var AdminSetupGuide $setup_guide The admin setup guide steps.
         */
        $setup_guide = dokan_get_container()->get( AdminSetupGuide::class );

        $steps        = $setup_guide->get_steps();
        $steps_mapper = $setup_guide->get_steps_mapper();

        $step_index = array_search( $id, array_column( $steps_mapper, 'id' ), true );

        if ( false === $step_index ) {
            return new \WP_Error( 'dokan_rest_invalid_step', esc_html__( 'Invalid step.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $step = $steps[ $step_index ];

        // Apply a filter to modify the step response data before returning it.
        /**
         * Filter the admin setup guide step response.
         *
         * Allows modification of the step response data before it is returned.
         *
         * @since 4.0.0
         *
         * @param array  $step_array The populated step data.
         * @param object $step       The step object.
         */
        $step_array = apply_filters( 'dokan_admin_setup_guide_step_response', $step->populate(), $step );

        return rest_ensure_response( $step_array );
    }

    /**
     * Update a single item.
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return \WP_Error| WP_REST_Response
     */
    public function update_item( $request ) {
        $id = $request->get_param( 'id' );

        /**
         * @var AdminSetupGuide $setup_guide The admin setup guide steps.
         */
        $setup_guide = dokan_get_container()->get( AdminSetupGuide::class );

        $steps        = $setup_guide->get_steps();
        $steps_mapper = $setup_guide->get_steps_mapper();

        $step_index = array_search( $id, array_column( $steps_mapper, 'id' ), true );

        if ( false === $step_index ) {
            return new \WP_Error( 'dokan_rest_invalid_step', esc_html__( 'Invalid step.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $step = $steps[ $step_index ];

        try {
            $step->save( $this->parse_settings_data( $request->get_params() ) );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'dokan_rest_invalid_step', $e->getMessage(), [ 'status' => 400 ] );
        }

        /**
         * Filter the admin setup guide step response.
         *
         * Allows modification of the step response data before it is returned.
         *
         * @since 4.0.0
         *
         * @param array  $step_array The populated step data.
         * @param object $step       The step object.
         *
         * @return array The modified step response data.
         */
        $step_array = apply_filters( 'dokan_admin_setup_guide_step_response', $step->populate(), $step );
        return rest_ensure_response( $step_array );
    }

    /**
     * Set items as completed.
     *
     * @since 4.0.0
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function set_items_as_completed( $request ): WP_REST_Response {
        /**
         * @var AdminSetupGuide $setup_guide The admin setup guide steps.
         */
        $setup_guide = dokan_get_container()->get( AdminSetupGuide::class );
        $setup_guide->set_setup_complete( true );

        return rest_ensure_response(
            [
                'success' => $request->get_param( 'setup_completed' ),
            ]
        );
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
