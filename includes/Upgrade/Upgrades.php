<?php

namespace WeDevs\Dokan\Upgrade;

class Upgrades {

    /**
     * Dokan Lite upgraders
     *
     * @since 3.0.0
     *
     * @var array
     */
    private static $upgrades = [
        '1.2'    => Upgrades\V_1_2::class,
        '2.1'    => Upgrades\V_2_1::class,
        '2.3'    => Upgrades\V_2_3::class,
        '2.4.11' => Upgrades\V_2_4_11::class,
        '2.4.12' => Upgrades\V_2_4_12::class,
        '2.5.7'  => Upgrades\V_2_5_7::class,
        '2.6.9'  => Upgrades\V_2_6_9::class,
        '2.7.3'  => Upgrades\V_2_7_3::class,
        '2.7.6'  => Upgrades\V_2_7_6::class,
        '2.8.0'  => Upgrades\V_2_8_0::class,
        '2.8.3'  => Upgrades\V_2_8_3::class,
        '2.8.6'  => Upgrades\V_2_8_6::class,
        '2.9.4'  => Upgrades\V_2_9_4::class,
        '2.9.13' => Upgrades\V_2_9_13::class,
        '2.9.16' => Upgrades\V_2_9_16::class,
        '2.9.19' => Upgrades\V_2_9_19::class,
        '2.9.23' => Upgrades\V_2_9_23::class,
        '3.0.4'  => Upgrades\V_3_0_4::class,
        '3.0.10' => Upgrades\V_3_0_10::class,
        '3.1.0'  => Upgrades\V_3_1_0::class,
        '3.1.1'  => Upgrades\V_3_1_1::class,
        '3.2.12' => Upgrades\V_3_2_12::class,
        '3.3.1'  => Upgrades\V_3_3_1::class,
        '3.3.7'  => Upgrades\V_3_3_7::class,
        '3.3.8'  => Upgrades\V_3_3_8::class,
        '3.5.1'  => Upgrades\V_3_5_1::class,
        '3.6.2'  => Upgrades\V_3_6_2::class,
        '3.6.4'  => Upgrades\V_3_6_4::class,
        '3.6.5'  => Upgrades\V_3_6_5::class,
        '3.7.10' => Upgrades\V_3_7_10::class,
        '3.7.19' => Upgrades\V_3_7_19::class,
    ];

    /**
     * Get DB installed version number
     *
     * @since 3.0.0
     *
     * @return string
     */
    public static function get_db_installed_version() {
        return get_option( dokan()->get_db_version_key(), null );
    }

    /**
     * Checks if upgrade is required or not
     *
     * @since 3.0.0
     *
     * @param bool $is_required
     *
     * @return bool
     */
    public static function is_upgrade_required( $is_required = false ) {
        $installed_version = self::get_db_installed_version();
        $upgrade_versions  = array_keys( self::$upgrades );

        if ( $installed_version && version_compare( $installed_version, end( $upgrade_versions ), '<' ) ) {
            return true;
        }

        return $is_required;
    }

    /**
     * Update Dokan DB version
     *
     * @since 3.0.0
     *
     * @return void
     */
    public static function update_db_dokan_version() {
        $installed_version = self::get_db_installed_version();

        if ( version_compare( $installed_version, DOKAN_PLUGIN_VERSION, '<' ) ) {
            update_option( dokan()->get_db_version_key(), DOKAN_PLUGIN_VERSION );
        }
    }

    /**
     * Get upgrades
     *
     * @since 3.0.0
     *
     * @param array $upgrades
     *
     * @return array
     */
    public static function get_upgrades( $upgrades = [] ) {
        if ( ! self::is_upgrade_required() ) {
            return $upgrades;
        }

        $installed_version = self::get_db_installed_version();

        foreach ( self::$upgrades as $version => $class_name ) {
            if ( version_compare( $installed_version, $version, '<' ) ) {
                $upgrades[ $version ][] = $class_name;
            }
        }

        return $upgrades;
    }
}
