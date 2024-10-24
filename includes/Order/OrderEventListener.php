<?php

namespace WeDevs\Dokan\Order;

use WC_Geolocation;
use WC_Order;

class OrderEventListener {

    public function __construct() {
        add_action( 'woocommerce_trash_order', array( $this, 'after_order_trash' ), 10, 1 );
        add_action( 'woocommerce_untrash_order', array( $this, 'after_order_untrash' ), 10, 1 );
    }

    /**
     * Perform actions after an order is trashed
     *
     * @param int $order_id ID of the trashed order
     */
    public function after_order_trash( int $order_id ) {
        global $wpdb;

        $order = wc_get_order( $order_id );
        if ( ! $order instanceof WC_Order ) {
            dokan_log( "Failed to fetch order {$order_id} during trash operation." );
            return;
        }

        $status = $order->get_status( 'edit' );
        if ( strpos( $status, 'wc-' ) === false ) {
            $status = 'wc-' . $status;
        }

        // Update Dokan tables
        $wpdb->update(
            $wpdb->prefix . 'dokan_orders',
            array( 'order_status' => $status ),
            array( 'order_id' => $order_id ),
            array( '%s' ),
            array( '%d' )
        );

        $wpdb->update(
            $wpdb->prefix . 'dokan_vendor_balance',
            array( 'status' => $status ),
            array(
				'trn_id' => $order_id,
				'trn_type' => 'dokan_orders',
            ),
            array( '%s' ),
            array( '%d', '%s' )
        );

		$user_id = doka_get_current_user_id();
		if ( $user_id ) {
			$user = get_user_by( 'id', $user_id );
			$user_name = sprintf( '%s %s', $user->first_name, $user->last_name );
			$user_role = implode( ', ', $user->roles );
			$user_ip = WC_Geolocation::get_ip_address();

			dokan_log(
                sprintf(
                    'Order %d has been trashed in Dokan order and vendor balance tables by %s (%s) from IP: %s.',
                    $order_id,
                    $user_name,
                    $user_role,
                    $user_ip
                )
			);
		} else {
			dokan_log(
                sprintf(
                    'Order %d has been trashed in Dokan order and vendor balance tables by System (system).',
                    $order_id
                )
			);
		}
    }

    /**
     * Perform actions after an order is untrashed (restored)
     *
     * @param int $order_id ID of the restored order
     */
    public function after_order_untrash( int $order_id ) {
        global $wpdb;

        $order = wc_get_order( $order_id );
        if ( ! $order instanceof WC_Order ) {
            dokan_log( "Failed to fetch order {$order_id} after untrash." );
            return;
        }

        $previous_status = $order->get_status( 'edit' );
        if ( strpos( $previous_status, 'wc-' ) === false ) {
            $previous_status = 'wc-' . $previous_status;
        }

        // Update Dokan tables
        $wpdb->update(
            $wpdb->prefix . 'dokan_orders',
            array( 'order_status' => $previous_status ),
            array( 'order_id' => $order_id ),
            array( '%s' ),
            array( '%d' )
        );

        $wpdb->update(
            $wpdb->prefix . 'dokan_vendor_balance',
            array( 'status' => $previous_status ),
            array(
				'trn_id' => $order_id,
				'trn_type' => 'dokan_orders',
            ),
            array( '%s' ),
            array( '%d', '%s' )
        );

        $user_id = dokan_get_current_user_id();
        if ( $user_id ) {
            $user = get_user_by( 'id', $user_id );
            $user_name = sprintf( '%s %s', $user->first_name, $user->last_name );
            $user_role = implode( ', ', $user->roles );
            $user_ip = WC_Geolocation::get_ip_address();

            dokan_log(
                sprintf(
                    'Order %d has been restored in Dokan order and vendor balance tables by %s (%s) from IP: %s.',
                    $order_id,
                    $user_name,
                    $user_role,
                    $user_ip
                )
            );
        } else {
            dokan_log(
                sprintf(
                    'Order %d has been restored in Dokan order and vendor balance tables by System (system).',
                    $order_id
                )
            );
        }
    }
}
