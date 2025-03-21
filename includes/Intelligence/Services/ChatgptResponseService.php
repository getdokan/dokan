<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;

class ChatgptResponseService extends BaseAIService {
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    protected function get_url(): string {
        return self::API_URL;
    }

    protected function get_headers(): array {
        return [
			'Authorization' => 'Bearer ' . $this->get_api_key(),
			'Content-Type' => 'application/json',
		];
    }

    protected function get_payload( string $prompt, array $args = [] ): array {
        $messages = [
            [
				'role' => 'user',
				'content' => $prompt,
			],
        ];
        if ( isset( $args['id'] ) && $args['id'] === 'post_content' ) {
            array_unshift(
                $messages, [
					'role' => 'system',
					'content' => __( 'You are a helpful assistant. The response will html content (if needed) with well-organized, detailed, formatted and clean content without "```html" this', 'dokan-lite' ),
				]
            );
        }
        return [
            'model' => dokan_get_option( 'dokan_ai_chatgpt_model', 'dokan_ai', 'gpt-3.5-turbo' ),
            'messages' => $messages,
            'max_tokens' => (int) dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '250' ),
            'temperature' => 0.7,
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
            'dokan_ai_chatgpt_response_json', [
				'response' => $response['choices'][0]['message']['content'] ?? '',
				'prompt' => $prompt,
			]
        );
    }

    public static function get_models(): array {
        // Todo: Model list should be fetched from the API
        return apply_filters(
            'dokan_ai_supported_chatgpt_models', [
                'gpt-3.5-turbo' => __( 'GPT-3.5 Turbo', 'dokan-lite' ),
                'gpt-4o-mini'   => __( 'GPT-4o Mini', 'dokan-lite' ),
            ]
        );
    }
}
