<?php

namespace WeDevs\Dokan\Intelligence\Services;

class GeminiResponseService extends AbstractAIService {
    private const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    protected function load_configuration(): void {
        $this->config = [
            'temperature' => 0.7,
            'max_tokens' => (int) dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '200' ),
            'model' => dokan_get_option( 'dokan_ai_gemini_model', 'dokan_ai', 'gemini-1.5-flash' ),
        ];
    }

    /**
     * Set the API key for the service.
     * @return void
     */
    public function set_api_key(): void {
        $this->api_key = dokan_get_option( 'dokan_ai_gemini_api_key', 'dokan_ai' );
    }

    public function get_models(): array {
        return apply_filters(
            'dokan_ai_supported_gemini_models', [
                'gemini-1.5-flash' => __( 'Gemini 1.5 Flash', 'dokan-lite' ),
            ]
        );
    }

    public function process( string $prompt, $payload = null ) {
        $this->set_api_key();

        $request_data = [
            'contents' => [
                [
                    'parts' => [
                        [ 'text' => $prompt ],
                    ],
                ],
            ],
            'safetySettings' => [
                [
                    'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold' => 'BLOCK_ONLY_HIGH',
                ],
            ],
            'generationConfig' => [
                'stopSequences' => [ 'Title' ],
                'temperature' => $this->config['temperature'],
                'maxOutputTokens' => $this->config['max_tokens'],
                'topP' => 0.8,
                'topK' => 10,
            ],
        ];

        $params = [
            'url' => self::API_URL . '?key=' . $this->api_key,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'data' => $request_data,
        ];

        $response = $this->send_request( $params );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return [
            'response' => $response['candidates'][0]['content']['parts'][0]['text'] ?? '',
            'prompt' => $prompt,
        ];
    }
}
