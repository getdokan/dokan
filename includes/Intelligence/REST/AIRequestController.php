<?php

namespace WeDevs\Dokan\Intelligence\REST;

use Exception;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\Intelligence\Utils\PromptUtils;
use WeDevs\Dokan\REST\DokanBaseVendorController;
use WP_Error;
use WP_REST_Server;


defined( 'ABSPATH' ) || exit();
class AIRequestController extends DokanBaseVendorController {
    /**
     * Version
     *
     * @var string
     */
    protected string $version = 'v1';

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan';

    /**
     * Route name
     *
     * @var string
     */
    protected $rest_base = 'ai/generate';


    public function register_routes(): void {
        register_rest_route(
            $this->namespace . '/' . $this->version,
            $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'handle_request' ],
                    'args'                => $this->get_request_args(),
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    public function get_request_args(): array {
        return [
            'prompt' => [
                'type'        => 'string',
                'required'    => true,
                'description' => __( 'Prompt to process', 'dokan-lite' ),
            ],
            'payload' => [
                'type'        => 'object',
                'required'    => false,
                'description' => __( 'Optional data payload', 'dokan-lite' ),
            ],
        ];
    }

    public function handle_request( $request ) {
        $prompt = $request->get_param( 'prompt' );
        $args = wp_parse_args(
            $request->get_param( 'payload' ), [
				'field' => '',
                'type'  => Model::SUPPORTS_TEXT,
			]
        );
        $type = $args['type'];

        // Resolve the appropriate service based on the AI engine.
		try {
            $manager     = dokan_get_container()->get( Manager::class );
            $prefix      = $type === Model::SUPPORTS_TEXT ? '' : sanitize_key( $type ) . '_';
            $provider_id = dokan_get_option( 'dokan_ai_' . $prefix . 'engine', 'dokan_ai', '' );
            $model_id    = dokan_get_option( 'dokan_ai_' . $prefix . $provider_id . '_model', 'dokan_ai', '' );

            if ( empty( $provider_id ) || empty( $model_id ) ) {
                throw new Exception(
                    esc_html__( 'AI provider or model is not configured properly.', 'dokan-lite' ),
                    400
                );
            }

            $provider     = $manager->get_provider( $provider_id );
            $model        = $provider->get_model( $model_id );
            $prompt       = PromptUtils::prepare_prompt( $args['field'], $prompt );
            $process_call = 'process_' . sanitize_key( $type );

            if ( ! method_exists( $model, $process_call ) ) {
                throw new Exception(
                    // translators: %s: type of generation.
                    sprintf( esc_html__( 'Model does not support %s generation.', 'dokan-lite' ), $type ),
                    400
                );
			}

            $response = $model->{$process_call}( $prompt, $args );

            return rest_ensure_response( $response );
        } catch ( Exception $e ) {
            if ( in_array( $e->getCode(), [ 401, 429 ], true ) ) {
                return new WP_Error(
                    'dokan_ai_service_error',
                    esc_html__( 'Something went wrong in the configuration. Kindly reach out to Marketplace Owner', 'dokan-lite' ),
                    [ 'status' => 401 ]
                );
            }
            return new WP_Error(
                'dokan_ai_service_error',
                esc_html__( 'Service is not available due to some reason. Kindly reach out to Marketplace Owner', 'dokan-lite' ),
                [ 'status' => 403 ]
            );
        }
    }
}
