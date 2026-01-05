<?php

namespace WeDevs\PluginSettings\Pages;

/**
 * Page Interface.
 *
 * @since 1.0.0
 */
interface PageInterface {

    /**
     * Get the page ID.
     *
     * @return string
     */
    public function get_id(): string;

    /**
     * Get the page priority.
     *
     * @return int
     */
    public function get_priority(): int;

    /**
     * Register page hooks, scripts, and styles.
     *
     * @return void
     */
    public function register(): void;

    /**
     * Get the page scripts.
     *
     * @return array
     */
    public function scripts(): array;

    /**
     * Get the page styles.
     *
     * @return array
     */
    public function styles(): array;

    /**
     * Get settings options for frontend.
     *
     * @return array
     */
    public function settings(): array;
}

