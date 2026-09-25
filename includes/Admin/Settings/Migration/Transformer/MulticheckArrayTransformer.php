<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

use Closure;

/**
 * Builds a callable transformer pair for a `multicheck` variant that bridges to
 * a WordPress multicheck legacy option.
 *
 *   legacy: [ 'wc-completed' => 'wc-completed', 'wc-processing' => '', ... ]
 *   new:    [ 'wc-completed', ... ]   // string[] of enabled keys (multicheck shape)
 *
 * Plugin-ui's `multicheck` field stores enabled keys as an array, not as a
 * `Record<key, bool>`. So `to_legacy` cannot infer the disabled set from the
 * new value alone — it needs the full slot universe up front so it can emit
 * empty strings for unselected slots and clear them on the legacy side.
 *
 * Schema authors pass the slot list from the same source that drives the
 * field's `options` and `legacy_key`:
 *
 *     'legacy_transformer' => MulticheckArrayTransformer::for_slots( array_keys( $statuses ) ),
 *
 * The returned pair is a `[ 'to_new' => Closure, 'to_legacy' => Closure ]` array
 * that the bridge wraps in a {@see CallableTransformer}. Closures are
 * filter-safe in the current pipeline (no schema persistence); if the schema
 * ever gets cached to a transient, swap to a dedicated class.
 *
 * Companion to {@see MulticheckSlotTransformer}, which serves the
 * `Record<key, bool>` shape used by `info_preview` / `multi_switch`-style fields.
 *
 * @since DOKAN_SINCE
 */
final class MulticheckArrayTransformer {

    /**
     * Build the callable pair for the given slot universe.
     *
     * @param array<int,string> $slot_keys Every legacy slot the field is
     *                                     bridged to. Order doesn't matter;
     *                                     used only as a complete set so
     *                                     `to_legacy` can clear unselected
     *                                     slots.
     *
     * @return array{to_new: Closure, to_legacy: Closure}
     */
    public static function for_slots( array $slot_keys ): array {
        $slot_keys = array_values( array_map( 'strval', $slot_keys ) );

        return [
            'to_new'    => static function ( $legacy_slots ) {
                $slots   = is_array( $legacy_slots ) ? $legacy_slots : [];
                $enabled = [];
                foreach ( $slots as $key => $value ) {
                    if ( ! empty( $value ) ) {
                        $enabled[] = (string) $key;
                    }
                }
                return $enabled;
            },
            'to_legacy' => static function ( $new_value ) use ( $slot_keys ) {
                $enabled = is_array( $new_value ) ? array_map( 'strval', $new_value ) : [];
                $legacy  = [];
                foreach ( $slot_keys as $key ) {
                    $legacy[ $key ] = in_array( $key, $enabled, true ) ? $key : '';
                }
                return $legacy;
            },
        ];
    }
}
