<?php

namespace WeDevs\Dokan\Order;

use WC_Order;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order admin related hooks
 *
 * @since DOKAN_SINCE moved functionality from includes/Admin/Hooks.php file
 */
class EmailHooks {
    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'woocommerce_order_status_pending_to_on-hold', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_on-hold_to_processing', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_pending_to_processing', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_completed', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_failed_to_processing', [ $this, 'prevent_sending_multiple_email' ] );

        add_filter( 'woocommerce_email_recipient_cancelled_order', [ $this, 'send_email_for_order_cancellation' ], 10, 2 );
        add_filter( 'woocommerce_email_headers', [ $this, 'add_reply_to_vendor_email_on_wc_customer_note_mail' ], 10, 3 );
    }

    /**
     * Stop sending multiple email for an order
     *
     * @since 2.8.6
     * @since DOKAN_SINCE Moved this method from includes/functions.php file
     *
     * @return void
     */
    public function prevent_sending_multiple_email() {
        if ( did_action( 'woocommerce_order_status_pending_to_on-hold_notification' ) === 1 ) {
            dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_pending_to_on-hold_notification', 'WC_Email_Customer_On_Hold_Order', 'trigger', 10 );
        }

        if ( did_action( 'woocommerce_order_status_on-hold_to_processing_notification' ) === 1 ) {
            dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_on-hold_to_processing_notification', 'WC_Email_Customer_Processing_Order', 'trigger', 10 );
        }

        if ( did_action( 'woocommerce_order_status_pending_to_processing_notification' ) === 1 ) {
            dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_pending_to_processing_notification', 'WC_Email_Customer_Processing_Order', 'trigger', 10 );
        }

        if ( did_action( 'woocommerce_order_status_completed_notification' ) === 1 ) {
            dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_completed_notification', 'WC_Email_Customer_Completed_Order', 'trigger', 10 );
        }

        if ( did_action( 'woocommerce_order_status_failed_to_processing_notification' ) === 1 ) {
            dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_failed_to_processing_notification', 'WC_Email_Customer_Processing_Order', 'trigger', 10 );
        }
    }

    /**
     * Send email to the vendor/seller when cancel the order
     *
     * @since Moved this method from includes/wc-functions.php file
     *
     * @param string   $recipient
     * @param WC_Order $order
     *
     * @return string
     */
    public function send_email_for_order_cancellation( $recipient, $order ) {
        if ( ! $order instanceof WC_Order ) {
            return $recipient;
        }

        // get the order id from order object
        $seller_id = dokan_get_seller_id_by_order( $order->get_id() );

        $seller_info  = get_userdata( $seller_id );
        $seller_email = $seller_info->user_email;

        // if admin email & seller email is same
        if ( false === strpos( $recipient, $seller_email ) ) {
            $recipient .= ',' . $seller_email;
        }

        return $recipient;
    }

    /**
     * Add vendor email on customers note mail replay to
     *
     * @since DOKAN_SINCE Moved this method from includes/wc-functions.php file
     *
     * @param string   $headers
     * @param string   $id
     * @param WC_Order $order
     *
     * @return string $headers
     */
    public function add_reply_to_vendor_email_on_wc_customer_note_mail( $headers, $id, $order ) {
        if ( ! ( $order instanceof WC_Order ) ) {
            return $headers;
        }

        if ( 'customer_note' === $id ) {
            foreach ( $order->get_items( 'line_item' ) as $item ) {
                $product_id  = $item['product_id'];
                $author      = get_post_field( 'post_author', $product_id );
                $author_data = get_userdata( absint( $author ) );
                $user_email  = $author_data->user_email;

                $headers .= "Reply-to: <$user_email>\r\n";
            }
        }

        return $headers;
    }
}
