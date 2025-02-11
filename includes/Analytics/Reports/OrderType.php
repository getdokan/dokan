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
     * @param \WC_Abstract_Order $order The order object to classify.
     *
     * @return int The order type constant.
     */
    public function get_type( \WC_Abstract_Order $order ): int {
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
        ];
    }

    /**
     * Gets the list of refund types relevant to admin users.
     *
     * @return array List of admin refund type constants.
     */
    public function get_all_order_types(): array {
        return [
            self::DOKAN_PARENT_ORDER,
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_SUBORDER,
            self::DOKAN_PARENT_ORDER_REFUND,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }
}
