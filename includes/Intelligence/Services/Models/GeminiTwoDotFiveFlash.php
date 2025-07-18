<?php

namespace WeDevs\Dokan\Intelligence\Services\Models;

use WeDevs\Dokan\Intelligence\Services\AITextGenerationInterface;
use WeDevs\Dokan\Intelligence\Services\Model;

class GeminiTwoDotFiveFlash extends GeminiTwoDotFiveFlashLite implements AITextGenerationInterface {

	/**
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'gemini-2.5-flash';
	}

	/**
	 * @inheritDoc
	 */
	public function get_title(): string {
		return __( 'Gemini 2.5 Flash', 'dokan-lite' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Gemini 2.5 Flash is a powerful AI model by Google DeepMind, designed to deliver high-speed and efficient text generation with advanced capabilities.', 'dokan-lite' );
	}
}
