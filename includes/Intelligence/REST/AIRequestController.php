<?php

namespace WeDevs\Dokan\Intelligence\REST;

use Throwable;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\AIModelInterface;
use WeDevs\Dokan\Intelligence\Services\AIProviderInterface;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\Intelligence\Services\Provider;
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
        $args   = wp_parse_args(
            (array) $request->get_param( 'payload' ), [
				'field' => '',
                'type'  => Model::SUPPORTS_TEXT,
			]
        );

        // The payload schema declares no properties, so coerce before any string API touches these.
        $type = is_scalar( $args['type'] ) ? sanitize_key( (string) $args['type'] ) : '';
        $type = '' !== $type ? $type : Model::SUPPORTS_TEXT;

        $args['type']  = $type;
        $args['field'] = is_scalar( $args['field'] ) ? (string) $args['field'] : '';

        // Resolve the appropriate service based on the AI engine.
		try {
            $manager = dokan_get_container()->get( Manager::class );

            // Image generation is billed to the marketplace owner, so the admin toggle must hold at the API too.
            if ( Model::SUPPORTS_IMAGE === $type && 'on' !== dokan_get_option( 'dokan_ai_image_gen_availability', 'dokan_ai', 'off' ) ) {
                return $this->configuration_error( __( 'AI image generation is not enabled for this marketplace.', 'dokan-lite' ) );
            }

            // active_engine() falls back to openai, so emptiness alone no longer proves a working setup.
            if ( ! $manager->is_configured( $type ) ) {
                return $this->configuration_error( __( 'AI is not configured for this marketplace. Kindly reach out to Marketplace Owner.', 'dokan-lite' ) );
            }

            $prefix      = $manager->get_type_prefix( $type );
            $provider_id = $manager->active_engine( $type );
            $model_id    = dokan_get_option( 'dokan_ai_' . $prefix . $provider_id . '_model', 'dokan_ai', '' );
            $provider    = $manager->get_provider( $provider_id );

            if ( ! $provider instanceof AIProviderInterface ) {
                return $this->configuration_error( __( 'The configured AI provider is no longer available. Kindly reach out to Marketplace Owner.', 'dokan-lite' ) );
            }

            $model_id = is_scalar( $model_id ) ? (string) $model_id : '';

            // A model id saved before the provider retired that model must not break generation.
            $model = $provider instanceof Provider
                ? $provider->resolve_model( $type, $model_id )
                : $provider->get_model( $model_id );

            if ( ! $model instanceof AIModelInterface ) {
                return $this->configuration_error(
                    // translators: %s: type of generation.
                    sprintf( __( 'No AI model is available for %s generation. Kindly reach out to Marketplace Owner.', 'dokan-lite' ), $type )
                );
            }

            $process_call = 'process_' . $type;

            if ( ! method_exists( $model, $process_call ) ) {
                return $this->configuration_error(
                    // translators: %s: type of generation.
                    sprintf( __( 'Model does not support %s generation.', 'dokan-lite' ), $type )
                );
			}

            $response = $model->{$process_call}( PromptUtils::prepare_prompt( $args['field'], $prompt ), $args );

            return rest_ensure_response( $response );
        } catch ( Throwable $e ) {
            dokan_log( 'AI generation request failed: ' . $e->getMessage(), 'error' );

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

    /**
     * Build a misconfiguration error response.
     *
     * @since DOKAN_SINCE
     *
     * @param string $message Human readable reason.
     *
     * @return WP_Error
     */
    protected function configuration_error( string $message ): WP_Error {
        return new WP_Error( 'dokan_ai_not_configured', esc_html( $message ), [ 'status' => 400 ] );
    }
}
