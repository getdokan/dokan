<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Maps the pre-4.0.2 `on`/`off` enable-selling values to `automatically`/`manually`.
 *
 * Sites that never re-saved the setting since 4.0.2 still store `on`/`off`, which
 * matches no option of the `vendor_auto_enable_selling` radio, so nothing showed
 * as selected. Mirrors {@see \WeDevs\Dokan\Utilities\AdminSettings::get_new_seller_enable_selling_status()}.
 *
 * @since 5.3.0
 */
final class EnableSellingStatusTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        if ( 'on' === $legacy_value ) {
            return 'automatically';
        }
        if ( 'off' === $legacy_value ) {
            return 'manually';
        }
        return $legacy_value;
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        // Every legacy reader goes through get_new_seller_enable_selling_status(), which accepts the new statuses.
        return $new_value;
    }
}
