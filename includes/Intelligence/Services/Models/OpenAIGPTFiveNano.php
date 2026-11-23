<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFiveNano extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-5-nano';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'OpenAI GPT-5 Nano', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return esc_html__( 'GPT-5 Nano is the smallest GPT-5 variant, built for ultra-low latency and high-volume text generation.', 'dokan-lite' );
    }

    /**
     * GPT-5 family models only accept the default temperature (1),
     * so drop the parent's explicit `temperature` value.
     *
     * @see https://github.com/valentinfrlch/ha-llmvision/issues/437
     *
     * @since 5.0.0
     *
     * @param string $prompt 1st prompt.
     * @param array  $args   Arguments of the prompt.
     *
     * @return array
     */
    protected function get_payload( string $prompt, array $args = [] ): array {
        $payload                = parent::get_payload( $prompt, $args );
        $payload['temperature'] = 1;

        return $payload;
    }
}
