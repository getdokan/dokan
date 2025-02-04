<?php

namespace WeDevs\Dokan\Intelligence\Services;

interface AIResponseServiceInterface {
    /**
     * Process the AI request and return a response.
     *
     * @param string $prompt The input prompt for the AI.
     * @param mixed $payload Optional additional data.
     * @return mixed The response from the AI.
     */
    public function process( string $prompt, $payload = null );

    public function send_request( array $params );

    public function set_api_key(): void;

    public function get_models(): array;

    public function validate_api_key(): bool;
}
