<?php

namespace WeDevs\Dokan\Intelligence\Services\Providers;

use WeDevs\Dokan\Intelligence\Services\Provider;

class OpenAI extends Provider {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'openai';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'OpenAI', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'OpenAI is a leading AI research and deployment company, known for its advanced language models and AI technologies.', 'dokan-lite' );
    }

    public function get_default_model_id(): string {
        return 'gpt-3.5-turbo';
    }

    public function get_api_key_url(): string {
        return 'https://platform.openai.com/api-keys';
    }
}
