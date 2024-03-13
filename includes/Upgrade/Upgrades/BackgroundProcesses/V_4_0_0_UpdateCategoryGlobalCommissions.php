<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;
use WP_Term;

/**
 * Update category commission data.
 *
 * @since DOKAN_SINCE
 */
class V_4_0_0_UpdateCategoryGlobalCommissions extends DokanBackgroundProcesses {

    /**
     * Update category commission data.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Term $terms
     *
     * @return bool
     */
    public function task( $terms ) {
        if ( empty( $terms || ! is_array( $terms ) ) ) {
            return false;
        }

        foreach ( $terms as $term ) {
            $saved_shipping_tax_recipient = $term->get_meta( 'shipping_tax_fee_recipient' );
            $saved_tax_recipient = $term->get_meta( 'tax_fee_recipient' );

            if ( empty( $saved_shipping_tax_recipient ) ) {
                $term->add_meta_data( 'shipping_tax_fee_recipient', $saved_tax_recipient, true );
            }
        }

        return false;
    }
}
