<?php

namespace WeDevs\Dokan\Admin\Dashboard;

/**
 * Interface Pageable.
 *
 * @package WeDevs\Dokan\Admin\Dashboard
 *
 * @since DOKAN_SINCE
 */
interface Pageable {

    /**
     * Get the ID of the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_id(): string;

    /**
     * Get the menu arguments.
     *
     * @since DOKAN_SINCE
     *
     * @param  string  $capability Menu capability.
     * @param  string  $position Menu position.
     *
     * @return array<string, string|int> An array of associative arrays with keys 'route', 'page_title', 'menu_title', 'capability', 'position'.
     */
    public function menu( string $capability, string $position ): array;

    /**
     * Get the settings values.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string,mixed> An array of settings values.
     */
    public function settings(): array;

    /**
     * Get the scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> An array of script handles.
     */
    public function scripts(): array;

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array;

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void;
}
