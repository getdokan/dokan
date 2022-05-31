<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

use WeDevs\Dokan\Vendor\Vendor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class FailedActions {
    /**
     * Reverse pay actions
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function ensure_reverse_pay_actions( $vendor_id ) {
        // check if we already took action for this vendor
        if ( ! empty( Helper::get_failed_actions_by_vendor( $vendor_id ) ) ) {
            return;
        }

        $due_status = Helper::get_vendor_due_status( $vendor_id );
        if ( is_wp_error( $due_status ) || false === $due_status['status'] ) {
            // vendor due is not mature yet, so we don't need to take any action
            return;
        }

        if ( 'immediate' !== $due_status['due_date'] ) {
            // there is still some time left to mature the vendor due, so we don't need to take any action
            return;
        }

        $failed_actions = SettingsHelper::get_failed_actions();
        if ( empty( $failed_actions ) ) {
            // no failed actions is enabled, so we don't need to take any action
            return;
        }

        // store failed actions to database, we will use this information later
        Helper::set_failed_actions_by_vendor( $vendor_id, $failed_actions );

        // check if we need to disable vendor
        if ( in_array( 'status_inactive', $failed_actions, true ) ) {
            // disable vendor
            $this->make_status_inactive( $vendor_id );
        }

        do_action( 'dokan_reverse_withdrawal_action_taken', $vendor_id, $failed_actions, $due_status );
    }

    /**
     * Revert reverse pay taken actions
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function revert_reverse_pay_actions( $vendor_id ) {
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        if ( empty( $failed_actions ) ) {
            return;
        }

        // check due status, if false then proceed
        $due_status = Helper::get_vendor_due_status( $vendor_id );
        if ( is_wp_error( $due_status ) || 'immediate' === $due_status['due_date'] ) {
            // vendor still needs to pay remaining reverse pay amount
            return;
        }

        // check if we need to disable vendor
        if ( in_array( 'status_inactive', $failed_actions, true ) ) {
            // disable vendor
            $this->make_status_active( $vendor_id );
        }

        // remove failed actions from database
        Helper::set_failed_actions_by_vendor( $vendor_id, [] );

        // update related meta data
        Helper::set_balance_threshold_exceed_date( $vendor_id, '' );

        do_action( 'dokan_reverse_withdrawal_action_reverted', $vendor_id, $failed_actions, $due_status );
    }

    /**
     * This method will make vendor status inactive
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function make_status_inactive( $vendor_id ) {
        // check if action is taken for this vendor
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        if ( is_array( $failed_actions ) && ! in_array( 'status_inactive', $failed_actions, true ) ) {
            return;
        }

        /**
         * @var $vendor Vendor
         */
        $vendor = dokan()->vendor->get( $vendor_id );
        // make vendor status inactive
        $vendor->make_inactive();
    }

    /**
     * This method will make vendor status active
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     * @param bool $remove_action
     *
     * @return void
     */
    public function make_status_active( $vendor_id, $remove_action = false ) {
        // check if action is taken for this vendor
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        $position = array_search( 'status_inactive', $failed_actions, true ); // we need position later on
        if ( false === $position ) {
            return;
        }

        /**
         * @var $vendor Vendor
         */
        $vendor = dokan()->vendor->get( $vendor_id );
        // make vendor status active
        $vendor->make_active();

        // remove status_inactive action from failed actions
        if ( $remove_action ) {
            // unset this action from failed actions
            unset( $failed_actions[ $position ] );
            // update failed actions
            Helper::set_failed_actions_by_vendor( $vendor_id, $failed_actions );
        }
    }

    /**
     * This method will remove a failed action for a vendor
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     * @param string $action
     *
     * @return void
     */
    public function remove_failed_action( $vendor_id, $action ) {
        $failed_actions = Helper::get_failed_actions_by_vendor( $vendor_id );
        $position = array_search( $action, $failed_actions, true ); // we need position later on
        if ( false === $position ) {
            return;
        }

        // for status_inactive action, we need to make vendor active manually
        if ( 'status_inactive' === $action ) {
            // we need to make vendor active
            $this->make_status_active( $vendor_id );
        }

        // unset this action from failed actions
        unset( $failed_actions[ $position ] );
        // update failed actions
        Helper::set_failed_actions_by_vendor( $vendor_id, $failed_actions );
    }
}
