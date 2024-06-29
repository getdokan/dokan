<?php

namespace WeDevs\Dokan\Test;

use WP_UnitTestCase;

class SampleTest extends WP_UnitTestCase {

    public function set_up() {
        parent::set_up();

        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    }


    public function test_order() {
        $order = wc_create_order( [ 'customer_id' => 1 ] );

        $this->assertInstanceOf( 'WC_Order', $order );
    }
}
