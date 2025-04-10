<?php

namespace WeDevs\Dokan\Intelligence;

class Manager {

    public function active_engine(): string {
        return apply_filters(
            'dokan_ai_active_engine',
            dokan_get_option( 'dokan_ai_engine', 'dokan_ai', 'chatgpt' )
        );
    }

    /**
     * Get available AI engines
     *
     * @return array
     */
    public function get_engines(): array {
        return apply_filters(
            'dokan_ai_supported_engines', [
				'chatgpt' => __( 'OpenAI', 'dokan-lite' ),
				'gemini'  => __( 'Gemini', 'dokan-lite' ),
			]
        );
    }

    /**
     * Get activated AI engine
     *
     * @return bool
     */
    public function is_configured(): bool {
        $engine  = $this->active_engine();
        $engines = $this->get_engines();

        $available_engines = array_keys( $engines );
        // activated engine should be in available engines
        if ( ! in_array( $engine, $available_engines, true ) ) {
            return false;
        }

        // Activated api key
        $api_key = dokan_get_option( "dokan_ai_{$engine}_api_key", 'dokan_ai' );

        if ( empty( $api_key ) ) {
            return false;
        }
        return true;
    }
}
