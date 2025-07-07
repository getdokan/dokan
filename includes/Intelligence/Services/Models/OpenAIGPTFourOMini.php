<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFourOMini extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-4o-mini';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-4o Mini', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-4o Mini is a smaller, optimized version of the GPT-4 model by OpenAI, designed for efficiency and performance.', 'dokan-lite' );
    }
}
