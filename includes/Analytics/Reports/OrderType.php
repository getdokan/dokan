<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WC_Order_Refund;

class OrderType {
	public const ORDER_TYPE_WC_ORDER = 0;
	public const ORDER_TYPE_DOKAN_SUBORDER = 1;
	public const ORDER_TYPE_WC_ORDER_REFUND = 2;
	public const ORDER_TYPE_DOKAN_SUBORDER_REFUND = 3;


	public function is_suborder_related( \WC_Abstract_Order $order ) {
		if ( ! $order->get_parent_id() ) {
			return false;
		}

		if ( $order instanceof \WC_Order ) {
			return true;
		}

		$parent_order = wc_get_order( $order->get_parent_id() );

		return $this->is_suborder_related( $parent_order );
	}

	public function get_type( \WC_Abstract_Order $order ) {
		$is_suborder_related = self::is_suborder_related( $order );

		// Refund of Dokan suborder.
		if ( $is_suborder_related && $order instanceof WC_Order_Refund ) {
			return self::ORDER_TYPE_DOKAN_SUBORDER_REFUND;
		}

		// Refund of WC order.
		if ( ! $is_suborder_related && $order instanceof WC_Order_Refund ) {
			return self::ORDER_TYPE_WC_ORDER_REFUND;
		}

		// Dokan Suborder
		if ( $is_suborder_related ) {
			return self::ORDER_TYPE_DOKAN_SUBORDER;
		}

		return self::ORDER_TYPE_WC_ORDER;
	}
}
