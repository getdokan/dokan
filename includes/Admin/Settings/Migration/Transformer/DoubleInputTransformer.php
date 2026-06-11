<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Bridges a `double_input` field whose two inputs each map to an independent
 * scalar legacy key.
 *
 * Shapes:
 *   legacy: two separate keys (e.g. `store_banner_width`, `store_banner_height`)
 *   new:    [ 'first' => <int>, 'second' => <int> ]   // the double_input value shape
 *
 * The field's multi-mapped `legacy_key` addresses the two legacy keys under the
 * same slot names the value uses (`first` / `second`), so the reshape is a
 * straight pass-through with integer coercion and a default fallback for any
 * slot the legacy row is missing (e.g. when the Pro-injected width/height keys
 * were never saved). Both directions share the same shape, so the conversion is
 * symmetric.
 *
 *     'legacy_key' => [
 *         'first'  => 'dokan_appearance.store_banner_width',
 *         'second' => 'dokan_appearance.store_banner_height',
 *     ],
 *     'legacy_transformer' => DoubleInputTransformer::class,
 *
 * @since DOKAN_SINCE
 */
final class DoubleInputTransformer implements TransformerInterface {

    /**
     * Default store banner width when the legacy `first` slot is missing.
     */
    const FIRST_DEFAULT = 625;

    /**
     * Default store banner height when the legacy `second` slot is missing.
     */
    const SECOND_DEFAULT = 300;

    /**
     * {@inheritDoc}
     *
     * @param array<string,mixed>|null $legacy_value
     *
     * @return array{first:int,second:int}
     */
    public function to_new( $legacy_value ) {
        return $this->reshape( $legacy_value );
    }

    /**
     * {@inheritDoc}
     *
     * @param array<string,mixed>|null $new_value
     *
     * @return array{first:int,second:int}
     */
    public function to_legacy( $new_value ) {
        return $this->reshape( $new_value );
    }

    /**
     * Coerce both slots to integers, falling back to the slot default.
     *
     * Legacy and new share the same `first`/`second` slot shape, so the
     * conversion is symmetric and both directions reuse this method.
     *
     * @param mixed $value
     *
     * @return array{first:int,second:int}
     */
    private function reshape( $value ): array {
        $values = is_array( $value ) ? $value : [];

        return [
            'first'  => is_numeric( $values['first'] ?? null ) ? (int) $values['first'] : self::FIRST_DEFAULT,
            'second' => is_numeric( $values['second'] ?? null ) ? (int) $values['second'] : self::SECOND_DEFAULT,
        ];
    }
}
