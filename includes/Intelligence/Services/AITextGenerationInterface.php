<?php

namespace WeDevs\Dokan\Intelligence\Services;

interface AITextGenerationInterface {

    /**
     * Process the text prompt and return the generated response.
     *
     * @param string $prompt The input prompt for the AI model.
     * @param array $args Optional additional data.
     * @return mixed The response from the AI model.
     */
    public function process_text( string $prompt, array $args = [] );
}
