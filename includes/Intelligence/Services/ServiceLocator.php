<?php

namespace WeDevs\Dokan\Intelligence\Services;

use WP_Error;
use Exception;

class ServiceLocator {

    /**
     * Resolve the appropriate AI response service based on the engine name.
     *
     * @param string $engine The name of the AI engine.
     * @return AIResponseServiceInterface|WP_Error The service instance or WP_Error if not found.
     * @throws Exception
     */
    public static function resolve_service( string $engine ) {
        // Sanitize and capitalize the engine name
        $engine = ucfirst( trim( $engine ) );

        // Construct the file path for the service class
        $file_path = DOKAN_DIR . '/includes/Intelligence/Services/' . $engine . 'ResponseService.php';

        // Include the service file if it exists
        if ( file_exists( $file_path ) ) {
            require_once $file_path;
        } else {
            // Return error if the file does not exist
            return new WP_Error(
                'dokan_ai_file_not_found',
                sprintf( '%s %s', esc_html__( 'Service file not found for engine: ', 'dokan-lite' ), esc_html( $engine ) ),
                [ 'status' => 404 ]
            );
        }
        $class_name = "WeDevs\\Dokan\\Intelligence\\Services\\{$engine}ResponseService";
        // Construct the fully-qualified class name based on the engine
        $class_name = apply_filters( 'dokan_ai_service_class', $class_name, $engine );

        // Check if the class exists and implements the AIResponseServiceInterface
        if ( class_exists( $class_name ) && is_subclass_of( $class_name, AIResponseServiceInterface::class ) ) {
            return new $class_name();
        }

        throw new Exception( sprintf( '%s %s', esc_html__( 'Unsupported service type provided:', 'dokan-lite' ), esc_html( $class_name ) ) );
    }
}
