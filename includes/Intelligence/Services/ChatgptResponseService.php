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
        if ( isset( $args['json_format'] ) ) {
            array_unshift(
                $messages, [
					'role' => 'system',
					'content' => 'You are an AI assistant specializing in WooCommerce and e-commerce product descriptions.
                    Your task is to generate SEO-optimized content that helps increase sales and search rankings.
                    Always return the response in strict JSON format without any markdown or special characters.
                    Format the response as follows:
                    {
                      "title": "<Compelling product title optimized for SEO>",
                      "short_description": "<A concise, keyword-rich summary (50-100 words) that attracts buyers and improves search engine visibility>",
                      "long_description": "<A detailed, engaging product long description including features, benefits, use cases, and persuasive copywriting techniques>"
                    }

                    Guidelines:
                    - Using <p></p> tags for paragraphs instead of newlines.
                    - Do not use markdown formatting (** or `#` or `>` characters).
                    - Do not include backticks (` or ```) or any non-JSON syntax.
                    - Do not add extra commentary or explanations—only return the JSON object.
                    - Ensure readability with short sentences, bullet points, and clear formatting.
                    - Highlight key features (if need), unique selling points, and benefits.',
				],
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
				'response' => json_decode( $response['choices'][0]['message']['content'] ),
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
