<?php

class SampleTest extends WP_UnitTestCase {

    public function setup() {
        parent::setup();

        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    }

    public function tearDown() {
        parent::tearDown();
    }

    public function test_order() {
        $order = wc_create_order( array( 'customer_id' => 1 ) );

        $this->assertInstanceOf( 'WC_Order', $order );
    }
}

