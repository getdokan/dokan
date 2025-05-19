<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;
use WeDevs\Dokan\Intelligence\Manager;

abstract class BaseAIService implements AIServiceInterface {
    /**
     * Retrieves the API url required.
     *
     * @return string The API key.
     */
    abstract protected function get_url(): string;

    /**
     * Retrieves the headers required for the API request.
     *
     * @return array
     */
    abstract protected function get_headers(): array;

    /**
     * Retrieves the payload required for the API request.
     *
     * @param string $prompt
     * @param array $args
     *
     * @return array
     */
    abstract protected function get_payload( string $prompt, array $args = [] ): array;

    /**
     * Retrieves the provider.
     *
     * @return string
     */
    protected function get_provider(): string {
        return dokan()->get_container()->get( Manager::class )->active_engine();
    }

    /**
     * Retrieves the API key.
     *
     * @return string
     */
    protected function get_api_key(): string {
        return dokan_get_option( "dokan_ai_{$this->get_provider()}_api_key", 'dokan_ai' );
    }

    /**
     * Check if the API key is valid.
     *
     * @return bool
     */
    protected function is_valid_api_kay(): bool {
        if ( empty( $this->get_api_key() ) ) {
            return false;
        }
        return true;
    }

    /**
     * Make API request
     *
     * @param string $prompt
     * @param array $args
     *
     * @return array|Exception
     * @throws Exception
     */
    public function request( string $prompt, array $args = [] ) {
        if ( ! $this->is_valid_api_kay() ) {
            throw new Exception( esc_html__( 'API key is not configured', 'dokan-lite' ) );
        }
        // Make the request
        $response = wp_remote_post(
            $this->get_url(), [
				'headers' => $this->get_headers(),
				'body' => wp_json_encode( $this->get_payload( $prompt, $args ) ),
                'timeout' => 60,
			]
        );
        $codes = [
			'invalid_api_key' => 401,
			'insufficient_quota' => 429,
		];
        if ( is_wp_error( $response ) ) {
            throw new Exception( esc_html( $response->get_error_message() ), $codes[ $response->get_error_code() ] ?? 500 ); // phpcs:ignore
        }

        $response_body = wp_remote_retrieve_body( $response );
        $data = json_decode( $response_body, true );

        if ( isset( $data['error'] ) ) {
            throw new Exception( esc_html( $data['error']['message'] ), $codes[ $data['error']['code'] ] ?? 500 ); // phpcs:ignore
        }

        return $data;
    }
}
