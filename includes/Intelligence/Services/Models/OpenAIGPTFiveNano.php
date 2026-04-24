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
        return __( 'OpenAI GPT-5 Nano', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-5 Nano is the smallest GPT-5 variant, built for ultra-low latency and high-volume text generation.', 'dokan-lite' );
    }
}