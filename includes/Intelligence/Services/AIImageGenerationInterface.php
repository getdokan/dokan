<?php

namespace WeDevs\Dokan\Intelligence\Services;

interface AIImageGenerationInterface {

    /**
     * Process the image prompt and return the generated image.
     *
     * @param string $prompt The input prompt for the AI model.
     * @param array $args Optional additional data.
     * @return mixed The generated image from the AI model.
     */
    public function process_image( string $prompt, array $args = [] );
}
