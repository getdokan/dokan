<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\Intelligence\Assets;
use WeDevs\Dokan\Intelligence\Admin\Settings;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\Models\GeminiTwoDotFiveFlash;
use WeDevs\Dokan\Intelligence\Services\Models\GeminiTwoDotFiveFlashLite;
use WeDevs\Dokan\Intelligence\Services\Models\GeminiTwoDotFivePro;
use WeDevs\Dokan\Intelligence\Services\Models\OpenAIChatGPTFourO;
use WeDevs\Dokan\Intelligence\Services\Models\OpenAIGPTFourO;
use WeDevs\Dokan\Intelligence\Services\Models\OpenAIGPTFourOMini;
use WeDevs\Dokan\Intelligence\Services\Models\OpenAIGPTThreeDotFiveTurbo;
use WeDevs\Dokan\Intelligence\Services\Providers\Gemini;
use WeDevs\Dokan\Intelligence\Services\Providers\OpenAI;

class IntelligenceServiceProvider extends BaseServiceProvider {
    /**
     * Tags for services added to the container.
     */
    protected $tags = [ 'intelligence-service' ];

	protected $services = [
        Assets::class,
        Manager::class,
        Settings::class,
        OpenAI::class,
        Gemini::class,
        GeminiTwoDotFiveFlash::class,
        GeminiTwoDotFivePro::class,
        GeminiTwoDotFiveFlashLite::class,
        OpenAIGPTThreeDotFiveTurbo::class,
        OpenAIGPTFourOMini::class,
        OpenAIGPTFourO::class,
        OpenAIChatGPTFourO::class,
    ];

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
