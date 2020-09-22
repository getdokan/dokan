<?php

namespace WeDevs\Dokan\Gateways\PayPal\WebhookEvents;

use WeDevs\Dokan\Gateways\PayPal\Abstracts\WebhookEventHandler;

/**
 * Class CheckoutOrderCompleted
 * @package WeDevs\Dokan\Gateways\PayPal\WebhookEvents
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class CheckoutOrderCompleted extends WebhookEventHandler {

    /**
     * CheckoutOrderCompleted constructor.
     *
     * @param $event
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct( $event ) {
        $this->set_event( $event );
    }

    /**
     * Handle checkout completed order
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle() {
        $event           = $this->get_event();
        $paypal_order_id = sanitize_text_field( $event->resource->id );
        $paypal_payer_id = sanitize_text_field( $event->resource->payer->payer_id );
        $order_id        = $event->resource->purchase_units[0]->invoice_id;
        $order           = wc_get_order( $order_id );

        $order->add_order_note(
            sprintf(
                __( 'PayPal payment completed. PayPal Order ID #%s! Payer ID: %s', 'dokan-lite' ),
                $paypal_order_id,
                $paypal_payer_id
            )
        );

        $order->payment_complete();
    }
}
