<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;

class GeminiResponseService extends BaseAIService {
    private const BASE_URL = 'https://generativelanguage.googleapis.com/v1/';

    protected function get_url(): string {
        $model = dokan_get_option( 'dokan_ai_gemini_model', 'dokan_ai', 'gemini-1.5-flash' );
        return self::BASE_URL . 'models/' . $model . ':generateContent?key=' . $this->get_api_key();
    }

    protected function get_headers(): array {
        return [
            'Content-Type' => 'application/json',
        ];
    }

    protected function get_payload( string $prompt, array $args = [] ): array {
        if ( isset( $args['json_format'] ) ) {
            $pre_prompt = 'You are an AI assistant specializing in WooCommerce and e-commerce product.
                    Your task is to generate SEO-optimized content that helps increase sales and search rankings.

                    Always return the response in strict JSON format without any Markdown or special characters.

                    Format the response as follows:
                    {
                      "title": "<Compelling product title optimized for SEO>",
                      "short_description": "<A concise, keyword-rich summary (minimum 80-150 words) that attracts buyers and improves search engine visibility>",
                      "long_description": "<A detailed, engaging product long description including features, benefits, use cases, and persuasive copywriting techniques>"
                    }

                    Guidelines:
                    — Output language should be the same as the input language strictly matching the prompt.
                    — Using <p></p> tag for paragraphs instead of newlines.
                    — Do not use Markdown formatting (** or `#` or `>` characters).
                    — Do not include backticks (```json or ```) or any non-JSON syntax.
                    — Do not add extra commentary or explanations—only return the JSON object.
                    — Ensure readability with short sentences, bullet points, and clear formatting.
                    — Highlight key features (if need), unique selling points, and benefits.
                    — Output should be a valid JSON object with the keys: title, short_description, long_description.';

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

        // if the response it contains is ```JSON or ``` remove it
        if ( strpos( $response, '```json' ) !== false ) {
            $response = preg_replace( '/^```json(.*)```$/s', '$1', $response );
        }

        if ( isset( $args['json_format'] ) && is_string( $response ) ) {
            $response = json_decode( $response, true );
        }

        return apply_filters(
            'dokan_ai_gemini_response_json', [
				'response' => $response,
				'prompt' => $prompt,
			]
        );
    }

    public static function get_models(): array {
        // Todo: Model list should be fetched from the API
        return apply_filters(
            'dokan_ai_supported_gemini_models', [
                'gemini-1.5-flash' => __( 'Gemini 1.5 Flash', 'dokan-lite' ),
                'gemini-2.0-flash' => __( 'Gemini 2.0 Flash', 'dokan-lite' ),
                'gemini-2.0-flash-lite' => __( 'Gemini 2.0 Flash-Lite', 'dokan-lite' ),
            ]
        );
    }
}
