<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIGPTFiveMini extends OpenAIGPTFiveNano {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gpt-5-mini';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'OpenAI GPT-5 Mini', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return esc_html__( 'GPT-5 Mini is a lightweight variant of the GPT-5 family, balancing speed and cost for general-purpose text generation.', 'dokan-lite' );
    }
}
