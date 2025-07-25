<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFourO extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-4o';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-4o', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-4o is a powerful language model by OpenAI, designed for advanced text generation and understanding.', 'dokan-lite' );
    }
}
