<?php

namespace WeDevs\Dokan\Order;

use WC_Order;
use WeDevs\Dokan\FakeMailer;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order admin related hooks
 *
 * @since 3.8.0 moved functionality from includes/Admin/Hooks.php file
 */
class EmailHooks {
    /**
     * Class constructor
     *
     * @since 3.8.0
     */
    public function __construct() {
        add_action( 'woocommerce_order_status_pending_to_on-hold', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_on-hold_to_processing', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_pending_to_processing', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_completed', [ $this, 'prevent_sending_multiple_email' ] );
        add_action( 'woocommerce_order_status_failed_to_processing', [ $this, 'prevent_sending_multiple_email' ] );

        add_filter( 'woocommerce_email_recipient_cancelled_order', [ $this, 'send_email_for_order_cancellation' ], 10, 2 );
        add_filter( 'woocommerce_email_headers', [ $this, 'add_reply_to_vendor_email_on_wc_customer_note_mail' ], 10, 3 );

        add_action( 'phpmailer_init', [ $this, 'exclude_child_customer_receipt' ] );
    }

    /**
     * Stop sending multiple email for an order
     *
     * @since 2.8.6
     * @since 3.8.0 Moved this method from includes/functions.php file
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
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
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
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
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

    /**
     * Exclude child order emails for customers
     *
     * A hacky and dirty way to do this from this action. Because there is no easy
     * way to do this by removing action hooks from WooCommerce. It would be easier
     * if they were from functions. Because they are added from classes, we can't
     * remove those action hooks. That's why we are doing this from the phpmailer_init action
     * by returning a fake phpmailer class.
     *
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
     *
     * @param \PHPMailer $phpmailer
     *
     * @return void
     */
    public function exclude_child_customer_receipt( $phpmailer ) {
        $subject = $phpmailer->Subject; ////phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

        // order receipt
        $sub_receipt  = __( 'Your {site_title} order receipt from {order_date}', 'dokan-lite' );
        $sub_download = __( 'Your {site_title} order from {order_date} is complete', 'dokan-lite' );

        $sub_receipt  = str_replace(
            [
                '{site_title}',
                '{order_date}',
            ], [ wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), '' ], $sub_receipt
        );
        $sub_download = str_replace(
            [
                '{site_title}',
                '{order_date} is complete',
            ], [ wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ), '' ], $sub_download
        );

        // not a customer receipt mail
        if ( ( stripos( $subject, $sub_receipt ) === false ) && ( stripos( $subject, $sub_download ) === false ) ) {
            return;
        }

        $message = $phpmailer->Body; //phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
        $pattern = '/Order: #(\d+)/';
        preg_match( $pattern, $message, $matches );

        if ( isset( $matches[1] ) ) {
            $order_id = $matches[1];
            $order    = wc_get_order( $order_id );

            // we found a child order
            if ( $order && $order->post_parent !== 0 ) {
                $phpmailer = new FakeMailer();
            }
        }
    }
}
