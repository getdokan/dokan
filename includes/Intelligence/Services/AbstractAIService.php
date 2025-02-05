<?php

namespace WeDevs\Dokan\Intelligence\Services;

use WP_Error;

abstract class AbstractAIService implements AIResponseServiceInterface {
    /**
     * @var string
     */
    protected string $api_key;

    /**
     * @var array
     */
    protected array $config;

    public function __construct() {
        $this->load_configuration();
    }

    /**
     * Load service configuration
     *
     * @return void
     */
    abstract protected function load_configuration(): void;

    public function validate_api_key(): bool {
        if ( empty( $this->api_key ) ) {
            return false;
        }
        return true;
    }

    /**
     * Make API request
     *
     * @param array $params
     * @return array|WP_Error
     */
    public function send_request( array $params ) {
        if ( ! $this->validate_api_key() ) {
            return new WP_Error(
                'missing_api_key',
                __( 'API key is not configured', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }
        // Make the request
        $response = wp_remote_post(
            $params['url'], [
				'headers' => $params['headers'],
				'body' => wp_json_encode( $params['data'] ),
                'timeout' => 60,
			]
        );

        if ( is_wp_error( $response ) ) {
            return new WP_Error(
                'ai_request_error',
                __( 'Failed to make request to AI service', 'dokan-lite' ),
                [ 'status' => 500 ]
            );
        }

        $response_body = wp_remote_retrieve_body( $response );
        $response_data = json_decode( $response_body, true );

        if ( isset( $response_data['error'] ) ) {
            return new WP_Error(
                'ai_api_error',
                $response_data['error']['message'] ?? __( 'Unknown API error', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        return $response_data;
    }
}
