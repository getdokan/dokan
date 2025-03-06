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
        if ( isset( $args['json_format'] ) ) {
            $pre_prompt = 'You are an AI assistant specializing in WooCommerce and e-commerce product descriptions.
                    Your task is to generate SEO-optimized content that helps increase sales and search rankings.

                    Always return the response in strict JSON format without any markdown or special characters.

                    Format the response as follows:
                    {
                      "title": "<Compelling product title optimized for SEO>",
                      "short_description": "<A concise, keyword-rich summary (minimum 50-100 words) that attracts buyers and improves search engine visibility>",
                      "long_description": "<A detailed, engaging product long description including features, benefits, use cases, and persuasive copywriting techniques>"
                    }

                    Guidelines:
                    - Using <p></p> tags for paragraphs instead of newlines.
                    - Do not use markdown formatting (** or `#` or `>` characters).
                    - Do not include backticks (` or ```) or any non-JSON syntax.
                    - Do not add extra commentary or explanations—only return the JSON object.
                    - Ensure readability with short sentences, bullet points, and clear formatting.
                    - Highlight key features (if need), unique selling points, and benefits.';

            $prompt = $pre_prompt . PHP_EOL . $prompt;
        }
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
                // 'maxOutputTokens' => (int) dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '1000' ),
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

        $response = $response['candidates'][0]['content']['parts'][0]['text'];

        // if response type of string
        if ( gettype( $response ) === 'string' ) {
            $response = preg_replace( '/^"(.*)"$/', '$1', $response );
        }

        return apply_filters(
            'dokan_ai_gemini_response_json', [
				'response' => isset( $args['json_format'] ) ? json_decode( $response ) : $response,
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
