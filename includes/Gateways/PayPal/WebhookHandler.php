<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WeDevs\Dokan\Gateways\PayPal\Factories\EventFactory;
use WeDevs\Dokan\Gateways\PayPal\Utilities\Processor;

/**
 * Class WebhookHandler
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class WebhookHandler {

    /**
     * WebhookHandler constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->hooks();
    }

    /**
     * Init all the hooks
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function hooks() {
        add_action( 'woocommerce_api_dokan-paypal', [ $this, 'handle_events' ] );
    }

    /**
     * Handle events which are coming from PayPal
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     * @throws \WeDevs\Dokan\Exceptions\DokanException
     */
    public function handle_events() {
        $request_body = file_get_contents( 'php://input' );
        $event        = json_decode( $request_body );

        if ( ! $event ) {
            return;
        }

        dokan_log( "[Dokan PayPal Marketplace] Webhook request body:\n" . print_r( $event, true ) );

        if ( array_key_exists( $event->event_type, Helper::get_supported_webhook_events() ) ) {
            EventFactory::handle( $event );
        }
    }
}
