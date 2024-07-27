<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WC_Order_Refund;

class OrderType {
	public const WC_ORDER = 0;
	public const DOKAN_SINGLE_ORDER = 1;
	public const DOKAN_SUBORDER = 2;
	public const WC_ORDER_REFUND = 3;
	public const DOKAN_SUBORDER_REFUND = 4;
	public const DOKAN_SINGLE_ORDER_REFUND = 5;

	public function is_dokan_suborder_related( \WC_Abstract_Order $order ) {
		if ( ! $order->get_parent_id() ) {
			return false;
		}

		if ( $order instanceof \WC_Order ) {
			return true;
		}

		$parent_order = wc_get_order( $order->get_parent_id() );

		return $this->is_dokan_suborder_related( $parent_order );
	}

	public function get_type( \WC_Abstract_Order $order ) {
		$is_suborder_related = self::is_dokan_suborder_related( $order );

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
					return self::WC_ORDER_REFUND;
                }

                return self::DOKAN_SINGLE_ORDER_REFUND;
			}

            $suborder_ids = dokan_get_suborder_ids_by( $order->get_id() );

            // Dokan Single Vendor Order
            if ( $suborder_ids === null || ( is_array( $suborder_ids ) && count( $suborder_ids ) === 0 ) ) {
                return self::DOKAN_SINGLE_ORDER;
            }
		}

		return self::WC_ORDER;
	}

    public function get_types_for_admin(): array {
        return [
            self::WC_ORDER,
            self::DOKAN_SINGLE_ORDER,
            self::WC_ORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    public function get_types_for_seller(): array {
        return [
            self::DOKAN_SINGLE_ORDER,
            self::DOKAN_SUBORDER,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    public function get_refund_types(): array {
        return [
            self::WC_ORDER_REFUND,
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    public function get_refund_types_for_seller() {
        return [
            self::DOKAN_SUBORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }

    public function get_refund_types_for_admin() {
        return [
            self::WC_ORDER_REFUND,
            self::DOKAN_SINGLE_ORDER_REFUND,
        ];
    }
}
