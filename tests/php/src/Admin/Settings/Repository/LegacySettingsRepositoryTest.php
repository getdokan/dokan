<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Repository;

use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsRepositoryTest extends DokanTestCase {

    public function test_class_implements_interface(): void {
        $repo = new LegacySettingsRepository();
        $this->assertInstanceOf( LegacySettingsRepositoryInterface::class, $repo );
    }

    public function test_all_returns_empty_array_when_option_missing(): void {
        delete_option( 'dokan_general' );

        $repo = new LegacySettingsRepository();
        $this->assertSame( [], $repo->all( 'dokan_general' ) );
    }

    public function test_all_returns_raw_section_when_no_overlay(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
        delete_option( 'dokan_admin_settings' );

        $repo = new LegacySettingsRepository();
        $this->assertSame(
            [ 'custom_store_url' => 'shop' ],
            $repo->all( 'dokan_general' )
        );
    }

    public function test_get_returns_default_when_key_absent(): void {
        update_option( 'dokan_general', [ 'other' => 'value' ] );
        delete_option( 'dokan_admin_settings' );

        $repo = new LegacySettingsRepository();
        $this->assertSame( 'fallback', $repo->get( 'dokan_general', 'custom_store_url', 'fallback' ) );
    }

    public function test_overlay_from_new_option_wins_over_raw_section(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
        update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

        $repo = new LegacySettingsRepository();
        $this->assertSame(
            'marketplace',
            $repo->get( 'dokan_general', 'custom_store_url' )
        );
    }

    public function test_second_read_uses_in_request_cache(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $repo = new LegacySettingsRepository();
        $this->assertSame( 'shop', $repo->get( 'dokan_general', 'custom_store_url' ) );

        // Tamper with the option directly; repository should still serve the cached snapshot.
        global $wpdb;
        $wpdb->update(
            $wpdb->options,
            [ 'option_value' => serialize( [ 'custom_store_url' => 'TAMPERED' ] ) ],
            [ 'option_name' => 'dokan_general' ]
        );
        wp_cache_delete( 'dokan_general', 'options' );
        wp_cache_delete( 'notoptions', 'options' );

        $this->assertSame( 'shop', $repo->get( 'dokan_general', 'custom_store_url' ) );
    }

    public function test_foreign_legacy_write_flushes_only_that_section(): void {
        update_option( 'dokan_general',    [ 'custom_store_url' => 'shop' ] );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 600 ] );

        $repo = new LegacySettingsRepository();
        // Warm both snapshots.
        $repo->all( 'dokan_general' );
        $repo->all( 'dokan_appearance' );

        // Foreign write to dokan_general should trigger update_option_dokan_general.
        update_option( 'dokan_general', [ 'custom_store_url' => 'market' ] );

        $this->assertSame( 'market', $repo->get( 'dokan_general', 'custom_store_url' ) );
        // The other section's snapshot should remain cached — tamper to verify.
        global $wpdb;
        $wpdb->update(
            $wpdb->options,
            [ 'option_value' => serialize( [ 'store_banner_width' => 9999 ] ) ],
            [ 'option_name' => 'dokan_appearance' ]
        );
        wp_cache_delete( 'dokan_appearance', 'options' );
        $this->assertSame( 600, $repo->get( 'dokan_appearance', 'store_banner_width' ) );
    }

    public function test_new_flat_option_write_flushes_every_section(): void {
        update_option( 'dokan_general',    [ 'custom_store_url' => 'shop' ] );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 600 ] );

        $repo = new LegacySettingsRepository();
        $repo->all( 'dokan_general' );
        $repo->all( 'dokan_appearance' );

        update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

        // After flush, the next read should reflect the overlay from the new flat option.
        $this->assertSame( 'marketplace', $repo->get( 'dokan_general', 'custom_store_url' ) );
    }

    public function test_flush_cache_null_clears_all_sections(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $repo = new LegacySettingsRepository();
        $repo->all( 'dokan_general' );

        $repo->flush_cache( null );

        update_option( 'dokan_general', [ 'custom_store_url' => 'cleared' ] );
        // Bypass the WP hook by re-flushing manually (the hook already flushed once but
        // we want to assert the public method works independently of the listener).
        $repo->flush_cache( null );

        $this->assertSame( 'cleared', $repo->get( 'dokan_general', 'custom_store_url' ) );
    }
}
