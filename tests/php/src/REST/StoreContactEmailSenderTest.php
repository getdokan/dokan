<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * The store contact email must be sent from the site, with the submitter only in Reply-to (getdokan/dokan-pro#6284).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-emails
 * @group security
 *
 * @covers \WeDevs\Dokan\Emails\ContactSeller::trigger
 * @covers \WeDevs\Dokan\Emails\ContactSeller::get_headers
 */
class StoreContactEmailSenderTest extends DokanTestCase {

    /**
     * Mail captured by pre_wp_mail, with the From address wp_mail() would have used.
     *
     * @var array
     */
    protected array $sent = [];

    public function set_up() {
        parent::set_up();

        update_option( 'woocommerce_email_from_address', 'store@example.org' );

        // Load the mailer so the contact email class is registered.
        WC()->mailer();

        add_filter( 'pre_wp_mail', [ $this, 'capture_mail' ], 10, 2 );
    }

    public function tear_down() {
        remove_filter( 'pre_wp_mail', [ $this, 'capture_mail' ], 10 );

        parent::tear_down();
    }

    public function capture_mail( $short_circuit, $atts ) {
        // WC_Email::send() hooks its From filter around wp_mail(), so it is still in place here.
        $atts['from']  = apply_filters( 'wp_mail_from', 'wordpress@example.org' );
        $this->sent[] = $atts;

        return true;
    }

    public function test_rest_contact_email_is_sent_from_the_site_not_the_submitter() {
        wp_set_current_user( 0 );

        $request = new WP_REST_Request( 'POST', '/dokan/v1/stores/' . $this->seller_id1 . '/contact' );
        $request->set_header( 'Content-Type', 'application/json' );
        $request->set_body(
            wp_json_encode(
                [
                    'name'    => 'Site Administrator',
                    'email'   => 'admin@victim.example',
                    'message' => 'Please reset your password.',
                ]
            )
        );

        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertCount( 1, $this->sent );
        $this->assertSame( 'store@example.org', $this->sent[0]['from'] );
        $this->assertStringContainsString( "Reply-to: Site Administrator <admin@victim.example>\r\n", $this->sent[0]['headers'] );
        $this->assertSame( 1, substr_count( strtolower( $this->sent[0]['headers'] ), 'reply-to:' ), 'The site address must not stay as a second Reply-to.' );
    }

    public function test_reply_to_name_cannot_smuggle_in_another_address() {
        do_action( 'dokan_trigger_contact_seller_mail', dokan()->vendor->get( $this->seller_id1 )->get_email(), "Bob, evil@attacker.example\r\nBcc: x@attacker.example", 'bob@example.org', 'Hi' );

        $this->assertCount( 1, $this->sent );

        $headers = $this->sent[0]['headers'];

        // wp_mail() splits Reply-to on commas and headers on newlines, so neither may survive in the name.
        $this->assertStringContainsString( '<bob@example.org>', $headers );
        $this->assertStringNotContainsString( ',', $headers );
        $this->assertDoesNotMatchRegularExpression( '/^Bcc:/mi', $headers );
        $this->assertSame( 2, substr_count( $headers, "\r\n" ), 'Only Content-Type and Reply-to header lines are expected.' );
    }

    public function test_invalid_email_is_rejected_by_the_rest_route() {
        $response = $this->post_request(
            'stores/' . $this->seller_id1 . '/contact',
            [
                'name'    => 'Bob',
                'email'   => 'not-an-email',
                'message' => 'Hi',
            ]
        );

        $this->assertSame( 400, $response->get_status() );
        $this->assertCount( 0, $this->sent );
    }
}
