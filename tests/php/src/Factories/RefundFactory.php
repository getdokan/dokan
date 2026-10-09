<?php

namespace WeDevs\Dokan\Test\Factories;

use WC_Order_Refund;
use WP_UnitTest_Factory_For_Thing;

/**
 * Generates WooCommerce refund fixtures.
 *
 * A refund is a `shop_order_refund` post (or HPOS row) whose parent is the refunded
 * order. Any listing that queries orders without an explicit `type` picks refunds up
 * too, which is how getdokan/dokan-pro#6059 fataled. Seed one wherever a test walks
 * order listings.
 *
 * @since DOKAN_SINCE
 */
class RefundFactory extends WP_UnitTest_Factory_For_Thing {

    /**
     * @param DokanFactory|null $factory Parent factory.
     */
    public function __construct( $factory = null ) {
        parent::__construct( $factory );

        $this->default_generation_definitions = [
            'amount'         => 5,
            'reason'         => 'poison-world refund',
            'refund_payment' => false,
            'restock_items'  => false,
        ];
    }

    /**
     * Create a refund against an order.
     *
     * @param array $args Arguments for `wc_create_refund()`. `order_id` is required.
     *
     * @return int Refund id, or 0 when WooCommerce refused.
     */
    public function create_object( $args ) {
        if ( empty( $args['order_id'] ) ) {
            return 0;
        }

        $refund = wc_create_refund( $args );

        return $refund instanceof WC_Order_Refund ? $refund->get_id() : 0;
    }

    /**
     * Refunds are immutable for the purposes of fixtures.
     *
     * @param int   $refund_id Refund id.
     * @param array $fields    Ignored.
     *
     * @return int
     */
    public function update_object( $refund_id, $fields ) {
        return $refund_id;
    }

    /**
     * @param int $refund_id Refund id.
     *
     * @return WC_Order_Refund|false
     */
    public function get_object_by_id( $refund_id ) {
        $refund = wc_get_order( $refund_id );

        return $refund instanceof WC_Order_Refund ? $refund : false;
    }
}
