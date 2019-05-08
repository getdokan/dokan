<?php

/**
 * WordPress settings API For Dokan Admin Settings class
 *
 * @author Tareq Hasan
 */
class Dokan_Admin {

    /**
     * Constructor for the Dokan_Admin class
     *
     * Sets up all the appropriate hooks and actions
     * within our plugin.
     *
     * @return void
     */
    function __construct() {

        add_action( 'admin_init', array($this, 'do_updates' ) );

        add_action( 'admin_menu', array($this, 'admin_menu') );

        add_action( 'admin_notices', array($this, 'update_notice' ) );

        add_action( 'admin_notices', array( $this, 'promotional_offer' ) );

        add_action( 'wp_before_admin_bar_render', array( $this, 'dokan_admin_toolbar' ) );
    }

    /**
     * Added promotion notice
     *
     * @since  2.5.6
     *
     * @return void
     */
    public function promotional_offer() {

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // check if it has already been dismissed
        $offer_key   = 'dokan_wedevs_19_birthday_offer';
        $offer_last_date = strtotime( '2019-03-24 12:00:00' );
        $hide_notice = get_option( $offer_key, 'show' );
        $offer_link  = 'https://wedevs.com/dokan/?add-to-cart=15310&variation_id=15314&attribute_pa_license=professional&coupon_code=BIRTHDAY33';

        $allowed_html = array(
            'p'       => array(),
            'strong'  => array(),
            'a'       => array(
                'href'   => array(),
                'title'  => array(),
                'target' => array()
            )
        );
        $content = __( '<p>It’s Our Birthday 🎂 But You Get The Gifts! <strong>33%% off</strong> On All Dokan Pro Packages. Coupon Code: <strong><code>BIRTHDAY33</code></strong>. [Limited Time ⌛ Offer] <a target="_blank" href="%s">Grab The Deal</a></p>', 'dokan-lite' );

        if ( current_time( 'timestamp' ) > $offer_last_date ) {
            return;
        }

        if ( 'hide' == $hide_notice || dokan()->is_pro_exists() ) {
            return;
        }
        ?>
            <div class="notice notice-success is-dismissible" id="dokan-christmas-notice">
                <?php printf( wp_kses( $content, $allowed_html ), esc_url( $offer_link ) ); ?>
            </div>

            <style>
                #dokan-christmas-notice p {
                    font-size: 14px;
                }
            </style>

