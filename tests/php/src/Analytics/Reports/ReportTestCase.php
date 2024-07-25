<?php

namespace WeDevs\Dokan\Test\Analytics\Reports;

use WeDevs\Dokan\Test\DokanTestCase;

class ReportTestCase extends DokanTestCase {
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
					'seller_earning' => random_int( 5, 10 ),
					'seller_gateway_fee' => random_int( 5, 10 ),
					'seller_discount' => random_int( 5, 10 ),
					'admin_commission' => random_int( 5, 10 ),
					'admin_gateway_fee' => random_int( 5, 10 ),
					'admin_discount' => random_int( 5, 10 ),
					'admin_subsidy' => random_int( 5, 10 ),
				],
			],
        ];
    }
}
