<?php

namespace WeDevs\Dokan\Gateways\PayPal\Abstracts;

/**
 * Class WebhookHandler
 * @package WeDevs\Dokan\Gateways\PayPal\Interfaces
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
abstract class WebhookEventHandler {

    /**
     * Event holder
     */
    private $event;

    /**
     * Handle the event
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    abstract public function handle();

    /**
     * Set event
     *
     * @param $event
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function set_event( $event ) {
        $this->event = $event;
    }

    /**
     * Get event
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function get_event() {
        return $this->event;
    }
}
