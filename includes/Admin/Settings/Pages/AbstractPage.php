<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Abstracts\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * The abstract page class.
 */
abstract class AbstractPage extends Settings implements PageInterface, Hookable {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = '';

    protected int $priority = 100;

    protected $type = 'page';

    /**
     * Get the page ID.
     *
     * @since DOKAN_SINCE
     *
     * @return string The page ID.
     */
    public function get_id(): string {
        return $this->id;
    }

    /**
     * Get the page priority.
     *
     * @since DOKAN_SINCE
     *
     * @return int The page priority.
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    abstract public function register();

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    abstract public function scripts(): array;

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    abstract public function styles(): array;

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    abstract public function settings(): array;

    /**
     * Register the hooks for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_settings_pages', [ $this, 'enlist' ] );
    }

    /**
     * Enlist the page in the settings pages.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings pages.
     */
    public function enlist( array $pages ): array {
        $pages[ $this->get_id() ] = $this;

        return $pages;
    }
}
