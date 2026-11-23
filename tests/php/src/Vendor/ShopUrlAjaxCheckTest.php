<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Ajax;
use WeDevs\Dokan\Test\DokanAjaxTestCase;
use WPAjaxDieContinueException;

/**
 * Covers who the `shop_url` AJAX check lets keep a taken nicename.
 *
 * @group ajax
 * @group core-feature-registration
 */
class ShopUrlAjaxCheckTest extends DokanAjaxTestCase {

    public function setUp(): void {
        parent::setUp();

        $ajax = new Ajax();
        add_action( 'wp_ajax_shop_url', [ $ajax, 'shop_url_check' ] );
        add_action( 'wp_ajax_nopriv_shop_url', [ $ajax, 'shop_url_check' ] );
    }

    /**
     * Run the check and return the decoded success payload, or null when it answered "not available".
     *
     * @param string $slug      Requested shop URL.
     * @param int    $vendor_id Optional vendor_id the caller claims to edit.
     *
     * @return array|null
     */
    private function check( string $slug, int $vendor_id = 0 ): ?array {
        $_POST = [
            '_nonce'   => wp_create_nonce( 'dokan_reviews' ),
            'url_slug' => $slug,
        ];

        if ( $vendor_id ) {
            $_POST['vendor_id'] = $vendor_id;
        }

        $this->_last_response = '';

        try {
            $this->_handleAjax( 'shop_url' );
        } catch ( WPAjaxDieContinueException $e ) {
            unset( $e ); // wp_send_json_success() ends the request here.
        }

        return '' === $this->_last_response ? null : json_decode( $this->_last_response, true );
    }

    /**
     * Create a vendor whose nicename is `taken-shop`.
     *
     * @return int
     */
    private function create_taken_vendor(): int {
        return $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );
    }

    public function test_a_logged_out_caller_cannot_claim_a_vendor_id() {
        $vendor_id = $this->create_taken_vendor();

        $this->assertNull( $this->check( 'taken-shop', $vendor_id ) );
    }

    public function test_a_non_admin_cannot_claim_a_vendor_id() {
        $vendor_id = $this->create_taken_vendor();
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

        $this->assertNull( $this->check( 'taken-shop', $vendor_id ) );
    }

    public function test_an_admin_editing_the_vendor_may_keep_its_url() {
        $vendor_id = $this->create_taken_vendor();
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $response = $this->check( 'Taken Shop', $vendor_id );

        $this->assertTrue( $response['success'] );
        $this->assertSame( 'taken-shop', $response['data']['url'] );
    }

    public function test_a_subscriber_becoming_a_vendor_may_keep_their_own_nicename() {
        wp_set_current_user(
            $this->factory()->user->create(
                [
                    'role'          => 'subscriber',
                    'user_nicename' => 'nila',
                ]
            )
        );

        $this->assertTrue( $this->check( 'nila' )['success'] );
    }

    public function test_a_vendor_does_not_get_their_own_exemption_on_sign_up_forms() {
        wp_set_current_user( $this->create_taken_vendor() );

        $this->assertNull( $this->check( 'taken-shop' ) );
    }
}
