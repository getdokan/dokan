<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;

/**
 * The settings provider class.
 *
 * @since DOKAN_SINCE
 */
class Settings {

    /**
     * Settings Pages.
     *
     * @since DOKAN_SINCE
     *
     * @var array< AbstractPage >
     */
    protected array $pages = [];

    /**
     * Get all pages.
     *
     * @since DOKAN_SINCE
     *
     * @return array< AbstractPage >
     *
     * @throws \InvalidArgumentException If the step is not an instance of AbstractPage.
     */
    public function get_pages(): array {
        /**
         * Filters the list of admin settings pages.
         * Allows modification of the pages array before processing.
         * Each page must be an instance of AbstractPage.
         *
         * @since DOKAN_SINCE
         *
         * @param array $pages Array of AbstractPage instances.
         *
         * @return array Modified array of pages.
         */
        $pages = apply_filters( 'dokan_admin_settings_pages', $this->pages );

        if ( ! is_array( $pages ) ) {
            return $this->pages;
        }

        $filtered_steps = array_filter(
            $pages, function ( $step ) {
				if ( ! $step instanceof AbstractPage ) {
					throw new \InvalidArgumentException( esc_html__( 'The admin settings page must be an instance of AbstractPage.', 'dokan-lite' ) );
				}
				return true;
			}
        );

        // Sort the pages by priority.
        usort(
            $filtered_steps, function ( $a, $b ) {
				return $a->get_priority() <=> $b->get_priority();
			}
        );

        return array_values( $filtered_steps );
    }

    /**
     * Get pages mapper.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_pages_data(): array {
        $pages  = $this->get_pages();
        $mapped_pages = [];

        foreach ( $pages as $index => $page ) {
            $mapped_pages[] = $page->populate();
        }

        /**
         * Filters the pages mapped_pages array for admin settings.
         * Allows modification of the pages mapped_pages data which includes page title, ID,
         * and other relevant information.
         *
         * @since DOKAN_SINCE
         *
         * @param array $mapped_pages Array of page mapping information including title, ID,
         *                     and other details.
         *
         * @return array Modified pages mapped_pages array.
         */
        return apply_filters( 'dokan_admin_settings_pages_mapper', $mapped_pages );
    }

    /**
     * Save the pages data.
     *
     * @since DOKAN_SINCE
     *
     * @param  array  $data  The data to save.
     *
     * @throws \Exception
     */
    public function save( array $data ): void {
        foreach ( $this->get_pages() as $page ) {
            if ( isset( $data[ $page->get_id() ] ) ) {
                $page->save( $data[ $page->get_id() ] );
            }
        }
    }

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function styles(): array {
        return array_reduce(
            $this->get_pages(), function ( $styles, AbstractPage $step ) {
				return array_merge( $styles, $step->styles() );
			}, []
        );
    }

    /**
     * Get the scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function scripts(): array {
        return array_reduce(
            $this->get_pages(), function ( $scripts, AbstractPage $step ) {
				return array_merge( $scripts, $step->scripts() );
			}, []
        );
    }

    /**
     * Register the steps scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        array_map(
            function ( AbstractPage $step ) {
                $step->register();
            }, $this->get_pages()
        );
    }

    /**
     * Describe the settings options for frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function settings(): array {
        return array_reduce(
            $this->get_pages(), function ( $settings, AbstractPage $step ) {
				return array_merge( $settings, [ $step->get_id() => $step->settings() ] );
			}, []
        );
    }
}
