<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;

class GeminiResponseService extends BaseAIService {
    private const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    protected function get_url(): string {
        return self::API_URL . '?key=' . $this->get_api_key();
    }

    protected function get_headers(): array {
        return [
            'Content-Type' => 'application/json',
        ];
    }

    protected function get_payload( string $prompt, array $args = [] ): array {
        return [
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
                'temperature' => 0.7,
                'maxOutputTokens' => (int) dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '250' ),
                'topP' => 0.8,
                'topK' => 10,
            ],
        ];
    }

    /**
     * Process the request
     *
     * @param string $prompt
     * @param array $args
     *
     * @return array|Exception|mixed|null
     * @throws Exception
     */
    public function process( string $prompt, array $args = [] ) {
        $response = $this->request( $prompt, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return apply_filters(
            'dokan_ai_gemini_response_json', [
				'response' => $response['candidates'][0]['content']['parts'][0]['text'] ?? '',
				'prompt' => $prompt,
			]
        );
    }

    public static function get_models(): array {
        // Todo: Model list should be fetched from the API
        return apply_filters(
            'dokan_ai_supported_gemini_models', [
                'gemini-1.5-flash' => __( 'Gemini 1.5 Flash', 'dokan-lite' ),
            ]
        );
    }
}
