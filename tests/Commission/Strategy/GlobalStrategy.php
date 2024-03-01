<?php

namespace Commission\Strategy;

use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WP_UnitTestCase;

class GlobalStrategy extends WP_UnitTestCase {

    public function test_global_strategy_commission() {
        $category_id = 15;

        $global_strategy = new GlobalCommissionSourceStrategy( $category_id );
        $calculator = $global_strategy->get_commission_calculator();


    }
}