            <script type='text/javascript'>
                jQuery('body').on('click', '#dokan-christmas-notice .notice-dismiss', function(e) {
                    e.preventDefault();

                    wp.ajax.post( 'dokan-dismiss-christmas-offer-notice', {
                        dokan_christmas_dismissed: true,
                        nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>'
                    });
                });
            </script>
        <?php
    }

    /**
     * Dashboard scripts and styles
     *
     * @since 1.0
     *
     * @return void
     */
    function dashboard_script() {
        wp_enqueue_style( 'dokan-admin-css' );
        wp_enqueue_style( 'jquery-ui' );

        wp_enqueue_script( 'jquery-ui-datepicker' );
        wp_enqueue_script( 'wp-color-picker' );
        wp_enqueue_script( 'dokan-flot' );
        wp_enqueue_script( 'dokan-chart' );

        do_action( 'dokan_enqueue_admin_dashboard_script' );
    }

    /**
     * Load admin Menu
     *
     * @since 1.0
     *
     * @return void
     */
    function admin_menu() {
        global $submenu;

        $menu_position = dokan_admin_menu_position();
        $capability    = dokana_admin_menu_capability();
        $withdraw      = dokan_get_withdraw_count();
        $withdraw_text = __( 'Withdraw', 'dokan-lite' );
        $slug          = 'dokan';

        if ( $withdraw['pending'] ) {
            $withdraw_text = sprintf( __( 'Withdraw %s', 'dokan-lite' ), '<span class="awaiting-mod count-1"><span class="pending-count">' . $withdraw['pending'] . '</span></span>' );
        }

        $dashboard = add_menu_page( __( 'Dokan', 'dokan-lite' ), __( 'Dokan', 'dokan-lite' ), $capability, $slug, array( $this, 'dashboard'), 'data:image/svg+xml;base64,' . base64_encode( '<svg width="58px" height="63px" viewBox="0 0 58 63" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="dokan-icon" fill-rule="nonzero" fill="#9EA3A8"><path d="M5.33867702,3.0997123 C5.33867702,3.0997123 40.6568031,0.833255993 40.6568031,27.7724223 C40.6568031,54.7115885 31.3258879,60.1194199 23.1436827,61.8692575 C23.1436827,61.8692575 57.1718639,69.1185847 57.1718639,31.1804393 C57.1718639,-6.75770611 13.7656892,-1.28321423 5.33867702,3.0997123 Z" id="Shape"></path><path d="M34.0564282,48.9704547 C34.0564282,48.9704547 30.6479606,59.4444826 20.3472329,60.7776922 C10.0465051,62.1109017 8.12571122,57.1530286 0.941565611,57.4946635 C0.941565611,57.4946635 0.357794932,52.5784532 6.1578391,51.8868507 C11.9578833,51.1952482 22.8235504,52.5451229 30.0547743,48.5038314 C30.0547743,48.5038314 34.3294822,46.5206821 35.1674756,45.5624377 L34.0564282,48.9704547 Z" id="Shape"></path><path d="M4.80198462,4.99953596 L4.80198462,17.9733318 L4.80198462,17.9733318 L4.80198462,50.2869992 C5.1617776,50.2053136 5.52640847,50.1413326 5.89420073,50.0953503 C7.92701701,49.903571 9.97004544,49.8089979 12.0143772,49.8120433 C14.1423155,49.8120433 16.4679825,49.7370502 18.7936496,49.5454014 L18.7936496,34.3134818 C18.7936496,29.2472854 18.426439,24.0727656 18.7936496,19.0149018 C19.186126,15.9594324 21.459175,13.3479115 24.697266,12.232198 C27.2835811,11.3792548 30.1586431,11.546047 32.5970015,12.6904888 C20.9498348,5.04953132 7.86207285,4.89954524 4.80198462,4.99953596 Z" id="Shape"></path></g></g></svg>' ), $menu_position );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = array( __( 'Dashboard', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/' );
            $submenu[ $slug ][] = array( __( 'Withdraw', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/withdraw?status=pending' );

            if ( ! dokan()->is_pro_exists() ) {
                $submenu[ $slug ][] = array( __( 'PRO Features', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/premium' );
            }
        }

        do_action( 'dokan_admin_menu', $capability, $menu_position );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = array( __( '<span style="color:#f18500">Help</span>', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/help' );
            $submenu[ $slug ][] = array( __( 'Settings', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/settings' );
        }

        add_action( $dashboard, array($this, 'dashboard_script' ) );
    }

    /**
     * Load Dashboard Template
     *
     * @since 1.0
     *
     * @return void
     */
    function dashboard() {
        echo '<div class="wrap"><div id="dokan-vue-admin"></div></div>';
    }

    /**
     * Add Menu in Dashboard Top bar
     *
     * @return array [top menu bar]
     */
    function dokan_admin_toolbar() {
        global $wp_admin_bar;

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $args = array(
            'id'     => 'dokan',
            'title'  => __( 'Dokan', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan' )
        );

        $wp_admin_bar->add_menu( $args );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-dashboard',
            'parent' => 'dokan',
            'title'  => __( 'Dashboard', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-withdraw',
            'parent' => 'dokan',
            'title'  => __( 'Withdraw', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan#/withdraw' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-pro-features',
            'parent' => 'dokan',
            'title'  => __( 'PRO Features', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan#/premium' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-settings',
            'parent' => 'dokan',
            'title'  => __( 'Settings', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan#/settings' )
        ) );

        /**
         * Add new or remove toolbar
         *
         * @since 2.5.3
         */
        do_action( 'dokan_render_admin_toolbar', $wp_admin_bar );
    }

    /**
     * Doing Updates and upgrade
     *
     * @since 1.0
     *
     * @return void
     */
    public function do_updates() {
        if ( isset( $_GET['dokan_do_update'] ) && 'true' == $_GET['dokan_do_update'] && current_user_can( 'manage_options' ) ) {
            $installer = new Dokan_Installer();
            $installer->do_upgrades();
        }
    }

    /**
     * Check is dokan need any update
     *
     * @since 1.0
     *
     * @return boolean
     */
    public function is_dokan_needs_update() {
        $installed_version = get_option( 'dokan_theme_version' );

        // may be it's the first install
        if ( ! $installed_version ) {
            return false;
        }

        if ( version_compare( $installed_version, '1.2', '<' ) ) {
            return true;
        }

        return false;
    }

    /**
     * Show update notice in dokan dashboard
     *
     * @since 1.0
     *
     * @return void
     */
    public function update_notice() {
        if ( ! $this->is_dokan_needs_update() ) {
            return;
        }
        ?>
        <div id="message" class="updated">
            <p><?php printf( '<strong>%s &#8211; %s</strong>', esc_attr__( 'Dokan Data Update Required', 'dokan-lite' ), esc_attr__( 'We need to update your install to the latest version', 'dokan-lite' ) ); ?></p>
            <p class="submit"><a href="<?php echo esc_url( add_query_arg( 'dokan_do_update', 'true', admin_url( 'admin.php?page=dokan' ) ) ); ?>" class="dokan-update-btn button-primary"><?php esc_html_e( 'Run the updater', 'dokan-lite' ); ?></a></p>
        </div>

        <script type="text/javascript">
            jQuery('.dokan-update-btn').click('click', function(){
                return confirm( '<?php esc_html_e( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ); ?>' );
            });
        </script>
    <?php
    }
}

$settings = new Dokan_Admin();
