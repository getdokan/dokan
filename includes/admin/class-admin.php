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

        add_action( 'admin_head', array( $this, 'welcome_page_remove' ) );

        add_action( 'admin_notices', array($this, 'update_notice' ) );

        // add_action( 'admin_notices', array($this, 'promotional_offer' ) );

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
        $offer_key = 'dokan_package_offer';
        $hide_notice = get_option( $offer_key . '_tracking_notice', 'no' );

        if ( 'hide' == $hide_notice ) {
            return;
        }

        $offer_msg = sprintf( __( '<h2>
                        Dokan is Getting More Affordable: Price Reduction & Changes in Packages
                    </h2>', 'dokan-lite' ) );
        $offer_msg .= sprintf( __( '<p>Marketplaces are changing, so is Dokan Multivendor. We are reducing Dokan Pro entry package price and bringing entirely new pricing where you get addons pre-activated for free depending on your package.</p>', 'dokan-lite' ) );
        ?>
            <div class="notice is-dismissible" id="dokan-promotional-offer-notice">
                <img src="https://ps.w.org/dokan-lite/assets/icon-256x256.png?rev=1595714" alt="">
                <?php echo $offer_msg; ?>
                <span class="dashicons dashicons-megaphone"></span>
                <a href="https://wedevs.com/in/dokan-new-package-blog-via-lite" class="button button-primary promo-btn" target="_blank"><?php _e( 'View Package', 'dokan-lite' ); ?></a>
            </div>

            <style>
                #dokan-promotional-offer-notice {
                    background-color: #F35E33;
                    border-left: 0px;
                    padding-left: 83px;
                }

                #dokan-promotional-offer-notice a.promo-btn{
                    background: #fff;
                    border-color: #fafafa #fafafa #fafafa;
                    box-shadow: 0 1px 0 #fafafa;
                    color: #F35E33;
                    text-decoration: none;
                    text-shadow: none;
                    position: absolute;
                    top: 30px;
                    right: 26px;
                    height: 40px;
                    line-height: 40px;
                    width: 130px;
                    text-align: center;
                }

                #dokan-promotional-offer-notice h2{
                    font-size: 18px;
                    width: 85%;
                    color: rgba(250, 250, 250, 1);
                    margin-bottom: 8px;
                    font-weight: normal;
                    margin-top: 15px;
                    -webkit-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    -moz-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    -o-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                }

                #dokan-promotional-offer-notice img{
                    position: absolute;
                    width: 80px;
                    top: 10px;
                    left: 0px;
                }

                #dokan-promotional-offer-notice h2 span {
                    position: relative;
                    top: -1px;
                }

                #dokan-promotional-offer-notice p{
                    width: 85%;
                    color: rgba(250, 250, 250, 0.77);
                    font-size: 14px;
                    margin-bottom: 10px;
                    -webkit-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    -moz-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    -o-text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                    text-shadow: 0.1px 0.1px 0px rgba(250, 250, 250, 0.24);
                }

                #dokan-promotional-offer-notice p strong.highlight-text{
                    color: #fff;
                }

                #dokan-promotional-offer-notice p a {
                    color: #fafafa;
                }

                #dokan-promotional-offer-notice .notice-dismiss:before {
                    color: #fff;
                }

                #dokan-promotional-offer-notice span.dashicons-megaphone {
                    position: absolute;
                    top: 16px;
                    right: 248px;
                    color: rgba(253, 253, 253, 0.29);
                    font-size: 96px;
                    transform: rotate(-21deg);
                }

            </style>

            <script type='text/javascript'>
                jQuery('body').on('click', '#dokan-promotional-offer-notice .notice-dismiss', function(e) {
                    e.preventDefault();

                    wp.ajax.post('dokan-dismiss-promotional-offer-notice', {
                        dokan_promotion_dismissed: true
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
        wp_enqueue_style( 'dokan-chosen-style' );

        wp_enqueue_script( 'jquery-ui-datepicker' );
        wp_enqueue_script( 'wp-color-picker' );
        wp_enqueue_script( 'dokan-flot' );
        wp_enqueue_script( 'dokan-chart' );
        wp_enqueue_script( 'dokan-chosen' );

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

        /**
         * Welcome page
         *
         * @since 2.4.3
         */
        add_dashboard_page( __( 'Welcome to Dokan', 'dokan-lite' ), __( 'Welcome to Dokan', 'dokan-lite' ), $capability, 'dokan-welcome', array( $this, 'welcome_page' ) );

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
     * Load withdraw template
     *
     * @since 1.0
     *
     * @return void
     */
    function withdraw_page() {
        include dirname(__FILE__) . '/views/withdraw.php';
    }

    /**
     * Pro listing page
     *
     * @since 2.5.3
     *
     * @return void
     */
    function pro_features() {
        include dirname(__FILE__) . '/views/pro-features.php';
    }

    /**
     * Plugin help page
     *
     * @since 2.4.9
     *
     * @return void
     */
    function help_page() {
        include dirname( __FILE__ ) . '/views/help.php';
    }

    /**
     * Laad Addon template
     *
     * @since 1.0
     *
     * @return void
     */
    function addon_page() {
        include dirname(__FILE__) . '/views/add-on.php';
    }

    /**
     * Include welcome page template
     *
     * @since 2.4.3
     *
     * @return void
     */
    function welcome_page() {
        include_once dirname(__FILE__) . '/views/welcome.php';
    }

    /**
     * Remove the welcome page dashboard menu
     *
     * @since 2.4.3
     *
     * @return void
     */
    function welcome_page_remove() {
        remove_submenu_page( 'index.php', 'dokan-welcome' );
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
            'title'  => __( 'Dokan Dashboard', 'dokan-lite' ),
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
//        Dokan_Admin_Withdraw::init()->bulk_action_handler();

        if ( isset( $_GET['dokan_do_update'] ) && $_GET['dokan_do_update'] == 'true' ) {
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
            <p><?php _e( '<strong>Dokan Data Update Required</strong> &#8211; We need to update your install to the latest version', 'dokan-lite' ); ?></p>
            <p class="submit"><a href="<?php echo add_query_arg( 'dokan_do_update', 'true', admin_url( 'admin.php?page=dokan' ) ); ?>" class="dokan-update-btn button-primary"><?php _e( 'Run the updater', 'dokan-lite' ); ?></a></p>
        </div>

        <script type="text/javascript">
            jQuery('.dokan-update-btn').click('click', function(){
                return confirm( '<?php _e( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ); ?>' );
            });
        </script>
    <?php
    }
}

$settings = new Dokan_Admin();
