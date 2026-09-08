<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Inverts `on`/`off` between legacy and new shapes.
 *
 * Used for legacy fields whose semantics are negated in the new schema —
 * e.g. legacy `disable_welcome_wizard` ↔ new `welcome_wizard`, where a
 * legacy value of `off` ("not disabled") corresponds to a new value of
 * `on` ("enabled"). Any value other than `on`/`off` is passed through
 * unchanged so unexpected stored values are not silently mutated.
 *
 * @since DOKAN_SINCE
 */
final class InvertOnOffTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        return $this->flip( $legacy_value );
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        return $this->flip( $new_value );
    }

    /**
     * @param mixed $value
     *
     * @return mixed
     */
    private function flip( $value ) {
        if ( 'on' === $value ) {
            return 'off';
        }
        if ( 'off' === $value ) {
            return 'on';
        }
        return $value;
    }
}
