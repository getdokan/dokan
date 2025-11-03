<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

use WeDevs\Dokan\Intelligence\Services\AITextGenerationInterface;
use WeDevs\Dokan\Intelligence\Services\Model;

class GeminiTwoDotFiveFlashLite extends Model implements AITextGenerationInterface {

    protected const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/';

	/**
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'gemini-2.5-flash-lite-preview-06-17';
	}

	/**
	 * @inheritDoc
	 */
	public function get_title(): string {
		return __( 'Gemini 2.5 Flash Lite', 'dokan-lite' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Gemini 2.5 Flash Lite is a lightweight version of the Gemini 2.5 Flash model, designed for efficient text generation with reduced resource requirements.', 'dokan-lite' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_provider_id(): string {
		return 'gemini';
	}

    /**
     * Retrieves the API url required.
     *
     * @return string The API key.
     */
    protected function get_url(): string {
        return self::BASE_URL . 'models/' . $this->get_id() . ':generateContent?key=' . $this->get_api_key();
    }

    /**
     * Retrieves the headers required for the API request.
     *
     * @return array
     */
    protected function get_headers(): array {
        return [
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Retrieves the payload required for the API request.
     *
     * @param  string  $prompt
     * @param  array  $args
     *
     * @return array
     */
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
                'topP' => 0.8,
                'topK' => 10,
                'thinkingConfig' => [
					'thinkingBudget' => 0,
				],
            ],
        ];
    }

    /**
     * @inheritDoc
     */
    public function process_text( string $prompt, array $args = [] ) {
        $this->generation_type = self::SUPPORTS_TEXT;

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
            'dokan_ai_' . $this->get_type_prefix_for_generation() . $this->get_provider_id() . '_response_json', [
                'response' => $response,
                'prompt' => $prompt,
            ]
        );
    }
}
