<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacyAddress;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacyAddressTest extends DokanTestCase {

    public function test_parses_two_segment_address(): void {
        $addr = LegacyAddress::parse( 'dokan_general.site_logo' );
        $this->assertNotNull( $addr );
        $this->assertSame( 'dokan_general', $addr->option() );
        $this->assertSame( [ 'site_logo' ], $addr->path() );
    }

    public function test_parses_nested_path(): void {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $this->assertNotNull( $addr );
        $this->assertSame( 'dokan_geolocation', $addr->option() );
        $this->assertSame( [ 'location', 'latitude' ], $addr->path() );
    }

    public function test_reads_nested_value(): void {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $this->assertNotNull( $addr );
        $val = $addr->read_from( [ 'location' => [ 'latitude' => '23.45' ] ] );
        $this->assertSame( '23.45', $val );
    }

    public function test_writes_nested_value(): void {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $this->assertNotNull( $addr );
        $arr = [];
        $addr->write_to( $arr, '23.45' );
        $this->assertSame( [ 'location' => [ 'latitude' => '23.45' ] ], $arr );
    }

    public function test_rejects_blank_segments(): void {
        $this->assertNull( LegacyAddress::parse( 'dokan_general.' ) );
        $this->assertNull( LegacyAddress::parse( '.field' ) );
        $this->assertNull( LegacyAddress::parse( '' ) );
    }
}
