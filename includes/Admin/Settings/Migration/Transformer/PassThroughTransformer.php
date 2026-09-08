<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Identity transformer.
 *
 * Used by {@see \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge}
 * when a field has no `legacy_transformer` attribute. Values move between
 * legacy and new shapes unchanged.
 *
 * @since DOKAN_SINCE
 */
final class PassThroughTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        return $legacy_value;
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        return $new_value;
    }
}
