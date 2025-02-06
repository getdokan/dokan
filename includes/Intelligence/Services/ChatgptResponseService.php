<?php

namespace WeDevs\Dokan\Intelligence\Services;

class ChatgptResponseService extends AbstractAIService {
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    protected function load_configuration(): void {
        $this->config = [
            'temperature' => 0.7,
            'max_tokens' => (int) dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '200' ),
            'model' => dokan_get_option( 'dokan_ai_chatgpt_model', 'dokan_ai', 'gpt-3.5-turbo' ),
        ];
    }

    /**
     * Set the API key for the service.
     * @return void
     */
    public function set_api_key(): void {
        $this->api_key = dokan_get_option( 'dokan_ai_chatgpt_api_key', 'dokan_ai' );
    }

    public function get_models(): array {
        return apply_filters(
            'dokan_ai_supported_chatgpt_models', [
                'gpt-3.5-turbo' => __( 'GPT-3.5 Turbo', 'dokan-lite' ),
                'gpt-4o-mini'   => __( 'GPT-4o Mini', 'dokan-lite' ),
            ]
        );
    }

    public function process( string $prompt, array $payload = [] ) {
        $this->set_api_key();

        $messages = [
            [
				'role' => 'user',
				'content' => $prompt,
			],
        ];
        if ( isset( $payload['id'] ) && $payload['id'] === 'post_content' ) {
            array_unshift(
                $messages, [
					'role' => 'system',
					'content' => __( 'You are a helpful assistant. The response will html content (if needed) with well-organized, detailed, formatted and clean content without "```html" this', 'dokan-lite' ),
				]
            );
        }

        $request_data = [
            'model' => $this->config['model'],
            'messages' => $messages,
            'max_tokens' => $this->config['max_tokens'],
            'temperature' => $this->config['temperature'],
        ];

        $params = [
            'url' => self::API_URL,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'data' => $request_data,
        ];

        $response = $this->send_request( $params );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return [
            'response' => $response['choices'][0]['message']['content'] ?? '',
            'prompt' => $prompt,
        ];
    }
}
