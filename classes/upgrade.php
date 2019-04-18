<?php
/**
 * Dokan Upgrade class
 *
 * Performas upgrade dokan latest version
 *
 * @since 2.1
 *
 * @package Dokan
 */
class Dokan_Upgrade {

    /** @var array DB updates that need to be run */
    private static $updates = [
        '1.2'    => 'upgrades/dokan-upgrade-1.2.php',
        '2.1'    => 'upgrades/dokan-upgrade-2.1.php',
        '2.3'    => 'upgrades/dokan-upgrade-2.3.php',
        '2.4.11' => 'upgrades/dokan-upgrade-2.4.11.php',
        '2.4.12' => 'upgrades/dokan-upgrade-2.4.12.php',
        '2.5.7'  => 'upgrades/dokan-upgrade-2.5.7.php',
        '2.6.9'  => 'upgrades/dokan-upgrade-2.6.9.php',
        '2.7.3'  => 'upgrades/dokan-upgrade-2.7.3.php',
        '2.7.6'  => 'upgrades/dokan-upgrade-2.7.6.php',
        '2.8.0'  => 'upgrades/dokan-upgrade-2.8.0.php',
        '2.8.3'  => 'upgrades/dokan-upgrade-2.8.3.php',
        '2.8.6'  => 'upgrades/dokan-upgrade-2.8.6.php',
        '2.9.4'  => 'upgrades/dokan-upgrade-2.9.4.php',
        '2.9.13' => 'upgrades/dokan-upgrade-2.9.13.php',
    ];

    /**
     * Constructor loader function
     *
     * Load autometically when class instantiate.
     *
     * @since 1.0
     */
    function __construct() {
        add_action( 'admin_notices', array( $this, 'show_update_notice' ) );
        add_action( 'admin_init', array( $this, 'do_updates' ) );
    }

    /**
     * Check if need any update
     *
     * @since 1.0
     *
     * @return boolean
     */
    public function is_needs_update() {
        $installed_version = get_option( 'dokan_theme_version' );

        // may be it's the first install
        if ( ! $installed_version ) {
            return false;
        }

        if ( version_compare( $installed_version, DOKAN_PLUGIN_VERSION, '<' ) ) {
            return true;
        }

        return false;
    }

    /**
     * Show update notice
     *
     * @since 1.0
     *
     * @return void
     */
    public function show_update_notice() {
        if ( ! current_user_can( 'update_plugins' ) || ! $this->is_needs_update() ) {
            return;
        }

        $installed_version = get_option( 'dokan_theme_version' );
        $updates_versions  = array_keys( self::$updates );

        if ( ! is_null( $installed_version ) && version_compare( $installed_version, end( $updates_versions ), '<' ) ) {
            $url = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
            ?>
                <div id="message" class="updated">
                    <p><?php printf( '<strong>%s  &#8211; %s</strong>', esc_attr__( 'Dokan Data Update Required', 'dokan-lite' ), esc_attr__( 'We need to update your install to the latest version', 'dokan-lite' ) ); ?></p>
                    <p class="submit"><a href="<?php echo esc_url( add_query_arg( [ 'dokan_do_update' => true ], $url ) ); ?>" class="dokan-update-btn button-primary"><?php esc_attr_e( 'Run the updater', 'dokan-lite' ); ?></a></p>
                </div>

                <script type="text/javascript">
                    jQuery('.dokan-update-btn').click('click', function(){
                        return confirm( '<?php esc_attr_e( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ); ?>' );
                    });
                </script>
            <?php
        } else {
            update_option( 'dokan_theme_version', DOKAN_PLUGIN_VERSION );
        }
    }


    /**
     * Do all updates when Run updater btn click
     *
     * @since 1.0
     *
     * @return void
     */
    public function do_updates() {
        if ( isset( $_GET['dokan_do_update'] ) && sanitize_text_field( wp_unslash( $_GET['dokan_do_update'] ) ) ) {
            $this->perform_updates();
        }
    }


    /**
     * Perform all updates
     *
     * @since 1.0
     *
     * @return void
     */
    public function perform_updates() {
        if ( ! $this->is_needs_update() ) {
            return;
        }

        $installed_version = get_option( 'dokan_theme_version' );

        foreach ( self::$updates as $version => $path ) {
            if ( version_compare( $installed_version, $version, '<' ) ) {
                include DOKAN_INC_DIR . '/' . $path;
                update_option( 'dokan_theme_version', $version );
            }
        }

        update_option( 'dokan_theme_version', DOKAN_PLUGIN_VERSION );

        $url = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

        $location = remove_query_arg( ['dokan_do_update'], esc_url( $url ) );
        wp_redirect( $location );
        exit();
    }

}
