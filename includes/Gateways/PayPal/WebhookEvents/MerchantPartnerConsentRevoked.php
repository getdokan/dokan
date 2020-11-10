<?php

namespace WeDevs\Dokan\Gateways\PayPal\WebhookEvents;

use WeDevs\Dokan\Gateways\PayPal\Abstracts\WebhookEventHandler;
use WeDevs\Dokan\Gateways\PayPal\Helper;

/**
 * Class MerchantPartnerConsentRevoked
 * @package WeDevs\Dokan\Gateways\PayPal\WebhookEvents
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class MerchantPartnerConsentRevoked extends WebhookEventHandler {

    /**
     * MerchantPartnerConsentRevoked constructor.
     *
     * @param $event
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct( $event ) {
        $this->set_event( $event );
    }

    /**
     * Handle MerchantPartnerConsentRevoked
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle() {
        $event       = $this->get_event();
        $merchant_id = sanitize_text_field( $event->resource->merchant_id );

        $user_id = Helper::get_user_id( $merchant_id );

        if ( ! $user_id ) {
            exit;
        }

        $delete_metas = [
            '_dokan_paypal_enable_for_receive_payment',
            '_dokan_paypal_payments_receivable',
            '_dokan_paypal_primary_email_confirmed',
            '_dokan_paypal_enable_for_ucc',
        ];

        foreach ( $delete_metas as $meta_key ) {
            delete_user_meta( $user_id, $meta_key );
        }
    }
}
