<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFiveDotFourNano extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-5.4-nano';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI GPT-5.4 Nano', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'GPT-5.4 Nano is the smallest GPT-5.4 variant, tuned for ultra-low latency and high-throughput workloads.', 'dokan-lite' );
    }
}
