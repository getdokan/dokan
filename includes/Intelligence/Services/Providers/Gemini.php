<?php

namespace WeDevs\Dokan\Intelligence\Services\Providers;

use WeDevs\Dokan\Intelligence\Services\Provider;

class Gemini extends Provider {

	/**
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'gemini';
	}

	/**
	 * @inheritDoc
	 */
	public function get_title(): string {
		return __( 'Gemini', 'dokan-lite' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Gemini is a cutting-edge AI model developed by Google DeepMind, designed to understand and generate human-like text with advanced capabilities.', 'dokan-lite' );
	}

	public function get_default_model_id(): string {
		return 'gemini-2.0-flash';
	}


    public function get_api_key_url(): string {
        return 'https://aistudio.google.com/app/apikey';
    }
}
