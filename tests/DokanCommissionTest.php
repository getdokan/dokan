<?php

use WeDevs\Dokan\Commission\CommissionContext;
use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItemCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\ProductCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\VendorCommissionSourceStrategy;

class DokanCommissionTest extends WP_UnitTestCase {

    /**
     * Set up
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
    }

    public function test_that_we_can_get_commission() {
        $orderItemId = 1; // Example IDs
        $productId   = 103;
        $vendorId    = 2;
        $category_id  = 15;     // Example cat

        $strategies = [
            new OrderItemCommissionSourceStrategy( $orderItemId ),
            new ProductCommissionSourceStrategy( $productId ),
            new VendorCommissionSourceStrategy( $vendorId, $category_id ),
            new GlobalCommissionSourceStrategy( $category_id ),
        ];

        $context      = new CommissionContext( $strategies );
        $productPrice = 100.00; // Example product price
        $commission   = $context->calculate_commission( $productPrice );

        print_r( $commission );

        $this->assertEmpty($commission);
    }
}
