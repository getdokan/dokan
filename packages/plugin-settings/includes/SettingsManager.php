<?php

namespace WeDevs\PluginSettings;

use WeDevs\PluginSettings\Pages\AbstractPage;
use WeDevs\PluginSettings\Pages\PageInterface;

/**
 * Settings Manager Class.
 *
 * Central manager for handling settings pages and data.
 *
 * @since 1.0.0
 */
class SettingsManager {

    /**
     * Namespace identifier.
     *
     * @var string
     */
    protected string $namespace;

    /**
     * REST API namespace.
     *
     * @var string
     */
    protected string $rest_namespace;

    /**
     * Hook prefix for filters and actions.
     *
     * @var string
     */
    protected string $hook_prefix;

    /**
     * Registered settings pages.
     *
     * @var array<string, PageInterface>
     */
    protected array $pages = [];

    /**
     * Constructor.
     *
     * @param array $config Configuration options.
     */
    public function __construct( array $config = [] ) {
        $this->namespace      = $config['namespace'] ?? 'settings-framework';
        $this->rest_namespace = $config['rest_namespace'] ?? 'sf/v1';
        $this->hook_prefix    = $config['hook_prefix'] ?? 'settings_framework';
    }

    /**
     * Get namespace.
     *
     * @return string
     */
    public function get_namespace(): string {
        return $this->namespace;
    }

    /**
     * Get REST namespace.
     *
     * @return string
     */
    public function get_rest_namespace(): string {
        return $this->rest_namespace;
    }

    /**
     * Get hook prefix.
     *
     * @return string
     */
    public function get_hook_prefix(): string {
        return $this->hook_prefix;
    }

    /**
     * Register a settings page.
     *
     * @param PageInterface $page Settings page instance.
     *
     * @return static
     */
    public function register_page( PageInterface $page ): self {
        $this->pages[ $page->get_id() ] = $page;

        return $this;
    }

    /**
     * Get all registered pages.
     *
     * @return array<PageInterface>
     */
    public function get_pages(): array {
        /**
         * Filters the list of settings pages.
         *
         * @since 1.0.0
         *
         * @param array $pages Array of PageInterface instances.
         */
        $pages = apply_filters( $this->hook_prefix . '_pages', $this->pages );

        if ( ! is_array( $pages ) ) {
            return $this->pages;
        }

        // Filter and validate pages.
        $filtered_pages = array_filter(
            $pages,
            function ( $page ) {
                return $page instanceof PageInterface;
            }
        );

        // Sort by priority.
        usort(
            $filtered_pages,
            function ( $a, $b ) {
                return $a->get_priority() <=> $b->get_priority();
            }
        );

        return array_values( $filtered_pages );
    }

    /**
     * Get pages data for frontend.
     *
     * @return array
     */
    public function get_pages_data(): array {
        $pages       = $this->get_pages();
        $mapped_data = [];

        foreach ( $pages as $page ) {
            $mapped_data[] = $page->populate();
        }

        /**
         * Filters the pages data for frontend.
         *
         * @since 1.0.0
         *
         * @param array $mapped_data Array of page data.
         */
        return apply_filters( $this->hook_prefix . '_pages_data', $mapped_data );
    }

    /**
     * Save settings data.
     *
     * @param array $data Settings data to save.
     *
     * @return void
     * @throws \Exception If save fails.
     */
    public function save( array $data ): void {
        foreach ( $this->get_pages() as $page ) {
            $page_id = $page->get_id();

            if ( isset( $data[ $page_id ] ) ) {
                $page->save( $data[ $page_id ] );
            }
        }

        /**
         * Action after saving all settings.
         *
         * @since 1.0.0
         *
         * @param array $data Saved data.
         */
        do_action( $this->hook_prefix . '_settings_saved', $data );
    }

    /**
     * Get styles from all pages.
     *
     * @return array
     */
    public function get_styles(): array {
        return array_reduce(
            $this->get_pages(),
            function ( $styles, PageInterface $page ) {
                return array_merge( $styles, $page->styles() );
            },
            []
        );
    }

    /**
     * Get scripts from all pages.
     *
     * @return array
     */
    public function get_scripts(): array {
        return array_reduce(
            $this->get_pages(),
            function ( $scripts, PageInterface $page ) {
                return array_merge( $scripts, $page->scripts() );
            },
            []
        );
    }

    /**
     * Register all page assets.
     *
     * @return void
     */
    public function register_assets(): void {
        foreach ( $this->get_pages() as $page ) {
            $page->register();
        }
    }

    /**
     * Get settings from all pages.
     *
     * @return array
     */
    public function get_settings(): array {
        return array_reduce(
            $this->get_pages(),
            function ( $settings, PageInterface $page ) {
                return array_merge( $settings, [ $page->get_id() => $page->settings() ] );
            },
            []
        );
    }
}
