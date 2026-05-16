<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration\Fixtures;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\TransformerInterface;

/**
 * Test-only transformer that reverses string payloads — used to verify the
 * bridge dispatches the configured transformer in both directions.
 */
final class ReverseStringTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        return is_string( $legacy_value ) ? strrev( $legacy_value ) : $legacy_value;
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        return is_string( $new_value ) ? strrev( $new_value ) : $new_value;
    }
}
