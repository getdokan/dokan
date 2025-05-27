<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;
use WeDevs\Dokan\Intelligence\Manager;

class EngineFactory {

    /**
     * Resolve the appropriate AI response service based on the engine name.
     *
     * @return AIServiceInterface The service instance
     *
     * @throws Exception
     */
    public static function create(): AIServiceInterface {
        $engine = dokan()->get_container()->get( Manager::class )->active_engine();
        // Sanitize and capitalize the engine name
        $engine = ucfirst( trim( $engine ) );
        // Construct the class name based on the engine
        $class_name = "WeDevs\\Dokan\\Intelligence\\Services\\{$engine}ResponseService";

        $class_name = apply_filters( 'dokan_ai_service_class', $class_name, $engine );

        // Check if the class exists and implements the AIResponseServiceInterface
        if ( class_exists( $class_name ) && is_subclass_of( $class_name, AIServiceInterface::class ) ) {
            return new $class_name();
        }

        throw new Exception(
            sprintf(
                // translators: %1$s: class name, %2$s: interface name
                esc_html__( 'Unsupported service type provided: %1$s must be an instance of %2$s', 'dokan-lite' ),
                esc_html( $class_name ),
                AIServiceInterface::class
            )
		);
    }
}
