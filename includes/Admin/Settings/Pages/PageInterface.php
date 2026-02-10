<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

interface PageInterface {

    /**
     * Get the page ID.
     *
     * @since DOKAN_SINCE
     *
     * @return string The page ID.
     */
    public function get_id(): string;

    /**
     * Get the page priority.
     *
     * @since DOKAN_SINCE
     *
     * @return int The page priority.
     */
    public function get_priority(): int;

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register();

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array;

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array;

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array;
}
