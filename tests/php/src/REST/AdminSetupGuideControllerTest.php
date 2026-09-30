<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Setup guide step endpoint returns the step's elements the screen renders.
 *
 * @group rest-api
 * @group admin-setup-guide
 *
 * @covers \WeDevs\Dokan\REST\AdminSetupGuideController::get_item
 */
class AdminSetupGuideControllerTest extends DokanTestCase {

    /**
     * Admin REST namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1/admin';

    public function set_up() {
        parent::set_up();

        get_user_by( 'id', $this->admin_id )->add_cap( 'manage_woocommerce' );
        wp_set_current_user( $this->admin_id );
    }

    public function test_step_returns_a_list_of_its_elements(): void {
        $response = $this->get_request( 'setup-guide/withdraw' );

        $this->assertSame( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertTrue( wp_is_numeric_array( $data ) );
        $this->assertSame( 'section', $data[0]['type'] );
        $this->assertContains( 'withdraw_limit', wp_list_pluck( $data[0]['children'], 'id' ) );
    }
}
