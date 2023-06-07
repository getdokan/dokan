<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Hooks
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Hooks {
    /**
     * Hooks constructor.
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function __construct() {
        // check if reverse withdrawal setting is enabled
        if ( ! SettingsHelper::is_enabled() ) {
            return;
        }

        // after reverse withdrawal is inserted
        add_action( 'dokan_reverse_withdrawal_created', [ $this, 'after_reverse_withdrawal_inserted' ], 99, 1 );

        // take reverse withdrawal actions
        // remove withdraw menu - reverse withdrawal action
        add_filter( 'dokan_get_dashboard_nav', array( $this, 'unset_withdraw_menu' ) );
        // enable catalog mode - reverse withdrawal action
        add_filter( 'woocommerce_is_purchasable', array( $this, 'hide_add_to_cart_button' ), 10, 2 );
        add_filter( 'woocommerce_get_price_html', array( $this, 'hide_product_price' ), 20, 2 );

        // after order status changed
        add_action( 'woocommerce_order_status_changed', [ $this, 'process_order_status_changed' ], 10, 3 );

        // vendor dashboard navigation url
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_reverse_withdrawal_nav' ], 10, 2 );
    }

    /**
     * After reverse withdrawal is inserted
     *
     * After a reverse withdrawal entry is inserted, we will check if we had to take any actions or revert previous taken actions.
     * This will make sure immediate update of vendor status.
     *
     * @since 3.5.1
     *
     * @param array $data
     *
     * @return void
     */
    public function after_reverse_withdrawal_inserted( $data ) {
        $failed_actions = new FailedActions();
        switch ( $data['trn_type'] ) {
            case 'order_commission':
            case 'failed_transfer_reversal':
            case 'product_advertisement':
            case 'manual_order_commission':
                // charge is added to vendor. based on billing type we need to take reverse pay actions
                $failed_actions->ensure_reverse_pay_actions( (int) $data['vendor_id'] );
                break;
            case 'vendor_payment':
            case 'order_refund':
                $failed_actions->revert_reverse_pay_actions( (int) $data['vendor_id'] );
                break;
        }
    }

    /**
     * Unset withdraw menu
     *
     * @since 3.5.1
     *
     * @param array $menu
     *
     * @return array
     */
    public function unset_withdraw_menu( $menu ) {
        $vendor_id = dokan_get_current_user_id();

        // check if action is taken for this vendor
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        if ( in_array( 'hide_withdraw_menu', $failed_actions, true ) && array_key_exists( 'withdraw', $menu ) ) {
            unset( $menu['withdraw'] );
        }

        return $menu;
    }

    /**
     * This method will remove add to cart button
     *
     * @since 3.5.1
     *
     * @param bool $purchasable
     * @param \WC_Product $product
     *
     * @return bool
     */
    public function hide_add_to_cart_button( $purchasable, $product ) {
        if ( false === $purchasable ) {
            return $purchasable;
        }

        $vendor_id = dokan_get_vendor_by_product( $product, true );

        if ( ! $vendor_id ) {
            return $purchasable;
        }

        // check if action is taken for this vendor
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        if ( in_array( 'enable_catalog_mode', $failed_actions, true ) ) {
            $purchasable = false;
        }

        return $purchasable;
    }

    /**
     * This method will hide product price
     *
     * @since 3.5.1
     *
     * @param string $price
     * @param \WC_Product $product
     *
     * @return string
     */
    public function hide_product_price( $price, $product ) {
        $vendor_id = dokan_get_vendor_by_product( $product, true );

        if ( ! $vendor_id ) {
            return $price;
        }

        // check if action is taken for this vendor
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        if ( in_array( 'hide_product_price', $failed_actions, true ) ) {
            $price = '';
        }

        return $price;
    }

    /**
     * Process order status changed
     *
     * @since 3.5.1
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

        // get order object from order id
        $order = wc_get_order( $order_id );

        // return if order is not exist
        if ( ! $order ) {
            return;
        }

        // check if order payment gateway is enabled for reverse withdrawal
        if ( ! SettingsHelper::is_gateway_enabled_for_reverse_withdrawal( $order->get_payment_method() ) ) {
            return;
        }

        // if order has suborder, return
        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        // check if this is a reverse withdrawal order, in that case, do not process
        if ( 'cod' === $order->get_payment_method() && Helper::has_reverse_withdrawal_payment_in_order( $order ) ) {
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
     * @since 3.5.1
     *
     * @param array $urls
     *
     * @return array
     */
    public function add_reverse_withdrawal_nav( $urls ) {
        $urls['reverse-withdrawal'] = [
            'title'      => esc_html__( 'Reverse Withdrawal', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-dollar-sign"></i>',
            'url'        => dokan_get_navigation_url( 'reverse-withdrawal' ),
            'pos'        => 71,
            'permission' => 'dokan_view_withdraw_menu',
        ];

        return $urls;
    }
}
