<?php

namespace WeDevs\Dokan\Upgrade;

class Manager {

    private $is_upgrading_db_key = 'dokan_is_upgrading_db';

    /**
     * Checks if update is required or not
     *
     * @since 3.0.0
     *
     * @return bool
     */
    public function is_upgrade_required() {
        /**
         * Filter to upgrade is required or not
         *
         * @since 3.0.0
         *
         * @param bool $is_required Is upgrade required
         */
        return apply_filters( 'dokan_upgrade_is_upgrade_required', false );
    }

    /**
     * Checks for any ongoing process
     *
     * @since 3.0.0
     *
     * @return bool
     */
    public function has_ongoing_process() {
        return ! ! get_option( $this->is_upgrading_db_key, false );
    }

    /**
     * Get upgradable upgrades
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_upgrades() {
        $upgrades = get_option( $this->is_upgrading_db_key, null );

        if ( ! empty( $upgrades ) ) {
            return $upgrades;
        }

        /**
         * Filter upgrades
         *
         * @since 3.0.0
         *
         * @var array
         */
        $upgrades = apply_filters( 'dokan_upgrade_upgrades', [] );

        uksort(
            $upgrades, function ( $a, $b ) {
				return version_compare( $a, $b );
			}
        );

        update_option( $this->is_upgrading_db_key, $upgrades, false );

        return $upgrades;
    }

    /**
     * Run upgrades
     *
     * This will execute every method found in a
     * upgrader class, execute `run` method defined
     * in `DokanUpgrader` abstract class and then finally,
     * `update_db_version` will update the db version
     * reference in database.
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function do_upgrade() {
        $upgrades = $this->get_upgrades();

        foreach ( $upgrades as $version => $upgraders ) {
            foreach ( $upgraders as $upgrader ) {
                $required_version = null;

                if ( is_array( $upgrader ) ) {
                    $required_version = $upgrader['require'];
                    $upgrader         = $upgrader['upgrader'];
                }

                call_user_func( [ $upgrader, 'run' ], $required_version );
                call_user_func( [ $upgrader, 'update_db_version' ] );
            }
        }

        delete_option( $this->is_upgrading_db_key );

        /**
         * Fires after finish the upgrading
         *
         * At this point plugin should update the
         * db version key to version constant like DOKAN_PLUGIN_VERSION
         *
         * @since 3.0.0
         */
        do_action( 'dokan_upgrade_finished' );
    }
}

