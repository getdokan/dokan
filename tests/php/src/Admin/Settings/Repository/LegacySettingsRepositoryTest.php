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
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
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
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
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

    public function test_update_persists_to_legacy_section_option(): void {
        update_option( 'dokan_general', [ 'other' => 'preserved' ] );
        delete_option( 'dokan_admin_settings' );

        $repo    = new LegacySettingsRepository();
        $changed = $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $this->assertSame( [ 'custom_store_url' => 'shop' ], $changed );
        $this->assertSame(
            [ 'other' => 'preserved', 'custom_store_url' => 'shop' ],
            get_option( 'dokan_general' )
        );
    }

    public function test_update_mirrors_mapped_keys_to_new_flat_option(): void {
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $repo = new LegacySettingsRepository();
        $repo->update( 'dokan_general', [ 'custom_store_url' => 'marketplace' ] );

        $new = get_option( 'dokan_admin_settings' );
        $this->assertIsArray( $new );
        // Schema maps vendor_store_url → dokan_general.custom_store_url (SettingsSchema.php:153-165).
        $this->assertSame( 'marketplace', $new['vendor_store_url'] );
    }

    public function test_update_with_no_change_is_a_noop(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $repo = new LegacySettingsRepository();
        // Warm the snapshot first so $current matches the on-disk value.
        $repo->all( 'dokan_general' );

        $changed = $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
        $this->assertSame( [], $changed );
    }

    public function test_update_fires_pre_save_filter_and_changed_action(): void {
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $filter_received = null;
        $action_payload  = null;

        add_filter(
            'dokan_legacy_settings_pre_save',
            static function ( $slice, $section, $current ) use ( &$filter_received ) {
                $filter_received = [ 'slice' => $slice, 'section' => $section, 'current' => $current ];
                return $slice;
            },
            10,
            3
        );

        add_action(
            'dokan_legacy_settings_changed',
            static function ( $section, $changed, $before, $after ) use ( &$action_payload ) {
                $action_payload = compact( 'section', 'changed', 'before', 'after' );
            },
            10,
            4
        );

        $repo = new LegacySettingsRepository();
        $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $this->assertSame( 'dokan_general', $filter_received['section'] );
        $this->assertSame( [ 'custom_store_url' => 'shop' ], $filter_received['slice'] );
        $this->assertSame( 'dokan_general', $action_payload['section'] );
        $this->assertSame( [ 'custom_store_url' => 'shop' ], $action_payload['changed'] );
    }

    public function test_pre_save_filter_can_mutate_slice(): void {
        delete_option( 'dokan_general' );

        add_filter(
            'dokan_legacy_settings_pre_save',
            static function ( $slice ) {
                $slice['custom_store_url'] = 'overridden';
                return $slice;
            }
        );

        $repo = new LegacySettingsRepository();
        $repo->update( 'dokan_general', [ 'custom_store_url' => 'original' ] );

        $this->assertSame( 'overridden', get_option( 'dokan_general' )['custom_store_url'] );
    }

    public function test_update_returns_only_changed_entries(): void {
        update_option( 'dokan_general', [
            'custom_store_url' => 'shop',
            'admin_access'     => 'on',
        ] );

        $repo = new LegacySettingsRepository();
        $repo->all( 'dokan_general' );

        $changed = $repo->update( 'dokan_general', [
            'custom_store_url' => 'shop',    // unchanged
            'admin_access'     => 'off',     // changed
        ] );

        $this->assertSame( [ 'admin_access' => 'off' ], $changed );
    }

    public function test_replace_writes_payload_whole(): void {
        update_option( 'dokan_general', [ 'a' => 1, 'b' => 2 ] );
        delete_option( 'dokan_admin_settings' );

        $repo = new LegacySettingsRepository();
        $repo->replace( 'dokan_general', [ 'c' => 3 ] );

        $this->assertSame( [ 'c' => 3 ], get_option( 'dokan_general' ) );
    }

    public function test_replace_returns_diff_with_removed_keys_as_null(): void {
        update_option( 'dokan_general', [ 'a' => 1, 'b' => 2 ] );

        $repo = new LegacySettingsRepository();
        $repo->all( 'dokan_general' );

        $diff = $repo->replace( 'dokan_general', [ 'a' => 1, 'c' => 3 ] );

        // `b` removed, `c` added, `a` unchanged.
        $this->assertArrayHasKey( 'b', $diff );
        $this->assertNull( $diff['b'] );
        $this->assertSame( 3, $diff['c'] );
        $this->assertArrayNotHasKey( 'a', $diff );
    }

    public function test_replace_mirrors_mapped_keys_to_new_option(): void {
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $repo = new LegacySettingsRepository();
        $repo->replace( 'dokan_general', [ 'custom_store_url' => 'marketplace' ] );

        $this->assertSame( 'marketplace', get_option( 'dokan_admin_settings' )['vendor_store_url'] );
    }

    public function test_dokan_get_option_reads_through_repository(): void {
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
        update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

        // Flush repo cache so the next read sees the freshly-set options.
        dokan_get_container()
            ->get( LegacySettingsRepository::class )
            ->flush_cache( null );

        $this->assertSame( 'marketplace', dokan_get_option( 'custom_store_url', 'dokan_general' ) );
    }
}
