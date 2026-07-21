<?php
/**
 * Plugin Name: Dokan — Vendor panel order details toggle (E2E)
 * Description: TEST-ONLY. Drives the `dokan_vendor_panel_order_details_enabled`
 *              kill-switch from a query argument so a spec can exercise both
 *              states deterministically:
 *
 *                ?dokan_panel_order_details=1  → in-panel order details
 *                ?dokan_panel_order_details=0  → legacy full-page navigation
 *
 *              Anything else leaves the shipped default alone. Driving this from
 *              the request rather than an option means there is no global state
 *              to reset between tests and no ordering coupling between specs.
 *              NOT for production use.
 *
 * @package Dokan\Tests
 */

// phpcs:disable WordPress.Security.NonceVerification.Recommended

add_filter(
    'dokan_vendor_panel_order_details_enabled',
    static function ( $enabled ) {
        if ( ! isset( $_GET['dokan_panel_order_details'] ) ) {
            return $enabled;
        }

        return '1' === sanitize_text_field( wp_unslash( $_GET['dokan_panel_order_details'] ) );
    }
);
