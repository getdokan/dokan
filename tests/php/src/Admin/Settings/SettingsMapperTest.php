<?php
namespace WeDevs\Dokan\Test\Admin\Settings;

use PHPUnit\Framework\Assert;
use WeDevs\Dokan\Admin\Settings\SettingsMapper;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class SettingsMapperTest extends DokanTestCase {

    public function test_forward_and_reverse_mapping_for_known_key(): void {
        $mapper = new SettingsMapper();

        $old = 'dokan_general.custom_store_url';
        $new = 'general.marketplace.marketplace_settings.vendor_store_url';

        Assert::assertSame( $new, $mapper->to_new_key( $old ) );
        Assert::assertSame( $old, $mapper->to_old_key( $new ) );
    }

    public function test_path_helpers_set_and_get_value_by_path(): void {
        $data = [];

        SettingsMapper::set_value_by_path( $data, 'a.b.c', 123 );
        Assert::assertSame( 123, SettingsMapper::get_value_by_path( $data, 'a.b.c', null ) );

        // Setting a sibling path should not affect existing values
        SettingsMapper::set_value_by_path( $data, 'a.b.d', 'x' );
        Assert::assertSame( 123, SettingsMapper::get_value_by_path( $data, 'a.b.c', null ) );
        Assert::assertSame( 'x', SettingsMapper::get_value_by_path( $data, 'a.b.d', null ) );

        // Non-existing path returns default
        Assert::assertSame( 'default', SettingsMapper::get_value_by_path( $data, 'a.b.e', 'default' ) );

        // Overwrite deep value
        SettingsMapper::set_value_by_path( $data, 'a.b.c', 456 );
        Assert::assertSame( 456, SettingsMapper::get_value_by_path( $data, 'a.b.c', null ) );
    }
}
