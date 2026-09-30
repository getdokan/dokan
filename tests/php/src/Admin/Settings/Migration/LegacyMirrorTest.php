<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacyMirror;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Migration\Transformer\HideVendorInfoTransformer;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Downgrade-safety behavior of {@see LegacyMirror}: write-through of flat-
 * option saves into the legacy rows, first-run mirror materialization, and
 * reconciliation of edits made by an older plugin version (no bridge) back
 * into `dokan_admin_settings` on re-upgrade, adoption of direct
 * `update_option()` writes to legacy rows, and preservation of legacy keys
 * a `legacy_merge` field does not own.
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
                [
                    'id'         => 'banner_height',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_appearance.store_banner_height',
                    'default'    => 300,
                ],
                [
                    'id'                 => 'vendor_info_visibility',
                    'type'               => 'field',
                    'legacy_key'         => 'dokan_appearance.hide_vendor_info',
                    'legacy_transformer' => HideVendorInfoTransformer::class,
                    'legacy_merge'       => true,
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

    /**
     * Write the physical row the way an older plugin version (no bridge, no
     * option hooks from this code) would, bypassing update_option listeners.
     *
     * @param string $option_name Option name.
     * @param mixed  $value       Value to store.
     *
     * @return void
     */
    private function write_raw_row( string $option_name, $value ): void {
        global $wpdb;
        $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'yes') ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)",
                $option_name,
                maybe_serialize( $value )
            )
        );
        wp_cache_delete( $option_name, 'options' );
        wp_cache_delete( 'alloptions', 'options' );
        wp_cache_delete( 'notoptions', 'options' );
        dokan_get_container()->get( LegacySettingsRepository::class )->flush_cache( null );
    }

    /**
     * New-shape vendor info visibility value.
     *
     * @param bool $email   Show email.
     * @param bool $phone   Show phone.
     * @param bool $address Show address.
     *
     * @return array<string,bool>
     */
    private function visibility( bool $email, bool $phone, bool $address ): array {
        return [
            'store_email'   => $email,
            'store_phone'   => $phone,
            'store_address' => $address,
        ];
    }

    /**
     * Swap the fixture schema, as activating/deactivating a module does.
     *
     * @param array $schema Replacement schema.
     *
     * @return void
     */
    private function swap_schema( array $schema ): void {
        remove_filter( 'dokan_get_admin_settings_schema', $this->schema_cb );
        $this->schema_cb = static function () use ( $schema ): array {
            return $schema;
        };
        add_filter( 'dokan_get_admin_settings_schema', $this->schema_cb );
        dokan_get_container()->get( LegacySettingsBridge::class )->flush_cache();
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
        $this->write_raw_row( 'dokan_appearance', [ 'store_banner_width' => 222 ] );
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
        $this->write_raw_row( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $container->get( LegacyMirror::class )->maybe_reconcile();

        // Keys absent from the baseline are never adopted — the flat option
        // (canonical) keeps its value.
        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * QA-08: a direct update_option() on a legacy row (CLI, cron, third-party
     * code) takes effect immediately instead of waiting for admin_init.
     */
    public function test_direct_update_option_on_legacy_row_is_adopted(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update(
            [
                'banner_width'  => 111,
                'banner_height' => 50,
            ]
        );

        $row                       = get_option( 'dokan_appearance', [] );
        $row['store_banner_width'] = 222;
        // The row holds only mapped keys, so WordPress routes this update
        // through add_option() (old value === default_option_* overlay).
        $this->assertTrue( update_option( 'dokan_appearance', $row ) );

        $flat = get_option( 'dokan_admin_settings' );
        $this->assertSame( 222, $flat['banner_width'] );
        // Fields the writer did not change are left alone.
        $this->assertSame( 50, $flat['banner_height'] );
        $container->get( LegacySettingsRepository::class )->flush_cache( null );
        $this->assertSame( 222, dokan_get_option( 'store_banner_width', 'dokan_appearance' ) );
    }

    /**
     * QA-08: a row that also holds unmapped keys takes WordPress's real
     * update path (update_option_{section}); the write is adopted too.
     */
    public function test_direct_update_of_row_with_unmapped_keys_is_adopted(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        $row                  = (array) $this->raw_row( 'dokan_appearance' );
        $row['unmapped_flag'] = 'x';
        $this->write_raw_row( 'dokan_appearance', $row );

        $row                       = get_option( 'dokan_appearance', [] );
        $row['store_banner_width'] = 333;
        $this->assertTrue( update_option( 'dokan_appearance', $row ) );

        $this->assertSame( 333, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * A direct update_option() on a never-saved row creates the row and is adopted.
     */
    public function test_direct_update_of_missing_row_creates_row(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        delete_option( 'dokan_appearance' );
        $this->assertNull( $this->raw_row( 'dokan_appearance' ) );

        $this->assertTrue( update_option( 'dokan_appearance', [ 'store_banner_width' => 444 ] ) );

        $this->assertSame( 444, $this->raw_row( 'dokan_appearance' )['store_banner_width'] );
        $this->assertSame( 444, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * Listeners on update_option_{section} already read the adopted value.
     */
    public function test_update_listeners_see_the_adopted_value(): void {
        $container = dokan_get_container();
        $seen      = null;
        add_action(
            'update_option_dokan_appearance',
            function () use ( $container, &$seen ) {
                $container->get( LegacySettingsRepository::class )->flush_cache( null );
                $seen = dokan_get_option( 'store_banner_width', 'dokan_appearance' );
            }
        );
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        $row                  = (array) $this->raw_row( 'dokan_appearance' );
        $row['unmapped_flag'] = 'x';
        $this->write_raw_row( 'dokan_appearance', $row );

        $row                       = get_option( 'dokan_appearance', [] );
        $row['store_banner_width'] = 555;
        update_option( 'dokan_appearance', $row );

        $this->assertSame( 555, $seen );
    }

    /**
     * A stale row that already holds the new value writes zero rows; the value is still adopted.
     */
    public function test_zero_row_update_is_adopted(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        $row                       = (array) $this->raw_row( 'dokan_appearance' );
        $row['unmapped_flag']      = 'x';
        $row['store_banner_width'] = 666;
        $this->write_raw_row( 'dokan_appearance', $row );

        update_option( 'dokan_appearance', $row );

        $this->assertSame( 666, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * A recorded write that WordPress dropped is never adopted by a later plain add_option().
     */
    public function test_stale_recorded_write_is_not_adopted_by_add_option(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        // An unchanged value is recorded, then WordPress exits before writing.
        $this->assertFalse( update_option( 'dokan_appearance', get_option( 'dokan_appearance', [] ) ) );
        delete_option( 'dokan_appearance' );

        add_option( 'dokan_appearance', [ 'store_banner_width' => 888 ] );

        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * QA-08: a plain add_option() (e.g. an installer writing defaults) has no
     * previous value and must not overwrite the flat option.
     */
    public function test_plain_add_option_is_not_adopted(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        delete_option( 'dokan_appearance' );

        add_option( 'dokan_appearance', [ 'store_banner_width' => 400 ] );

        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * QA-08: the listener ignores non-array writes instead of failing.
     */
    public function test_direct_non_array_write_is_ignored(): void {
        $container = dokan_get_container();
        $container->get( LegacyMirror::class )->register_write_listeners();
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );

        update_option( 'dokan_appearance', 'garbage' );

        $this->assertSame( 111, get_option( 'dokan_admin_settings' )['banner_width'] );
    }

    /**
     * QA-06: saving while a module is inactive must not erase its baseline,
     * so an edit made to its legacy row meanwhile is adopted on reactivation.
     */
    public function test_baseline_survives_while_a_field_is_unmapped(): void {
        $container = dokan_get_container();
        $full      = apply_filters( 'dokan_get_admin_settings_schema', [] );
        $container->get( SettingsRepository::class )->update( [ 'banner_width' => 111 ] );
        $this->assertSame( 111, get_option( LegacyMirror::SNAPSHOT_KEY )['banner_width'] );

        // Module deactivated: banner_width leaves the schema; any save re-stamps.
        $this->swap_schema( array_values( wp_list_filter( $full, [ 'id' => 'banner_width' ], 'NOT' ) ) );
        $container->get( SettingsRepository::class )->update( [ 'banner_height' => 60 ] );
        $this->assertSame( 111, get_option( LegacyMirror::SNAPSHOT_KEY )['banner_width'] );

        // Older plugin version edits the row while the module is off.
        $row                       = $this->raw_row( 'dokan_appearance' );
        $row['store_banner_width'] = 222;
        $this->write_raw_row( 'dokan_appearance', $row );

        // Module reactivated; admin_init reconcile adopts the edit.
        $this->swap_schema( $full );
        $container->get( LegacyMirror::class )->maybe_reconcile();

        $this->assertSame( 222, get_option( 'dokan_admin_settings' )['banner_width'] );
        $this->assertSame( 60, get_option( 'dokan_admin_settings' )['banner_height'] );
    }

    /**
     * QA-02: Germanized hide flags stored in `hide_vendor_info` survive the
     * overlay read and a new-UI save of the vendor info visibility field.
     */
    public function test_hide_vendor_info_keeps_flags_the_transformer_does_not_own(): void {
        $container = dokan_get_container();
        $this->write_raw_row(
            'dokan_appearance',
            [
                'hide_vendor_info' => [
                    'email'            => '',
                    'phone'            => '',
                    'address'          => '',
                    'dokan_vat_number' => 'dokan_vat_number',
                ],
            ]
        );
        $container->get( SettingsRepository::class )->update(
            [ 'vendor_info_visibility' => $this->visibility( true, true, true ) ]
        );
        // Overlay read.
        $this->assertTrue( dokan_is_vendor_info_hidden( 'dokan_vat_number' ) );

        // New-UI save hiding the phone.
        $container->get( SettingsRepository::class )->update(
            [ 'vendor_info_visibility' => $this->visibility( true, false, true ) ]
        );

        $hide = $this->raw_row( 'dokan_appearance' )['hide_vendor_info'];
        $this->assertSame( 'phone', $hide['phone'] );
        $this->assertSame( 'dokan_vat_number', $hide['dokan_vat_number'] );
        $container->get( LegacySettingsRepository::class )->flush_cache( null );
        $this->assertTrue( dokan_is_vendor_info_hidden( 'dokan_vat_number' ) );
        $this->assertTrue( dokan_is_vendor_info_hidden( 'phone' ) );
    }
}
