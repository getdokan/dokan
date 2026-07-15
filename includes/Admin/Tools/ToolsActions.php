<?php

namespace WeDevs\Dokan\Admin\Tools;

/**
 * Shared service hosting the free admin Tools actions.
 *
 * The same logic backs both the REST controller (React dashboard) and the AJAX
 * handlers (legacy Vue admin), so a tool behaves identically across both UIs.
 *
 * @since 5.0.9
 */
class ToolsActions {

    /**
     * Default Dokan pages the "Installation Guide" tool ensures exist.
     *
     * @since 5.0.9
     *
     * @return array<int, array<string, string>>
     */
    protected function get_default_pages(): array {
        return [
            [
                'post_title' => __( 'Dashboard', 'dokan-lite' ),
                'slug'       => 'dashboard',
                'page_id'    => 'dashboard',
                'content'    => '[dokan-dashboard]',
            ],
            [
                'post_title' => __( 'Store List', 'dokan-lite' ),
                'slug'       => 'store-listing',
                'page_id'    => 'store_listing',
                'content'    => '[dokan-stores]',
            ],
            [
                'post_title' => __( 'My Orders', 'dokan-lite' ),
                'slug'       => 'my-orders',
                'page_id'    => 'my_orders',
                'content'    => '[dokan-my-orders]',
            ],
            [
                'post_title' => __( 'Vendor Onboarding', 'dokan-lite' ),
                'slug'       => 'vendor-onboarding',
                'page_id'    => 'vendor_onboarding',
                'content'    => '[dokan-vendor-onboarding-registration]',
            ],
        ];
    }

    /**
     * Create any missing Dokan default pages.
     *
     * Unlike the installer (which bails once `dokan_pages_created` is set), this
     * recreates only the pages that are actually missing, so an admin can recover
     * an accidentally-deleted page from the Tools screen at any time.
     *
     * @since 5.0.9
     *
     * @return array
     */
    public function create_default_pages() {
        $dokan_pages = get_option( 'dokan_pages', [] );
        $dokan_pages = is_array( $dokan_pages ) ? $dokan_pages : [];

        foreach ( $this->get_default_pages() as $page ) {
            $existing_id = isset( $dokan_pages[ $page['page_id'] ] ) ? absint( $dokan_pages[ $page['page_id'] ] ) : 0;

            // Already tracked and still a live page; nothing to do.
            if ( $existing_id && 'page' === get_post_type( $existing_id ) && 'trash' !== get_post_status( $existing_id ) ) {
                continue;
            }

            // A page with the same slug already exists; adopt it instead of duplicating.
            $existing_page = get_page_by_path( $page['slug'] );
            if ( $existing_page ) {
                $dokan_pages[ $page['page_id'] ] = $existing_page->ID;
                continue;
            }

            $page_id = wp_insert_post(
                [
                    'post_title'     => $page['post_title'],
                    'post_name'      => $page['slug'],
                    'post_content'   => $page['content'],
                    'post_status'    => 'publish',
                    'post_type'      => 'page',
                    'comment_status' => 'closed',
                ]
            );

            if ( $page_id && ! is_wp_error( $page_id ) ) {
                $dokan_pages[ $page['page_id'] ] = $page_id;
            }
        }

        update_option( 'dokan_pages', $dokan_pages );
        update_option( 'dokan_pages_created', 1 );
        flush_rewrite_rules();

        return [
            'message' => __( 'All the default pages has been created!', 'dokan-lite' ),
        ];
    }

    /**
     * Whether the Dokan default pages have already been created.
     *
     * @since 5.0.9
     *
     * @return array
     */
    public function check_all_dokan_pages_exists() {
        return [
            'all_pages_exists' => get_option( 'dokan_pages_created', false ) ? '1' : '0',
        ];
    }

    /**
     * Clear all Dokan-related caches (transients + object cache).
     *
     * Removes Dokan's DB transients (cached data, group version markers and their
     * timeouts) so installs without a persistent object cache are trimmed, then
     * flushes the object cache so data held in a persistent backend (Redis/Memcached)
     * is rebuilt on demand.
     *
     * @since 5.0.9
     *
     * @return array
     */
    public function clear_dokan_caches() {
        global $wpdb;

        $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                $wpdb->esc_like( '_transient_dokan_' ) . '%',
                $wpdb->esc_like( '_transient_timeout_dokan_' ) . '%'
            )
        );

        wp_cache_flush();

        /**
         * Fires after all Dokan caches have been cleared from the admin Tools page.
         *
         * @since 5.0.9
         */
        do_action( 'dokan_caches_cleared' );

        return [
            'process' => 'success',
            'message' => __( 'Dokan caches have been cleared successfully.', 'dokan-lite' ),
        ];
    }
}
