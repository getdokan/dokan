<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

class OpenAIChatGPTFourO extends OpenAIGPTThreeDotFiveTurbo {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'chatgpt-4o-latest';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI ChatGPT-4o', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'ChatGPT-4o is an advanced conversational AI model by OpenAI, designed for engaging and context-aware dialogues.', 'dokan-lite' );
    }

}
