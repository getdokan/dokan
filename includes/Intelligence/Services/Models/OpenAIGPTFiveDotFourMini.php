<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFiveDotFourMini extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-5.4-mini';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'OpenAI GPT-5.4 Mini', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return esc_html__( 'GPT-5.4 Mini is a compact variant of the GPT-5.4 family, optimized for fast, cost-efficient text generation.', 'dokan-lite' );
    }
}
