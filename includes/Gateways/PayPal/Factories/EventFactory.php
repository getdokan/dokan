<?php

namespace WeDevs\Dokan\Gateways\PayPal\Factories;

use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\Gateways\PayPal\Abstracts\WebhookEventHandler;
use BadMethodCallException;
use WeDevs\Dokan\Gateways\PayPal\Helper;

defined( 'ABSPATH' ) || exit;

/**
 * Class EventFactory
 * @package WeDevs\Dokan\Gateways\PayPal\Factories
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class EventFactory {

    /**
     * Call the defined static methods
     *
     * @param $name
     * @param $arguments
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed
     * @throws DokanException
     */
    public static function __callStatic( $name, $arguments ) {
        try {
            if ( 'handle' !== $name ) {
                throw new BadMethodCallException( sprintf( 'The %s method is not callable.', $name ), 422 );
            }

            if ( ! empty( $arguments[0] ) ) {
                $event                          = $arguments[0];
                $webhook_event_handler_instance = self::get( $event );

                if ( $webhook_event_handler_instance instanceof WebhookEventHandler ) {
                    return $webhook_event_handler_instance->$name();
                }

                do_action( 'dokan_paypal_marketplace_events', $event, $name );
            }
        } catch ( \Exception $e ) {
            error_log( $e->getMessage() );
        }
    }

    /**
     * Create required event class instance
     *
     * @param $event
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WebhookEventHandler instance
     * @throws DokanException
     */
    public function get( $event ) {
        $events = Helper::get_supported_webhook_events();
        $class  = null;

        if ( ! array_key_exists( $event->event_type, $events ) ) {
            return;
        }

        $class = $events[ $event->event_type ];
        $class = "\\WeDevs\\Dokan\\Gateways\\PayPal\\WebhookEvents\\{$class}";

        if ( ! class_exists( $class ) ) {
            throw new DokanException(
                'dokan_paypal_unsupported_event',
                sprintf( 'This %s is not supported yet', $class ),
                422
            );
        }

        return new $class( $event );
    }
}
