<?php
namespace WeDevs\Dokan\ReverseWithdrawal\Admin;

use WeDevs\Dokan\ReverseWithdrawal\Helper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Hooks
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\Admin
 */
class Hooks {
    /**
     * Admin constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // fix admin report log list
        add_filter( 'dokan_log_exclude_commission', [ $this, 'report_log_exclude_commission' ], 10, 2 );

        // maybe take action after settings has been saved
        add_action( 'dokan_after_saving_settings', [ $this, 'maybe_take_action' ], 11, 3 );

        // remove reverse withdrawal base product if page has been deleted
        add_action( 'wp_trash_post', array( $this, 'delete_base_product' ) );
    }

    /**
     * Exclude commission from report log if order contains advertisement product
     *
     * @since 3.5.1
     *
     * @param bool $exclude
     * @param object $order
     *
     * @return bool
     */
    public function report_log_exclude_commission( $exclude, $order ) {
        if ( Helper::has_reverse_withdrawal_payment_in_order( $order->order_id ) ) {
            return true;
        }

        return $exclude;
    }

    /**
     * Maybe take action after settings has been saved
     *
     * @since 3.5.1
     *
     * @param string $option_name
     * @param array $new_value
     * @param array $old_value
     *
     * @return void
     */
    public function maybe_take_action( $option_name, $new_value, $old_value ) {
        if ( 'dokan_reverse_withdrawal' !== $option_name ) {
            return;
        }

        // check if reverse withdrawal is enabled
        if ( 'off' === $new_value['enabled'] ) {
            return;
        }

        dokan()->reverse_withdrawal->cron_actions->maybe_take_action();
    }

    /**
     * Remove reverse withdrawal base product if page has been deleted
     *
     * @sience 3.5.1
     *
     * @param int $post_id
     *
     * @return void
     */
    public function delete_base_product( $post_id ) {
        if ( 'product' !== get_post_type( $post_id ) ) {
            return;
        }

        if ( (int) $post_id === Helper::get_reverse_withdrawal_base_product() ) {
            update_option( Helper::get_base_product_option_key(), '' );
        }
    }
}
