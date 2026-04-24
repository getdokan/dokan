<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFourDotOneMini extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-4.1-mini';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-4.1 Mini', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-4.1 Mini is a compact GPT-4.1 variant optimized for efficient, high-quality text generation at lower cost.', 'dokan-lite' );
    }
}
