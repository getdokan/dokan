<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

use Closure;

/**
 * Builds a callable transformer pair for one slot of a WordPress multicheck
 * legacy option (e.g. `dokan_withdraw.withdraw_methods`,
 * `dokan_withdraw.withdraw_order_status`).
 *
 *   legacy: [ '<slot_key>' => '<slot_key>', ... ]   // enabled = key as value
 *   new:    one boolean switch per slot, value "on" | "off"
 *
 * Each new switch field is one boolean toggle, but the legacy parent array
 * uses the WordPress multicheck convention where an enabled method stores
 * its own key as the value (`'paypal' => 'paypal'`) so downstream code can
 * read the enabled set with `array_filter` / `array_intersect`. That makes
 * the value method-aware, which prevents a single zero-arg transformer
 * class from serving every method.
 *
 * Wiring is intentionally one-line in the schema:
 *
 *     'legacy_key'         => 'dokan_withdraw.withdraw_methods.paypal',
 *     'legacy_transformer' => WithdrawMethodToggleTransformer::for_method( 'paypal' ),
 *
 * Returns a `[ 'to_new' => Closure, 'to_legacy' => Closure ]` pair that the
 * bridge wraps in a {@see CallableTransformer}. Closures are filter-safe in
 * the current pipeline (no schema persistence); switch to a dedicated class
 * per method if the schema ever gets cached to a transient.
 *
 * @since DOKAN_SINCE
 */
final class WithdrawMethodToggleTransformer {

    /**
     * Build the callable pair for one method key.
     *
     * @param string $method_key Legacy method id (e.g. "paypal", "bank",
     *                           "dokan_stripe_express").
     *
     * @return array{to_new: Closure, to_legacy: Closure}
     */
    public static function for_method( string $method_key ): array {
        return [
            'to_new'    => static function ( $legacy_value ) {
                return ! empty( $legacy_value ) ? 'on' : 'off';
            },
            'to_legacy' => static function ( $new_value ) use ( $method_key ) {
                return 'on' === $new_value ? $method_key : '';
            },
        ];
    }
}
