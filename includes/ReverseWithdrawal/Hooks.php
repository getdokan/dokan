<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Hooks
 *
 * @since DOKAN_SINCE
 */
class Hooks {
    /**
     * Hooks constructor.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function __construct() {
        // after order status changed
        add_action( 'woocommerce_order_status_changed', [ $this, 'process_order_status_changed' ], 10, 3 );

        // vendor dashboard navigation url
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_reverse_withdrawal_nav' ], 10, 2 );
    }

    /**
     * Process order status changed
     *
     * @since DOKAN_SINCE
     *
     * @param string $order_id
     * @param string $old_status
     * @param string $new_status
     *
     * @return void
     */
    public function process_order_status_changed( $order_id, $old_status, $new_status ) {
        if ( $old_status === $new_status ) {
            return;
        }

        // return if order status is not completed
        if ( 'completed' !== $new_status ) {
            return;
        }

        // check if reverse withdrawal setting is enabled
        if ( ! Settings::is_enabled() ) {
            return;
        }

        // get order object from order id
        $order = wc_get_order( $order_id );

        // return if order is not exist
        if ( ! $order ) {
            return;
        }

        // check if order payment gateway is enabled for reverse withdrawal
        if ( ! Settings::is_gateway_enabled_for_reverse_withdrawal( $order->get_payment_method() ) ) {
            return;
        }

        // if order has suborder, return
        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        $manager = new Manager();

        // check if reverse withdrawal is already inserted for this order
        if ( $manager->is_reverse_withdrawal_added( $order_id ) ) {
            return;
        }

        // finally, insert reverse withdrawal entry
        // get admin commission amount
        $admin_commission = dokan()->commission->get_earning_by_order( $order_id, 'admin' );

        $data = [
            'trn_id'    => $order->get_id(),
            'trn_type'  => 'order_commission',
            'vendor_id' => dokan_get_seller_id_by_order( $order->get_id() ),
            'debit'     => $admin_commission,
        ];
        // insert reverse withdrawal entry
        $manager->insert( $data );
    }

    /**
     * Add reverse withdrawal nav
     *
     * @since DOKAN_SINCE
     *
     * @param array $urls
     *
     * @return array
     */
    public function add_reverse_withdrawal_nav( $urls ) {
        if ( Settings::is_enabled() ) {
            $urls['reverse-withdrawal'] = [
                'title'      => __( 'Reverse Withdrawal', 'dokan-lite' ),
                'icon'       => '<i class="fas fa-dollar-sign"></i>',
                'url'        => dokan_get_navigation_url( 'reverse-withdrawal' ),
                'pos'        => 71,
                'permission' => 'dokan_view_withdraw_menu',
            ];
        }

        return $urls;
    }
}
