<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

use WeDevs\Dokan\Intelligence\Services\AITextGenerationInterface;
use WeDevs\Dokan\Intelligence\Services\Model;

class OpenAIGPTThreeDotFiveTurbo extends Model implements AITextGenerationInterface {

    protected const BASE_URL = 'https://api.openai.com/v1/';

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-3.5-turbo';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-3.5 Turbo', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-3.5 Turbo is a powerful language model by OpenAI, optimized for speed and cost-effectiveness.', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_provider_id(): string {
        return 'openai';
    }

    /**
     * Retrieves the API url required.
     *
     * @return string The API key.
     */
    protected function get_url(): string {
        return self::BASE_URL . 'chat/completions';
    }

    /**
     * Retrieves the headers required for the API request.
     *
     * @return array
     */
    protected function get_headers(): array {
        return [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->get_api_key(),
        ];
    }

    /**
     * Process the text prompt and return the generated response.
     *
     * @param  string  $prompt  The input prompt for the AI model.
     * @param  array  $args  Optional additional data.
     *
     * @return mixed The response from the AI model.
     */
    public function process_text( string $prompt, array $args = [] ) {
        $this->generation_type = self::SUPPORTS_TEXT;

        $response = $this->request( $prompt, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $response = $response['choices'][0]['message']['content'];

        // if response type of string
        if ( gettype( $response ) === 'string' ) {
            $response = preg_replace( '/^"(.*)"$/', '$1', $response );
        }

        return apply_filters(
            'dokan_ai_' . $this->get_type_prefix_for_generation() . $this->get_provider_id() . '_response_json', [
                'response' => isset( $args['json_format'] ) ? json_decode( $response ) : $response,
                'prompt' => $prompt,
            ]
        );
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
					'content' => 'You are an AI assistant specializing in WooCommerce and e-commerce product.
                    Your task is to generate SEO-optimized content that helps increase sales and search rankings.
                    Always return the response in strict JSON format without any markdown or special characters.
                    Format the response as follows:
                    {
                      "title": "<Compelling product title optimized for SEO>",
                      "short_description": "<A concise, keyword-rich summary (minimum 80-150 words) that attracts buyers and improves search engine visibility>",
                      "long_description": "<A detailed, engaging product long description including features, benefits, use cases, and persuasive copywriting techniques>"
                    }

                    Guidelines:
                    — Output language should be the same as the input language strictly matching the prompt.
                    — Using <p></p> tags for paragraphs instead of newlines.
                    — Do not use Markdown formatting (** or `#` or `>` characters).
                    — Do not include backticks (```json or ```) or any non-JSON syntax.
                    — Do not add extra commentary or explanations—only return the JSON object.
                    — Ensure readability with short sentences, bullet points, and clear formatting.
                    — Highlight key features (if need), unique selling points, and benefits.
                    — Output should be a valid JSON object with the keys: title, short_description, long_description.',
				],
            );
        }
        return [
            'model' => $this->get_id(),
            'messages' => $messages,
            'temperature' => 0.7,
        ];
    }
}
