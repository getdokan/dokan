<?php

namespace WeDevs\Dokan\Intelligence\REST;

use Exception;
use WeDevs\Dokan\Abstracts\DokanRESTController;
use WeDevs\Dokan\Abstracts\DokanRESTVendorController;
use WeDevs\Dokan\Intelligence\Services\EngineFactory;
use WeDevs\Dokan\Intelligence\Utils\PromptUtils;
use WP_Error;
use WP_REST_Server;


defined( 'ABSPATH' ) || exit();
class AIRequestController extends DokanRESTVendorController {
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
        $prompt  = $request->get_param( 'prompt' ) ?? '';
        $args = $request->get_param( 'payload' ) ?? [];
        $args['json_format'] = true;

        // Resolve the appropriate service based on the AI engine
		try {
            $service = EngineFactory::create();
            // Process using the dynamically resolved service
            $response = $service->process( $prompt, $args );

            return rest_ensure_response( $response );
        } catch ( Exception $e ) {
            return new WP_Error(
                'dokan_ai_service_error',
                sprintf( '%s %s', esc_html__( 'Error resolving service:', 'dokan-lite' ), esc_html( $e->getMessage() ) ),
                [ 'status' => 500 ]
            );
        }
    }
}
