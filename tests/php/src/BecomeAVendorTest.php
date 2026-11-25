<?php

namespace WeDevs\Dokan\Test;

use RuntimeException;
use WeDevs\Dokan\Frontend\MyAccount\BecomeAVendor;

/**
 * Covers the shop URL check on the My Account "Become a Vendor" form.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class BecomeAVendorTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    public function set_up() {
        parent::set_up();

        WC()->initialize_session();
        wc_clear_notices();
    }

    /**
     * Create a customer whose nicename is `nila`.
     *
     * @return int
     */
    private function create_customer(): int {
        return $this->factory()->user->create(
            [
                'role'          => 'customer',
                'user_nicename' => 'nila',
            ]
        );
    }

    /**
     * Post the Become a Vendor form as the given customer.
     *
     * @param int    $customer_id Customer user ID.
     * @param string $shop_url    Requested shop URL.
     *
     * @return bool Whether the form went on to redirect, i.e. the customer was converted.
     */
    private function submit_as( int $customer_id, string $shop_url ): bool {
        wp_set_current_user( $customer_id );

        // Stop at the redirect so the handler's exit() never runs.
        add_filter(
            'dokan_customer_migration_redirect',
            function () {
                throw new RuntimeException( 'redirected' );
            }
        );

        $_POST = [
            'dokan_migration' => 'Become a Vendor',
            'dokan_nonce'     => wp_create_nonce( 'account_migration' ),
            'fname'           => 'Nila',
            'lname'           => 'Customer',
            'shopname'        => 'Nila Crafts',
            'phone'           => '01800000000',
            'shopurl'         => $shop_url,
        ];

        try {
            ( new BecomeAVendor() )->become_a_seller_form_handler();
        } catch ( RuntimeException $e ) {
            return 'redirected' === $e->getMessage();
        }

        return false;
    }

    public static function taken_shop_url_provider(): array {
        return [
            'exact'       => [ 'taken-shop' ],
            'upper case'  => [ 'TAKEN-SHOP' ],
            'with spaces' => [ 'Taken Shop' ],
        ];
    }

    /**
     * @dataProvider taken_shop_url_provider
     */
    public function test_a_shop_url_owned_by_another_user_is_rejected( string $shop_url ) {
        $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );
        $customer_id = $this->create_customer();

        $this->assertFalse( $this->submit_as( $customer_id, $shop_url ) );
        $this->assertFalse( dokan_is_user_seller( $customer_id ) );
        $this->assertSame( 'nila', get_userdata( $customer_id )->user_nicename );
        $this->assertSame( [ 'Shop URL is not available' ], array_column( wc_get_notices( 'error' ), 'notice' ) );
    }

    public function test_the_customers_own_nicename_is_accepted() {
        $customer_id = $this->create_customer();

        $this->assertTrue( $this->submit_as( $customer_id, 'nila' ) );
        $this->assertTrue( dokan_is_user_seller( $customer_id ) );
        $this->assertSame( 'nila', get_userdata( $customer_id )->user_nicename );
    }

    public function test_a_free_shop_url_is_saved_normalized() {
        $customer_id = $this->create_customer();

        $this->assertTrue( $this->submit_as( $customer_id, 'My New Shop' ) );
        $this->assertSame( 'my-new-shop', get_userdata( $customer_id )->user_nicename );
    }
}
