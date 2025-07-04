<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

use WeDevs\Dokan\Intelligence\Services\AITextGenerationInterface;
use WeDevs\Dokan\Intelligence\Services\Model;

class GeminiTwoDotFivePro extends GeminiTwoDotFiveFlashLite implements AITextGenerationInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'gemini-2.5-pro';
    }

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return __( 'Gemini 2.5 Pro', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_description(): string {
        return __( 'Gemini 2.5 Pro is an advanced AI model by Google DeepMind, designed for professional-grade text generation with enhanced capabilities.', 'dokan-lite' );
    }
}
