<?php

namespace WeDevs\PluginSettings\Pages;

use WeDevs\PluginSettings\Abstracts\Settings;

/**
 * Abstract Page Class.
 *
 * @since 1.0.0
 */
abstract class AbstractPage extends Settings implements PageInterface {

    /**
     * The page ID.
     *
     * @var string
     */
    protected string $id = '';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * The page type.
     *
     * @var string
     */
    protected string $type = 'page';

    /**
     * Filter name for registering pages.
     *
     * @var string
     */
    protected string $pages_filter = 'settings_framework_pages';

    /**
     * Get the page ID.
     *
     * @return string
     */
    public function get_id(): string {
        return $this->id;
    }

    /**
     * Get the page priority.
     *
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Set the page priority.
     *
     * @param int $priority Priority value.
     *
     * @return static
     */
    public function set_priority( int $priority ): self {
        $this->priority = $priority;

        return $this;
    }

    /**
     * Set the pages filter name.
     *
     * @param string $filter Filter name.
     *
     * @return static
     */
    public function set_pages_filter( string $filter ): self {
        $this->pages_filter = $filter;

        return $this;
    }

    /**
     * Register the page scripts and styles.
     *
     * @return void
     */
    public function register(): void {
        // Override in child classes.
    }

    /**
     * Get the page scripts.
     *
     * @return array
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @return array
     */
    public function styles(): array {
        return [];
    }

    /**
     * Get settings options for frontend.
     *
     * @return array
     */
    public function settings(): array {
        return [];
    }

    /**
     * Register hooks for the page.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( $this->pages_filter, [ $this, 'enlist' ] );
    }

    /**
     * Enlist the page in the settings pages.
     *
     * @param array $pages Existing pages.
     *
     * @return array
     */
    public function enlist( array $pages ): array {
        $pages[ $this->get_id() ] = $this;

        return $pages;
    }
}

