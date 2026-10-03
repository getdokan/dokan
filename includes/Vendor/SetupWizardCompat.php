<?php

namespace WeDevs\Dokan\Vendor;

/**
 * Legacy-compat seam for the setup wizard's REST save path.
 *
 * Third-party `dokan_seller_wizard_store_field_save` consumers were built for
 * the wizard's POST pipeline: they receive the SetupWizard INSTANCE and read
 * `->store_id` off it (Pro's StoreCategory, subscription), and some read raw
 * `$_POST` keys with no nonce of their own. A REST save has neither, so this
 * shim hydrates the real container singleton and overlays a scoped `$_POST`
 * bag while the action runs.
 *
 * @since DOKAN_SINCE
 */
class SetupWizardCompat {

    /**
     * Fire the legacy store-step save action the way the POST pipeline did.
     *
     * The `$_POST` bag is built mechanically from schema fields declaring a
     * `legacy_post_key` — the shim can only carry what the schema knows.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id    Vendor user ID.
     * @param array $sanitized    Sanitized values keyed by field id.
     * @param array $fields_by_id Schema field elements keyed by id.
     *
     * @return void
     */
    public function fire_store_save_action( int $vendor_id, array $sanitized, array $fields_by_id ): void {
        $bag = [];

        foreach ( $fields_by_id as $field_id => $field ) {
            if ( ! empty( $field['legacy_post_key'] ) && array_key_exists( $field_id, $sanitized ) ) {
                $bag[ (string) $field['legacy_post_key'] ] = $sanitized[ $field_id ];
            }
        }

        $this->fire( 'dokan_seller_wizard_store_field_save', $vendor_id, $bag );
    }

    /**
     * Fire the legacy payment-step save action the way the POST pipeline did.
     *
     * Pro's handlers read the nested `$_POST['settings'][<gateway>][<field>]`
     * shape (skrill email, custom method value), so the sanitized gateway map
     * is overlaid under that exact key.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor user ID.
     * @param array $methods   Sanitized gateway values keyed by gateway id.
     *
     * @return void
     */
    public function fire_payment_save_action( int $vendor_id, array $methods ): void {
        $this->fire( 'dokan_seller_wizard_payment_field_save', $vendor_id, [ 'settings' => $methods ] );
    }

    /**
     * Fire a legacy wizard action the way the POST pipeline did: the real
     * SetupWizard singleton hydrated, the `$_POST` bag overlaid.
     *
     * @since DOKAN_SINCE
     *
     * @param string $hook      Legacy action name.
     * @param int    $vendor_id Vendor user ID.
     * @param array  $bag       Key-value pairs to overlay onto `$_POST`.
     *
     * @return void
     */
    protected function fire( string $hook, int $vendor_id, array $bag ): void {
        // Hydrate the REAL singleton — consumers may type-check it, and store_id/store_info are only populated during a wizard page load.
        $wizard             = dokan()->seller_wizard;
        $wizard->store_id   = $vendor_id;
        $wizard->store_info = dokan_get_store_info( $vendor_id );

        $this->with_legacy_post_context(
            $bag,
            static function () use ( $hook, $wizard ) {
                do_action( $hook, $wizard );
            }
        );
    }

    /**
     * Run a callable with `$_POST` keys overlaid, restoring the superglobal
     * even when the callable throws.
     *
     * @since DOKAN_SINCE
     *
     * @param array    $bag      Key-value pairs to overlay onto `$_POST`.
     * @param callable $callback The code to run inside the overlaid context.
     *
     * @return mixed The callable's return value.
     */
    public function with_legacy_post_context( array $bag, callable $callback ) {
        $snapshot = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- scoped snapshot/restore, no form processing.

        foreach ( $bag as $key => $value ) {
            $_POST[ $key ] = $value;
        }

        try {
            return $callback();
        } finally {
            $_POST = $snapshot;
        }
    }
}
