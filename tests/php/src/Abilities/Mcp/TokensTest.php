<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\SecretAtRest;
use WeDevs\Dokan\Abilities\Mcp\Tokens;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * Personal connection tokens: minted per user, verified by digest, shown again from an encrypted copy.
 */
class TokensTest extends DokanTestCase {

    public function test_fresh_user_has_no_token() {
        $this->assertFalse( Tokens::has( $this->seller_id1 ) );

        $status = Tokens::public_status( $this->seller_id1 );

        $this->assertFalse( $status['connected'] );
        $this->assertSame( '', $status['token'] );
        $this->assertSame( '', $status['config']['cli'] );
    }

    public function test_mint_returns_a_token_that_verifies_to_its_owner() {
        $status = Tokens::mint( $this->seller_id1 );

        $this->assertTrue( $status['connected'] );
        $this->assertTrue( $status['token_available'] );
        $this->assertSame( 64, strlen( $status['token'] ) );
        $this->assertSame( $this->seller_id1, Tokens::verify( $status['token'] ) );
        $this->assertSame( 0, Tokens::verify( 'not-a-token' ) );
        $this->assertSame( 0, Tokens::verify( '' ) );
    }

    public function test_tokens_are_per_user() {
        $a = Tokens::mint( $this->seller_id1 )['token'];
        $b = Tokens::mint( $this->seller_id2 )['token'];

        $this->assertNotSame( $a, $b );
        $this->assertSame( $this->seller_id1, Tokens::verify( $a ) );
        $this->assertSame( $this->seller_id2, Tokens::verify( $b ) );
    }

    public function test_rotating_cuts_off_the_old_token() {
        $old = Tokens::mint( $this->seller_id1 )['token'];
        $new = Tokens::mint( $this->seller_id1 )['token'];

        $this->assertNotSame( $old, $new );
        $this->assertSame( 0, Tokens::verify( $old ) );
        $this->assertSame( $this->seller_id1, Tokens::verify( $new ) );
    }

    public function test_revoke_drops_the_token() {
        $token = Tokens::mint( $this->seller_id1 )['token'];

        Tokens::revoke( $this->seller_id1 );

        $this->assertFalse( Tokens::has( $this->seller_id1 ) );
        $this->assertSame( 0, Tokens::verify( $token ) );
    }

    public function test_only_a_digest_is_stored_for_verification() {
        $token = Tokens::mint( $this->seller_id1 )['token'];

        $this->assertSame( hash( 'sha256', $token ), get_user_meta( $this->seller_id1, Tokens::META_HASH, true ) );

        $stored = get_user_meta( $this->seller_id1, Tokens::META, true );

        $this->assertNotSame( $token, $stored['secret'] );
        $this->assertSame( $token, SecretAtRest::decrypt( $stored['secret'] ) );
    }

    public function test_config_snippets_carry_the_endpoint_and_token_in_a_header() {
        $status = Tokens::mint( $this->admin_id );

        $this->assertStringContainsString( Access::endpoint(), $status['config']['cli'] );
        $this->assertStringContainsString( 'Authorization: Bearer ' . $status['token'], $status['config']['cli'] );

        $json = json_decode( $status['config']['json'], true );

        $this->assertSame( Access::endpoint(), $json['mcpServers']['dokan']['url'] );
        $this->assertSame( 'Bearer ' . $status['token'], $json['mcpServers']['dokan']['headers']['Authorization'] );
    }

    public function test_last_used_is_recorded_once_per_window() {
        Tokens::mint( $this->seller_id1 );

        $this->assertSame( 0, Tokens::get( $this->seller_id1 )['last_used'] );

        Tokens::touch_last_used( $this->seller_id1 );
        $first = Tokens::get( $this->seller_id1 )['last_used'];

        $this->assertGreaterThan( 0, $first );

        Tokens::touch_last_used( $this->seller_id1 );

        $this->assertSame( $first, Tokens::get( $this->seller_id1 )['last_used'] );
    }

    public function test_an_unreadable_ciphertext_still_authenticates() {
        $token  = Tokens::mint( $this->seller_id1 )['token'];
        $stored = get_user_meta( $this->seller_id1, Tokens::META, true );

        // A salt rotation leaves an envelope that no longer opens.
        $stored['secret'] = SecretAtRest::PREFIX . base64_encode( random_bytes( 48 ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
        update_user_meta( $this->seller_id1, Tokens::META, $stored );

        $status = Tokens::public_status( $this->seller_id1 );

        $this->assertTrue( $status['connected'] );
        $this->assertFalse( $status['token_available'] );
        $this->assertSame( $this->seller_id1, Tokens::verify( $token ) );
    }
}
