<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

use Closure;

/**
 * Builds a callable transformer pair for a `double_input` variant whose two
 * inputs each bridge to an independent scalar legacy key.
 *
 * Shapes:
 *   legacy: two separate keys (e.g. `store_banner_width`, `store_banner_height`)
 *   new:    [ 'first' => <int>, 'second' => <int> ]   // the double_input value shape
 *
 * The field's multi-mapped `legacy_key` addresses the two legacy keys under the
 * same slot names the value uses (`first` / `second`), so the reshape is a
 * straight pass-through with integer coercion and a default fallback for any
 * slot the legacy row is missing (e.g. when the Pro-injected width/height keys
 * were never saved).
 *
 *     'legacy_key' => [
 *         'first'  => 'dokan_appearance.store_banner_width',
 *         'second' => 'dokan_appearance.store_banner_height',
 *     ],
 *     'legacy_transformer' => DoubleInputTransformer::for_slots( 625, 300 ),
 *
 * Closures are filter-safe in the current pipeline (no schema persistence);
 * swap to a dedicated class if the schema ever gets cached to a transient.
 *
 * @since DOKAN_SINCE
 */
final class DoubleInputTransformer {

    /**
     * Build the callable pair for the two-input field.
     *
     * @param int    $first_default  Fallback for the first slot when the legacy
     *                              key is absent or empty.
     * @param int    $second_default Fallback for the second slot.
     * @param string $first_slot     Slot name for the first input (matches the
     *                              `double_input` value key and the `legacy_key`
     *                              slot name).
     * @param string $second_slot    Slot name for the second input.
     *
     * @return array{to_new: Closure, to_legacy: Closure}
     */
    public static function for_slots(
        int $first_default,
        int $second_default,
        string $first_slot = 'first',
        string $second_slot = 'second'
    ): array {
        $coerce = static function ( $value, int $fallback ): int {
            return ( is_numeric( $value ) ) ? (int) $value : $fallback;
        };

        return [
            'to_new'    => static function ( $legacy_values ) use ( $coerce, $first_default, $second_default, $first_slot, $second_slot ) {
                $values = is_array( $legacy_values ) ? $legacy_values : [];
                return [
                    $first_slot  => $coerce( $values[ $first_slot ] ?? null, $first_default ),
                    $second_slot => $coerce( $values[ $second_slot ] ?? null, $second_default ),
                ];
            },
            'to_legacy' => static function ( $new_value ) use ( $coerce, $first_default, $second_default, $first_slot, $second_slot ) {
                $values = is_array( $new_value ) ? $new_value : [];
                return [
                    $first_slot  => $coerce( $values[ $first_slot ] ?? null, $first_default ),
                    $second_slot => $coerce( $values[ $second_slot ] ?? null, $second_default ),
                ];
            },
        ];
    }
}
