<?php

namespace WeDevs\Dokan\Gateways\PayPal\WebhookEvents;

use WeDevs\Dokan\Gateways\PayPal\Abstracts\WebhookEventHandler;
use WeDevs\Dokan\Gateways\PayPal\Utilities\Processor;

/**
 * Class CheckoutOrderApproved
 * @package WeDevs\Dokan\Gateways\PayPal\WebhookEvents
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class CheckoutOrderApproved extends WebhookEventHandler {
    /**
     * CheckoutOrderApproved constructor.
     *
     * @param $event
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct( $event ) {
        $this->set_event( $event );
    }

    /**
     * Handle checkout approved order
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle() {
        $event           = $this->get_event();
        $paypal_order_id = sanitize_text_field( $event->resource->id );

        $processor       = new Processor();
        $capture_payment = $processor->capture_payment( $paypal_order_id );

        if ( is_wp_error( $capture_payment ) ) {
            dokan_log( "[Dokan PayPal Marketplace] Capture Payment Error:\n" . print_r( $capture_payment, true ) );
            exit();
        }
    }
}
