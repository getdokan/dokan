<?php

namespace WeDevs\Dokan\Intelligence\REST;

use Exception;
use WeDevs\Dokan\Abstracts\DokanRESTController;
use WeDevs\Dokan\Intelligence\Services\EngineFactory;
use WeDevs\Dokan\Intelligence\Utils\PromptUtils;
use WP_Error;
use WP_REST_Server;


defined( 'ABSPATH' ) || exit();
class AIRequestController extends DokanRESTController {
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
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * @param $request
     * @return true
     */
    public function get_items_permissions_check( $request ): bool {
        return current_user_can( 'dokandar' );
    }

    public function get_request_args(): array {
        return [
            'prompt' => [
                'type'        => 'string',
                'required'    => true,
                'description' => __( 'Prompt to process', 'dokan-lite' ),
            ],
            'id' => [  // Added id parameter
                'type'        => 'string',
                'required'    => true,
                'description' => __( 'ID of the field for personalized prompt', 'dokan-lite' ),
            ],
            'payload' => [
                'type'        => 'array',
                'required'    => false,
                'description' => __( 'Optional data payload', 'dokan-lite' ),
            ],
        ];
    }

    public function handle_request( $request ) {
        $prompt  = $request->get_param( 'prompt' ) ?? '';
        $id      = $request->get_param( 'id' ) ?? ''; // Getting the id parameter
        $args = $request->get_param( 'payload' ) ?? [];

        $args['id'] = $id; // Adding the id parameter to the payload

        // Resolve the appropriate service based on the AI engine
		try {
            $service = EngineFactory::create();
            // Prepare the prompt using the personalized prompt based on the ID
            $prompt = PromptUtils::prepare_prompt( $id, $prompt );

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
