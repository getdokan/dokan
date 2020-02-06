<?php

namespace WeDevs\Dokan\Abstracts;

use ReflectionClass;

abstract class DokanUpgrader {

    /**
     * Execute upgrader class methods
     *
     * This method will execute every method found in child
     * upgrader class dynamically. Keep in mind that methods
     * should be public static function.
     *
     * @since 3.0.0
     *
     * @param string $required_lite_version Required in case of Pro upgraders
     *
     * @return void
     */
    public static function run( $required_lite_version = null ) {
        // This checkpoint is useful for upgraders set in Dokan Pro
        if ( $required_lite_version ) {
            // Do not use `self::get_db_version_key()` here, `get_db_version_key` method
            // will override in pro
            $lite_db_version = get_option( dokan()->get_db_version_key() );

            if ( version_compare( $lite_db_version, $required_lite_version, '<' ) ) {
                return;
            }
        }

        $methods = get_class_methods( static::class );

        foreach ( $methods as $method ) {
            if ( 'run' !== $method && 'update_db_version' !== $method ) {
                call_user_func( [ static::class, $method ] );
            }
        }
    }

    /**
     * Update the DB version
     *
     * Upgrader files should follow naming convention
     * as V_XX_XX_XX.php where Xs are number following
     * semvar convention. For example if you have a upgrader
     * for version 1.23.40, the the filename should be
     * V_1_23_40.php.
     *
     * @since 3.0.0
     *
     * @return void
     */
    public static function update_db_version() {
        $reflect    = new ReflectionClass( static::class );
        $base_class = $reflect->getShortName();
        $version = str_replace( [ 'V_', '_' ], [ '', '.' ], $base_class );

        update_option( static::get_db_version_key(), $version );
    }

    /**
     * Get db versioning key
     *
     * This method should be overriden in Dokan Pro
     *
     * @since 3.0.0
     *
     * @return string
     */
    public static function get_db_version_key() {
        return dokan()->get_db_version_key();
    }
}
