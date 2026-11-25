<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Ownership guard for WooCommerce's variation AJAX handlers.
 *
 * Dokan gives the `seller` role WooCommerce's `edit_products` capability and
 * prints the admin variation nonces on the vendor dashboard, while WooCommerce
 * core's variation AJAX handlers authorize on capability and nonce only, never
 * on ownership. Without this guard a vendor can save, bulk-edit, delete, add or
 * link variations on another vendor's product (getdokan/dokan-pro#6414).
 *
 * The guard runs before WooCommerce's handler and, for a non-admin caller,
 * stops the request unless every product the handler would touch resolves to
 * the acting vendor. Store Admins keep the wp-admin product editor.
 *
 * @since DOKAN_SINCE
 */
class VariationAuthorizationGuard implements Hookable {

    /**
     * Priority 1 so the guard runs before WooCommerce's handler (priority 10).
     *
     * @since DOKAN_SINCE
     */
    public function register_hooks(): void {
        foreach ( [ 'add_variation', 'link_all_variations', 'save_variations', 'bulk_edit_variations', 'load_variations' ] as $action ) {
            add_action( "wp_ajax_woocommerce_{$action}", [ $this, 'guard_product_action' ], 1 );
        }

        add_action( 'wp_ajax_woocommerce_remove_variations', [ $this, 'guard_remove_variations' ], 1 );
    }

    /**
     * Deny a variation action that would touch a product the caller does not own.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function guard_product_action(): void {
        // Store Admins and Shop Managers edit in wp-admin — leave their flow to WooCommerce.
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        $product_ids = [];

        // The variable product the request names.
        foreach ( [ 'product_id', 'post_id' ] as $key ) {
            if ( isset( $_POST[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies its own nonce; this only adds an ownership check, and the request is denied either way.
                $product_ids[] = absint( wp_unslash( $_POST[ $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
            }
        }

        // save_variations edits each variation by id and WooCommerce never checks that its parent matches product_id, so each parent must be owned too.
        if ( isset( $_POST['variable_post_id'] ) && is_array( $_POST['variable_post_id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
            foreach ( array_map( 'absint', wp_unslash( $_POST['variable_post_id'] ) ) as $variation_id ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
                $product_ids[] = (int) wp_get_post_parent_id( $variation_id );
            }
        }

        $this->deny_unless_owner( $product_ids );
    }

    /**
     * Deny a delete request that names any variation the caller does not own.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function guard_remove_variations(): void {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies its own nonce; this only adds an ownership check.
        $variation_ids = isset( $_POST['variation_ids'] ) ? array_map( 'absint', (array) wp_unslash( $_POST['variation_ids'] ) ) : [];

        $product_ids = array_map( 'wp_get_post_parent_id', $variation_ids );

        $this->deny_unless_owner( $product_ids );
    }

    /**
     * Stop the request unless every listed product resolves to the acting vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param array $product_ids Product ids the handler would write to.
     *
     * @return void
     */
    protected function deny_unless_owner( array $product_ids ): void {
        $product_ids = array_filter( array_unique( array_map( 'absint', $product_ids ) ) );

        // Nothing identifiable to own — let WooCommerce reject it as it normally would.
        if ( empty( $product_ids ) ) {
            return;
        }

        foreach ( $product_ids as $product_id ) {
            if ( ! dokan_is_product_author( $product_id ) ) {
                // Mirrors WooCommerce's own denial response for these handlers.
                wp_die( -1 );
            }
        }
    }
}
