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

        if ( ! is_object( $order ) ) {
            exit();
        }

        //allow if the order is pending
        if ( 'wc-pending' !== $order->get_status() && 'pending' !== $order->get_status() ) {
            return;
        }

        $order->add_order_note(
            /* translators: 1$s: Paypal order id, 2$s: Payer ID */
            sprintf( __( 'PayPal payment completed. PayPal Order ID #%1$s. Payer ID: %2$s', 'dokan-lite' ), $paypal_order_id, $paypal_payer_id )
        );

        $order->payment_complete();

        //add capture id to meta data (converting it to array because store_capture_payment_data allows array data of purchase units)
        $purchase_units = json_decode( wp_json_encode( $event->resource->purchase_units ), true );

        dokan()->payment_gateway->paypal_marketplace->store_capture_payment_data( $purchase_units, $order );

        do_action( 'dokan_paypal_capture_payment_completed', $order, $capture_payment );
    }
}
