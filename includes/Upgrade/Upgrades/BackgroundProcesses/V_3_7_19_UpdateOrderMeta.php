<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Set additional order meta `shipping_tax_fee_recipient`.
 *
 * @since 3.7.19
 */
class V_3_7_19_UpdateOrderMeta extends DokanBackgroundProcesses {

    /**
     * Save order meta `shipping_tax_fee_recipient`.
     *
     * @param array $orders
     *
     * @since 3.7.19
     *
     * @return bool
     */
    public function task( $orders ) {
        if ( empty( $orders || ! is_array( $orders ) ) ) {
            return false;
        }

        foreach ( $orders as $order ) {
            /**
             * @var \WC_Order $order Order.
             */
            if ( ! empty( $order->get_meta( 'has_sub_order' ) ) ) {
				continue;
            }

            $saved_shipping_tax_recipient = $order->get_meta( 'shipping_tax_fee_recipient' );
            $saved_tax_recipient = $order->get_meta( 'tax_fee_recipient' );

            if ( empty( $saved_shipping_tax_recipient ) ) {
                $order->add_meta_data( 'shipping_tax_fee_recipient', $saved_tax_recipient, true );
            }
        }

        return false;
    }
}
