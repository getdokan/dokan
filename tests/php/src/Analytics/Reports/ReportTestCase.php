<?php

namespace WeDevs\Dokan\Test\Analytics\Reports;

use WeDevs\Dokan\Commission;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group analytics
 */
abstract class ReportTestCase extends DokanTestCase {
    public function create_refund( int $order_id, bool $parent_refund = true, $return_parent_refund = false ): \WC_Order_Refund {
        $order = wc_get_order( $order_id );
        $order_items = $order->get_items();
        $product_id = '';
        $line_item = [];
        $line_item_id = '';

        foreach ( $order_items as $key => $item ) {
            $line_item_id = $item->get_id();

            $qty = $item->get_quantity() - 1;
            $amount = $item->get_total();
            $product_id = $item->get_product_id();
            $line_item = array(
                'qty'          => $qty,
                'refund_total' => $amount,
                'refund_tax'   => array(),
            );

            break;
        }

        // Create the refund object.
        $refund = wc_create_refund(
            array(
                'reason'         => 'Testing Refund',
                'order_id'       => $order_id,
                'line_items'     => [ $line_item_id => $line_item ],
            )
        );

        if ( $parent_refund && $order->get_parent_id() ) {
            $parent_id = $order->get_parent_id();
            $parent_order = wc_get_order( $parent_id );
            $order_items = $parent_order->get_items();
            foreach ( $order_items as $key => $item ) {
                if ( $product_id === $item->get_product_id() ) {
                    $line_item_id = $item->get_id();
                    break;
                }
            }

            // Create the parent order refund object.
			$parent_refund = wc_create_refund(
                array(
					'reason'         => 'Testing Parent Refund',
					'order_id'       => $parent_id,
					'line_items'     => [ $line_item_id => $line_item ],
                )
			);

            if ( $return_parent_refund ) {
                return $parent_refund;
            }
        }

        return $refund;
    }

    protected function set_order_meta_for_dokan( $parent_id, array $data ) {
        // Filter null when order is single vendor order.
        $sub_order_ids = array_filter( (array) dokan_get_suborder_ids_by( $parent_id ) );

        // Fill sub orders meta data.
        foreach ( $sub_order_ids  as $sub_id ) {
            $sub_order = wc_get_order( $sub_id );

			foreach ( $data  as $key => $val ) {
                $sub_order->add_meta_data( '_' . $key, $val, true );
			}

            $sub_order->save_meta_data();
            $sub_order->save();
        }

        // Fill parent order meta data
        $order = wc_get_order( $parent_id );
        $count = count( $sub_order_ids ) ? count( $sub_order_ids ) : 1;

        foreach ( $data  as $key => $val ) {
            $order->add_meta_data( '_' . $key, $val * $count, true );
        }

        $order->save_meta_data();
        $order->save();
    }

    public static function get_dokan_stats_data() {
        return [
            [
				[
					'vendor_earning' => random_int( 5, 10 ),
					// 'vendor_gateway_fee' => random_int( 5, 10 ),
					// 'vendor_discount' => random_int( 5, 10 ),
					'admin_commission' => random_int( 5, 10 ),
					// 'admin_gateway_fee' => random_int( 5, 10 ),
					// 'admin_discount' => random_int( 5, 10 ),
					// 'admin_subsidy' => random_int( 5, 10 ),
				],
			],
        ];
    }

    public function tear_down() {
        dokan()->get_container()->extend( 'commission' )->setConcrete( new Commission() );
        parent::tear_down();
    }
}
