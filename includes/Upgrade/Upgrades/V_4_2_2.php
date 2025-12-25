<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

defined( 'ABSPATH' ) || exit;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * Upgrader Class.
 *
 * @since 4.2.2
 */
class V_4_2_2 extends DokanUpgrader {

    /**
     * Create Vendor Onboarding page if it doesn't exist.
     *
     * @since 4.2.2
     *
     * @return void
     */
    public static function create_vendor_onboarding_page() {
        $dokan_pages = get_option( 'dokan_pages', [] );

        // Check if vendor_onboarding page already exists
        if ( isset( $dokan_pages['vendor_onboarding'] ) ) {
            $page_id = $dokan_pages['vendor_onboarding'];
            $page = get_post( $page_id );

            // If page exists and is published, skip creation
            if ( $page && 'publish' === $page->post_status ) {
                return;
            }
        }

        // Create vendor onboarding page
        $page_id = wp_insert_post(
            [
                'post_title'     => __( 'Vendor Onboarding', 'dokan-lite' ),
                'post_name'      => 'vendor-onboarding',
                'post_content'   => '[dokan-vendor-onboarding-registration]',
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'comment_status' => 'closed',
            ]
        );

        // Update dokan_pages option
        if ( $page_id && ! is_wp_error( $page_id ) ) {
            $dokan_pages['vendor_onboarding'] = $page_id;
            update_option( 'dokan_pages', $dokan_pages );
        }
    }
}
