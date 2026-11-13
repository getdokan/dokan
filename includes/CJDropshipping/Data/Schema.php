<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Creates and upgrades the CJ Dropshipping tables.
 *
 * @since DOKAN_SINCE
 */
class Schema implements Hookable {

    public const VERSION        = '1.0.1';
    public const VERSION_OPTION = 'dokan_cj_db_version';

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'maybe_install' ], 5 );
    }

    /**
     * Run dbDelta when the stored schema version differs.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function maybe_install(): void {
        if ( self::VERSION === get_option( self::VERSION_OPTION ) ) {
            return;
        }

        self::install();
    }

    /**
     * Table names, keyed by short name.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string>
     */
    public static function tables(): array {
        global $wpdb;

        return [
            'variants' => $wpdb->prefix . 'dokan_cj_variants',
            'stock'    => $wpdb->prefix . 'dokan_cj_variant_stock',
            'links'    => $wpdb->prefix . 'dokan_cj_product_links',
            'orders'   => $wpdb->prefix . 'dokan_cj_order_refs',
        ];
    }

    /**
     * Create or upgrade the tables.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function install(): void {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $collate = $wpdb->get_charset_collate();
        $tables  = self::tables();

        // One row per CJ variant, shared by every vendor that sells it.
        dbDelta(
            "CREATE TABLE {$tables['variants']} (
                vid varchar(64) NOT NULL,
                pid varchar(64) NOT NULL DEFAULT '',
                sku varchar(100) NOT NULL DEFAULT '',
                name varchar(255) NOT NULL DEFAULT '',
                cost_usd decimal(19,4) NOT NULL DEFAULT 0,
                weight_g int(11) unsigned NOT NULL DEFAULT 0,
                volume_cm3 decimal(19,4) NOT NULL DEFAULT 0,
                props varchar(255) NOT NULL DEFAULT '',
                status varchar(20) NOT NULL DEFAULT 'active',
                sync_failures smallint(5) unsigned NOT NULL DEFAULT 0,
                synced_at datetime NULL DEFAULT NULL,
                updated_at datetime NOT NULL,
                PRIMARY KEY  (vid),
                KEY pid (pid),
                KEY synced_at (synced_at)
            ) {$collate};"
        );

        // CJ stock per variant and warehouse country.
        dbDelta(
            "CREATE TABLE {$tables['stock']} (
                vid varchar(64) NOT NULL,
                country varchar(8) NOT NULL,
                cj_qty int(11) NOT NULL DEFAULT 0,
                factory_qty int(11) NOT NULL DEFAULT 0,
                updated_at datetime NOT NULL,
                PRIMARY KEY  (vid,country)
            ) {$collate};"
        );

        // WooCommerce products and variations linked to a CJ variant.
        dbDelta(
            "CREATE TABLE {$tables['links']} (
                product_id bigint(20) unsigned NOT NULL,
                parent_id bigint(20) unsigned NOT NULL DEFAULT 0,
                vendor_id bigint(20) unsigned NOT NULL DEFAULT 0,
                vid varchar(64) NOT NULL DEFAULT '',
                pid varchar(64) NOT NULL DEFAULT '',
                created_at datetime NOT NULL,
                PRIMARY KEY  (product_id),
                UNIQUE KEY vendor_vid (vendor_id,vid),
                KEY vid (vid),
                KEY pid (pid),
                KEY vendor_id (vendor_id),
                KEY parent_id (parent_id)
            ) {$collate};"
        );

        // CJ order numbers and tracking per order and warehouse group.
        dbDelta(
            "CREATE TABLE {$tables['orders']} (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                order_id bigint(20) unsigned NOT NULL,
                vendor_id bigint(20) unsigned NOT NULL DEFAULT 0,
                warehouse varchar(8) NOT NULL DEFAULT '',
                cj_order_no varchar(64) NOT NULL DEFAULT '',
                tracking_no varchar(100) NOT NULL DEFAULT '',
                delivered_at datetime NULL DEFAULT NULL,
                updated_at datetime NOT NULL,
                PRIMARY KEY  (id),
                UNIQUE KEY order_warehouse (order_id,warehouse),
                KEY cj_order_no (cj_order_no),
                KEY vendor_id (vendor_id)
            ) {$collate};"
        );

        update_option( self::VERSION_OPTION, self::VERSION, true );
    }

    /**
     * Drop the tables, for uninstall.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function drop(): void {
        global $wpdb;

        foreach ( self::tables() as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS {$table}" ); // phpcs:ignore WordPress.DB
        }

        delete_option( self::VERSION_OPTION );
    }
}
