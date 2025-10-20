<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFourTurbo extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-4-turbo';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-4 Turbo', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-4 Turbo is an advanced version of the GPT-4 model by OpenAI, optimized for speed and cost-effectiveness.', 'dokan-lite' );
    }
}
