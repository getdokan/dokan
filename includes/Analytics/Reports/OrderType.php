<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WC_Order_Refund;

/**
 * Class OrderType
 *
 * Defines constants and methods to handle different types of Dokan orders and refunds.
 *
 * @since 3.13.0
 */
class OrderType {
    // Order type constants
    public const DOKAN_PARENT_ORDER = 0;
    public const DOKAN_SINGLE_ORDER = 1;
    public const DOKAN_SUBORDER = 2;
    public const DOKAN_PARENT_ORDER_REFUND = 3;
    public const DOKAN_SUBORDER_REFUND = 4;
    public const DOKAN_SINGLE_ORDER_REFUND = 5;
    public const DOKAN_ADVERTISEMENT_PRODUCT_ORDER = 6;
    public const DOKAN_ADVERTISEMENT_REFUND_ORDER = 7;
    public const DOKAN_SUBSCRIPTION_ORDER = 8;
    public const DOKAN_SUBSCRIPTION_REFUND_ORDER = 9;

    /**
     * Checks if the given order is related to a Dokan suborder.
     *
     * @param \WC_Abstract_Order $order The order object to check.
     *
     * @return bool True if the order is a Dokan suborder or related to one, false otherwise.
     */
    public function is_dokan_suborder_related( \WC_Abstract_Order $order ): bool {
        if ( ! $order->get_parent_id() ) {
            return false;
        }

        if ( $order instanceof \WC_Order ) {
            return true;
        }

        $parent_order = wc_get_order( $order->get_parent_id() );

        return $this->is_dokan_suborder_related( $parent_order );
    }

    /**
     * Determines the type of the given order based on its relation to Dokan suborders and refunds.
     *
     * @since 5.0.0
     *
     * @param \WC_Abstract_Order $order The order object to classify.
     *
     * @return int The order type constant.
     */
    public function get_type( \WC_Abstract_Order $order ): int {
        // Check for special order types first (advertisement and subscription).
        $special_order_type = $this->get_special_order_type( $order );
        if ( $special_order_type ) {
            return $special_order_type;
        }

        $is_suborder_related = $this->is_dokan_suborder_related( $order );

        if ( $is_suborder_related ) {
            // Refund of Dokan suborder.
            if ( $order instanceof WC_Order_Refund ) {
                return self::DOKAN_SUBORDER_REFUND;
            }

            // Dokan Suborder
            return self::DOKAN_SUBORDER;
        }

        if ( ! $is_suborder_related ) {
            // Refund of WC order.
            if ( $order instanceof WC_Order_Refund ) {
                $suborder_ids = array_filter(
                    (array) dokan_get_suborder_ids_by( $order->get_parent_id() )
                );

                if ( count( $suborder_ids ) ) {
                    return self::DOKAN_PARENT_ORDER_REFUND;
                }

                return self::DOKAN_SINGLE_ORDER_REFUND;
            }

            $suborder_ids = dokan_get_suborder_ids_by( $order->get_id() );

            // Dokan Single Vendor Order
            if ( $suborder_ids === null || ( is_array( $suborder_ids ) && count( $suborder_ids ) === 0 ) ) {
                return self::DOKAN_SINGLE_ORDER;
            }
        }

        return self::DOKAN_PARENT_ORDER;
    }

    /**
     * Gets the special order type (advertisement or subscription) if applicable.
     *
     * This method applies a filter hook that allows external modules (like advertisement
     * or subscription modules) to determine the order type from their own context.
     *
     * @since 5.0.0
     *
     * @param \WC_Abstract_Order $order The order object to check.
     *
     * @return int|null The special order type constant, or null if not a special order.
     */
    protected function get_special_order_type( \WC_Abstract_Order $order ): ?int {
        $is_refund = $order instanceof WC_Order_Refund;

        // For refunds, get the parent order to check the type.
        $order_to_check = $is_refund ? wc_get_order( $order->get_parent_id() ) : $order;

        if ( ! $order_to_check ) {
            return null;
        }

        /**
         * Filter hook to determine a special order type from external modules.
         *
         * This filter allows modules like Product Advertisement or Vendor Subscription
         * to return their specific order type when they detect their order.
         *
         * @since 5.0.0
         *
         * @param int|null  $order_type     The order type constant, or null if not a special order.
         * @param \WC_Order $order_to_check The order object to check (parent order for refunds).
         * @param bool      $is_refund      Whether the original order is a refund.
         * @param \WC_Order $order          The original order object (could be refund).
         */
        return apply_filters( 'dokan_get_order_type', null, $order_to_check, $is_refund, $order );
    }

