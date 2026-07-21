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

/**
 * Stand-in for a third-party extension, enabled with `?dokan_fragment_fixture=1`.
 *
 * Exercises the two things only a browser can confirm: that render-time inline data
 * attached to an `init`-registered handle reaches the page as a real global, and that a
 * script tag embedded in the rendered markup actually executes once injected (HTML
 * assigned as a string never runs its scripts).
 */
add_action(
    'init',
    static function () {
        if ( ! isset( $_GET['dokan_fragment_fixture'] ) ) {
            return;
        }

        // Registered on `init`, not `wp_enqueue_scripts` — a REST request never reaches
        // the latter, and wp_add_inline_script() silently no-ops for unknown handles.
        wp_register_script( 'dokan-fragment-fixture', 'data:text/javascript,', [], '1.0.0', true );
    }
);

add_action(
    'dokan_order_detail_after_order_items',
    static function ( $order ) {
        if ( ! isset( $_GET['dokan_fragment_fixture'] ) ) {
            return;
        }

        wp_add_inline_script(
            'dokan-fragment-fixture',
            'window.dokanFragmentFixture = ' . wp_json_encode( [ 'orderId' => $order->get_id() ] ) . ';',
            'before'
        );

        echo '<script>window.dokanFragmentRawScriptRan = true;</script>';
    }
);
