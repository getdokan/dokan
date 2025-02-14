<?php

namespace WeDevs\Dokan\Intelligence\Services;

interface AIServiceInterface {
    /**
     * Process the AI request and return a response.
     *
     * @param string $prompt The input prompt for the AI.
     * @param array $args Optional additional data.
     * @return mixed The response from the AI.
     */
    public function process( string $prompt, array $args = [] );

    public static function get_models(): array;
}