    /**
     * Gets the list of order types relevant to admin users.
     *
     * @return array List of admin order type constants.
     */
    public function get_admin_order_types(): array {
        return [
            self::DOKAN_PARENT_ORDER,
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_PARENT_ORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    /**
     * Gets the list of order types relevant to sellers.
     *
     * @return array List of seller order type constants.
     */
    public function get_vendor_order_types(): array {
        return [
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_SUBORDER,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
            self::DOKAN_ADVERTISEMENT_PRODUCT_ORDER,
            self::DOKAN_ADVERTISEMENT_REFUND_ORDER,
            self::DOKAN_SUBSCRIPTION_ORDER,
            self::DOKAN_SUBSCRIPTION_REFUND_ORDER,
        ];
    }

    /**
     * Gets the list of order types (excluding refunds) relevant to admin users.
     *
     * @return array List of admin order type constants (non-refund).
     */
    public function get_admin_order_types_excluding_refunds(): array {
        return [
            self::DOKAN_PARENT_ORDER,
            self::DOKAN_SINGLE_ORDER,
        ];
    }

    /**
     * Gets the list of order types (excluding refunds) relevant to sellers.
     *
     * @return array List of seller order type constants (non-refund).
     */
    public function get_vendor_order_types_excluding_refunds(): array {
        return [
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_SUBORDER,
        ];
    }

    /**
     * Gets the list of refund types relevant to all users.
     *
     * @return array List of refund type constants.
     */
    public function get_refund_types(): array {
        return [
            self::DOKAN_PARENT_ORDER_REFUND,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
            self::DOKAN_ADVERTISEMENT_REFUND_ORDER,
            self::DOKAN_SUBSCRIPTION_REFUND_ORDER,
        ];
    }

    /**
     * Gets the list of refund types relevant to sellers.
     *
     * @return array List of seller refund type constants.
     */
    public function get_vendor_refund_types(): array {
        return [
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    /**
     * Gets the list of refund types relevant to admin users.
     *
     * @return array List of admin refund type constants.
     */
    public function get_admin_refund_types(): array {
        return [
            self::DOKAN_PARENT_ORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
            self::DOKAN_ADVERTISEMENT_REFUND_ORDER,
            self::DOKAN_SUBSCRIPTION_REFUND_ORDER,
        ];
    }

    /**
     * Gets the list of all order types.
     *
     * @return array List of all order type constants.
     */
    public function get_all_order_types(): array {
        return [
            self::DOKAN_PARENT_ORDER,
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_SUBORDER,
            self::DOKAN_PARENT_ORDER_REFUND,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
            self::DOKAN_ADVERTISEMENT_PRODUCT_ORDER,
            self::DOKAN_ADVERTISEMENT_REFUND_ORDER,
            self::DOKAN_SUBSCRIPTION_ORDER,
            self::DOKAN_SUBSCRIPTION_REFUND_ORDER,
        ];
    }

    /**
     * Gets the list of order types relevant to admin earnings.
     *
     * @since 5.0.0
     *
     * @return array
     */
    public function get_admin_earning_order_types(): array {
        return apply_filters(
            'dokan_admin_earning_order_types',
            [
                self::DOKAN_ADVERTISEMENT_PRODUCT_ORDER,
                self::DOKAN_ADVERTISEMENT_REFUND_ORDER,
                self::DOKAN_SUBSCRIPTION_ORDER,
                self::DOKAN_SUBSCRIPTION_REFUND_ORDER,
            ]
        );
    }

    /**
     * Determines if the given order is of a type relevant to admin users.
     *
     * @since 5.0.0
     *
     * @param \WC_Abstract_Order $order The order object to check.
     *
     * @return bool True if the order type is relevant to admin users, false otherwise.
     */
    public function is_admin_order_type( \WC_Abstract_Order $order ): bool {
        $admin_earning_order_types = $this->get_admin_earning_order_types();
        $order_type                = $this->get_type( $order );

        return in_array( $order_type, $admin_earning_order_types, true );
    }
}
