<?php

namespace WeDevs\Dokan\Order;

use WC_Emails;
use WC_Order;
use WP_User;
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
     * Order meta holding statuses Dokan synced while WooCommerce defers emails.
     *
     * @since DOKAN_SINCE
     */
    const SYNCED_STATUS_META = '_dokan_synced_status';

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

        // Deferred emails skip the guard above, so they are checked at send time instead.
        add_filter( 'woocommerce_email_enabled_customer_on_hold_order', [ $this, 'skip_synced_status_email' ], 10, 2 );
        add_filter( 'woocommerce_email_enabled_customer_processing_order', [ $this, 'skip_synced_status_email' ], 10, 2 );
        add_filter( 'woocommerce_email_enabled_customer_completed_order', [ $this, 'skip_synced_status_email' ], 10, 2 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'clear_synced_status' ], 1, 4 );

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
     * Flag a status Dokan is about to save onto an order, so its deferred customer email is skipped.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order  Parent order or Suborder.
     * @param string   $status Status being synced, with or without the "wc-" prefix.
     *
     * @return void
     */
    public static function flag_synced_status( WC_Order $order, string $status ) {
        $status = preg_replace( '/^wc-/', '', $status );

        if ( ! self::emails_are_deferred() || $order->get_status() === $status || ! in_array( $status, [ 'on-hold', 'processing', 'completed' ], true ) ) {
            return;
        }

        // Several syncs can land before deferred emails are sent, so keep every flagged status.
        $statuses = (array) $order->get_meta( self::SYNCED_STATUS_META );

        $order->update_meta_data( self::SYNCED_STATUS_META, array_values( array_unique( array_filter( array_merge( $statuses, [ $status ] ) ) ) ) );
    }

    /**
     * Whether WooCommerce queues transactional emails instead of sending them right away.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected static function emails_are_deferred(): bool {
        return false !== has_action( 'woocommerce_order_status_completed', [ WC_Emails::class, 'queue_transactional_email' ] );
    }

    /**
     * Disable a customer order email when Dokan synced that status onto the order.
     *
     * @since DOKAN_SINCE
     *
     * @param bool          $enabled Whether the email is enabled.
     * @param WC_Order|null $order   Order the email is for.
     *
     * @return bool
     */
    public function skip_synced_status_email( $enabled, $order ) {
        if ( ! $order instanceof WC_Order ) {
            return $enabled;
        }

        $email_statuses = [
            'woocommerce_email_enabled_customer_on_hold_order'    => 'on-hold',
            'woocommerce_email_enabled_customer_processing_order' => 'processing',
            'woocommerce_email_enabled_customer_completed_order'  => 'completed',
        ];

        $email_status = $email_statuses[ current_filter() ] ?? '';
        $statuses     = (array) $order->get_meta( self::SYNCED_STATUS_META );

        if ( ! in_array( $email_status, $statuses, true ) ) {
            return $enabled;
        }

        // Each flag skips one email, even when the email itself is disabled.
        $this->save_synced_statuses( $order, array_diff( $statuses, [ $email_status ] ) );

        return false;
    }

    /**
     * Drop the synced-status flags once the order moves to a status Dokan did not sync.
     *
     * @since DOKAN_SINCE
     *
     * @param int      $order_id   Order ID.
     * @param string   $old_status Old status.
     * @param string   $new_status New status.
     * @param WC_Order $order      Order object.
     *
     * @return void
     */
    public function clear_synced_status( $order_id, $old_status, $new_status, $order ) {
        if ( ! $order instanceof WC_Order ) {
            return;
        }

        $statuses = array_filter( (array) $order->get_meta( self::SYNCED_STATUS_META ) );

        if ( $statuses && ! in_array( $new_status, $statuses, true ) ) {
            $this->save_synced_statuses( $order, [] );
        }
    }

    /**
     * Save the remaining synced-status flags of an order.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order    Order object.
     * @param string[] $statuses Flagged statuses to keep.
     *
     * @return void
     */
    protected function save_synced_statuses( WC_Order $order, array $statuses ) {
        if ( $statuses ) {
            $order->update_meta_data( self::SYNCED_STATUS_META, array_values( $statuses ) );
        } else {
            $order->delete_meta_data( self::SYNCED_STATUS_META );
        }

        $order->save_meta_data();
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

        $seller_info = get_userdata( $seller_id );

        /*
         * A multi-vendor parent order has no vendor of its own, so
         * dokan_get_seller_id_by_order() returns 0 for it by design, and a vendor
         * account may since have been deleted. get_userdata() returns false in both
         * cases and there is no address to add.
         *
         * Without this guard the property read fatals on PHP 8 ("Attempt to read
         * property on bool"). That Error does not extend Exception, so WooCommerce's
         * catch in WC_Emails::send_transactional_email() cannot contain it, and the
         * whole cancelled-order transition is aborted — leaving sub-orders unsynced.
         */
        if ( ! $seller_info instanceof WP_User ) {
            return $recipient;
        }

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

                // Same guard as above: a deleted product or vendor gives false here.
                if ( ! $author_data instanceof WP_User ) {
                    continue;
                }

                $user_email = $author_data->user_email;

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
