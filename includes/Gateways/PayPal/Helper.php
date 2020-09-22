<?php

namespace WeDevs\Dokan\Gateways\PayPal;

/**
 * Class Helper
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class Helper {

    /**
     * Get list of supported webhook events
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_supported_webhook_events() {
        return apply_filters( 'dokan_paypal_get_supported_webhook_events', [
            'CHECKOUT.ORDER.APPROVED'  => 'CheckoutOrderApproved',
            'CHECKOUT.ORDER.COMPLETED' => 'CheckoutOrderCompleted',
        ] );
    }
}
