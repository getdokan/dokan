<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacyMirror;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Downgrade-safety behavior of {@see LegacyMirror}: write-through of flat-
 * option saves into the legacy rows, first-run mirror materialization, and
 * reconciliation of edits made by an older plugin version (no bridge) back
 * into `dokan_admin_settings` on re-upgrade.
 *
 * @group admin-settings
 */
class LegacyMirrorTest extends DokanTestCase {

    /**
     * Fixture schema: one mapped field. The filter REPLACES the schema so the
     * bridge mapping is deterministic for these tests.
     *
     * @var callable
     */
    private $schema_cb;

    public function set_up() {
        parent::set_up();

        $this->schema_cb = static function (): array {
            return [
                [
                    'id'         => 'banner_width',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_appearance.store_banner_width',
                    'default'    => 400,
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $this->schema_cb );

        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_appearance' );
        delete_option( LegacyMirror::SNAPSHOT_KEY );
        wp_cache_delete( 'dokan_admin_settings', 'options' );
        wp_cache_delete( 'dokan_appearance', 'options' );
        wp_cache_delete( LegacyMirror::SNAPSHOT_KEY, 'options' );
        wp_cache_delete( 'alloptions', 'options' );
        wp_cache_delete( 'notoptions', 'options' );

        // DB rollback between tests doesn't fire `delete_option_*` hooks, so
        // the DI container's shared instances retain stale snapshots/maps.
        $container = dokan_get_container();
        $container->get( SettingsRepository::class )->flush_cache();
        $container->get( LegacySettingsRepository::class )->flush_cache( null );
        $container->get( LegacySettingsBridge::class )->flush_cache();
    }

    public function tear_down() {
        remove_filter( 'dokan_get_admin_settings_schema', $this->schema_cb );
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_appearance' );
        delete_option( LegacyMirror::SNAPSHOT_KEY );
        parent::tear_down();
    }

    /**
     * Physical row content as an old plugin version (no overlay filters)
     * would read it.
     *
     * @return mixed
     */
    private function raw_row( string $option_name ) {
        global $wpdb;
        $raw = $wpdb->get_var(
            $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $option_name )
        );
        return is_string( $raw ) ? maybe_unserialize( $raw ) : null;
    }

    public function test_flat_option_save_writes_through_to_legacy_row(): void {
        dokan_get_container()->get( SettingsRepository::class )->update( [ 'banner_width' => 777 ] );

        $row = $this->raw_row( 'dokan_appearance' );
        $this->assertIsArray( $row );
        $this->assertSame( 777, $row['store_banner_width'] );

        // The baseline snapshot is stamped alongside the mirror write.
        $snapshot = get_option( LegacyMirror::SNAPSHOT_KEY );
        $this->assertIsArray( $snapshot );
        $this->assertSame( 777, $snapshot['banner_width'] );
    }

    public function test_write_through_is_disabled_by_the_mirror_filter(): void {
        add_filter( 'dokan_admin_settings_legacy_mirror', '__return_false' );

        dokan_get_container()->get( SettingsRepository::class )->update( [ 'banner_width' => 777 ] );

        remove_filter( 'dokan_admin_settings_legacy_mirror', '__return_false' );

        $this->assertNull( $this->raw_row( 'dokan_appearance' ) );
        $this->assertFalse( get_option( LegacyMirror::SNAPSHOT_KEY ) );
    }

    public function test_first_reconcile_materializes_full_mirror_and_stamps_baseline(): void {
        // Flat option populated without firing the repository save path —
        // simulates a site that saved via the new UI before the mirror shipped
        // (its legacy rows were stripped / never written).
        update_option( 'dokan_admin_settings', [ 'banner_width' => 555 ] );
        dokan_get_container()->get( SettingsRepository::class )->flush_cache();

        dokan_get_container()->get( LegacyMirror::class )->maybe_reconcile();

        $row = $this->raw_row( 'dokan_appearance' );
        $this->assertIsArray( $row );
        $this->assertSame( 555, $row['store_banner_width'] );

        $snapshot = get_option( LegacyMirror::SNAPSHOT_KEY );
        $this->assertIsArray( $snapshot );
        $this->assertSame( 555, $snapshot['banner_width'] );
    }

    public function test_downgrade_edit_wins_over_stale_flat_option_on_reconcile(): void {
        $container = dokan_get_container();

        // Step 1 — user saves via the new UI on the new version.
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        $this->assertSame( 111, $this->raw_row( 'dokan_appearance' )['store_banner_width'] );

        // Steps 2–3 — plugin downgraded; the OLD version knows nothing about
        // the bridge and writes the legacy row directly.
        update_option( 'dokan_appearance', [ 'store_banner_width' => 222 ] );
        $this->assertSame( 222, $this->raw_row( 'dokan_appearance' )['store_banner_width'] );
        // The flat option still holds the stale step-1 snapshot.
        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );

        // Step 4 — plugin upgraded back; reconciliation runs on admin_init.
        $container->get( LegacyMirror::class )->maybe_reconcile();

        // Last write wins: the old-version edit is adopted into the flat option.
        $this->assertSame( 222, get_option( 'dokan_admin_settings' )['banner_width'] );
        // And every read path agrees.
        $container->get( LegacySettingsRepository::class )->flush_cache( null );
        $this->assertSame( 222, dokan_get_option( 'store_banner_width', 'dokan_appearance' ) );
    }

    public function test_reconcile_is_a_noop_when_nothing_diverged(): void {
        $container = dokan_get_container();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );

        $container->get( LegacyMirror::class )->maybe_reconcile();

        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
        $this->assertSame( 111, $this->raw_row( 'dokan_appearance' )['store_banner_width'] );
    }

    public function test_reconcile_ignores_keys_absent_from_baseline(): void {
        $container = dokan_get_container();

        // Baseline with an empty legacy row: flat option has nothing to mirror.
        $container->get( LegacyMirror::class )->maybe_reconcile();
        $this->assertSame( [], get_option( LegacyMirror::SNAPSHOT_KEY ) );

        // Flat option gains a value through a raw (foreign) write — no mirror,
        // baseline still lacks the key.
        update_option( 'dokan_admin_settings', [ 'banner_width' => 111 ] );
        // A legacy row appears with a different value (e.g. a newly-mapped
        // field whose legacy leaf predates the mapping).
        update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $container->get( LegacyMirror::class )->maybe_reconcile();

        // Keys absent from the baseline are never adopted — the flat option
        // (canonical) keeps its value.
        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
    }
}
