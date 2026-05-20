<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

use Closure;

/**
 * Builds a callable transformer pair for a `multicheck` variant whose option
 * slots each bridge to an independent legacy `'on'`/`'off'` switch.
 *
 *   legacy: per-slot key holds 'on' (checked) or 'off' (unchecked)
 *   new:    [ 'slot_a', 'slot_c', ... ]   // string[] of enabled slot keys
 *
 * Use this when each `multicheck` option owns its own legacy boolean address
 * (e.g. `dokan_appearance.store_map`) rather than living under a shared
 * multicheck parent. Companion to {@see MulticheckArrayTransformer}, which
 * serves the WordPress multicheck parent-array convention (key-as-value).
 *
 * Schema authors pass the slot list so `to_legacy` can clear unselected
 * slots — exactly the same factory signature as the sibling transformer:
 *
 *     'legacy_transformer' => MulticheckArrayBooleanTransformer::for_slots( [ 'store_listing' ] ),
 *
 * Closures are filter-safe in the current pipeline (no schema persistence);
 * swap to a dedicated class if the schema ever gets cached to a transient.
 *
 * @since DOKAN_SINCE
 */
final class MulticheckArrayBooleanTransformer {

    /**
     * Build the callable pair for the given slot universe.
     *
     * @param array<int,string> $slot_keys Every slot the bridge knows about.
     *                                     `to_legacy` walks this list to
     *                                     emit `'on'` for enabled slots and
     *                                     `'off'` for the rest.
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
                    if ( 'on' === $value ) {
                        $enabled[] = (string) $key;
                    }
                }
                return $enabled;
            },
            'to_legacy' => static function ( $new_value ) use ( $slot_keys ) {
                $enabled = is_array( $new_value ) ? array_map( 'strval', $new_value ) : [];
                $legacy  = [];
                foreach ( $slot_keys as $key ) {
                    $legacy[ $key ] = in_array( $key, $enabled, true ) ? 'on' : 'off';
                }
                return $legacy;
            },
        ];
    }
}
