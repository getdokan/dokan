<?php

namespace WeDevs\Dokan\Vendor;

use Plugin_Upgrader;
use WP_Ajax_Upgrader_Skin;
use WP_User;
use user_switching;

/**
* User Switching functionality
*
* @since  DOKAN_LITE_SINCE
*/
class UserSwitch {

    /**
     * Load autometically when class initiate
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        add_filter( 'dokan_settings_selling_option_vendor_capability', [ $this, 'add_settings_user_switching' ], 20 );
        add_action( 'admin_notices', [ $this, 'activation_notice' ] );
        add_action( 'wp_ajax_dokan_pro_install_user_switching', [ $this, 'install_user_switching' ] );
        add_filter( 'dokan_admin_localize_script', [ $this, 'add_localize_data' ], 15 );
        add_filter( 'dokan_rest_store_additional_fields', [ $this, 'populate_switch_url' ], 2, 3 );
        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'show_user_switching_message' ], 9 );
    }

    /**
     * Load settings for user switching
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $settings_fields
     *
     * @return array
     */
    public function add_settings_user_switching( $settings_fields ) {
        $settings_fields['enable_user_switching'] = array(
            'name'               => 'enable_user_switching',
            'label'              => __( 'Enable Vendor Switching', 'dokan-lite' ),
            'refresh_after_save' => true,
            'desc'               => __( 'Allow this settings admin can switch any vendor account', 'dokan-lite' ),
            'type'               => 'checkbox',
            'default'            => 'off'
        );

        return $settings_fields;
    }

    /**
     * Activation notice for User Switching
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function activation_notice() {
        $core_plugin_file = 'user-switching/user-switching.php';

        if ( 'off' === dokan_get_option('enable_user_switching', 'dokan_selling', 'off' ) ) {
            return;
        }

        if ( file_exists( WP_PLUGIN_DIR . '/' . $core_plugin_file ) && is_plugin_active( $core_plugin_file ) ) {
            return;
        }

        ?>
        <div class="updated" id="user-switching-installer-notice" style="padding: 3px 10px; position: relative; display: flex; align-items: center;">
            <?php if ( file_exists( WP_PLUGIN_DIR . '/' . $core_plugin_file ) && is_plugin_inactive( $core_plugin_file ) ): ?>
                <p style="flex: 2"><?php echo sprintf( __( 'You just need to activate the <strong>%s</strong> to make it functional.', 'dokan-lite' ), 'User Switching' ); ?></p>
                <p>
                    <a class="button button-primary" href="<?php echo wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $core_plugin_file . '&amp;plugin_status=all&amp;paged=1&amp;s=', 'activate-plugin_' . $core_plugin_file ); ?>"  title="<?php _e( 'Activate this plugin', 'dokan-lite' ); ?>"><?php _e( 'Activate', 'dokan-lite' ); ?></a>
                </p>
            <?php else: ?>
                <p style="flex: 2"><?php echo sprintf( __( "You just need to install the %sUser Switching%s plugin for enabling vendor switching functionality.", "dokan-lite" ), '<a target="_blank" href="https://wordpress.org/plugins/user-switching/">', '</a>' ); ?></p>

                <p>
                    <button id="user-switching-installer" class="button"><?php _e( 'Install Now', 'dokan-lite' ); ?></button>
                </p>
            <?php endif ?>
        </div>

        <script type="text/javascript">
            (function($) {
                $( '#user-switching-installer-notice #user-switching-installer' ).click( function ( e ) {
                    e.preventDefault();
                    $( this ).addClass( 'install-now updating-message' );
                    $( this ).text( '<?php echo esc_js( 'Installing...', 'dokan-lite' ); ?>' );

                    var data = {
                        action: 'dokan_pro_install_user_switching',
                        _wpnonce: '<?php echo wp_create_nonce( 'user-switching-installer-nonce' ); ?>'
                    };

                    $.post( ajaxurl, data, function ( response ) {
                        if ( response.success ) {
                            $( '#user-switching-installer-notice #user-switching-installer' ).attr( 'disabled', 'disabled' );
                            $( '#user-switching-installer-notice #user-switching-installer' ).removeClass( 'install-now updating-message' );
                            $( '#user-switching-installer-notice #user-switching-installer' ).text( '<?php echo esc_js( 'Installed', 'dokan-lite' ); ?>' );
                            window.location.reload();
                        }
                    } );
                } );
            })(jQuery);
        </script>
        <?php
    }

    /**
     * Install User Switching if not installed
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     * */
    public function install_user_switching() {
        if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_REQUEST['_wpnonce'] ), 'user-switching-installer-nonce' ) ) {
            wp_send_json_error( __( 'Error: Nonce verification failed', 'dokan-lite' ) );
        }

        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        $plugin = 'user-switching';
        $api    = plugins_api( 'plugin_information', [ 'slug' => $plugin, 'fields' => [ 'sections' => false ] ] );

        $upgrader = new Plugin_Upgrader( new WP_Ajax_Upgrader_Skin() );
        $result   = $upgrader->install( $api->download_link );
        activate_plugin( 'user-switching/user-switching.php' );

        wp_send_json_success();
    }

    /**
     * Is feature active or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function is_feature_active() {
        if ( 'on' === dokan_get_option('enable_user_switching', 'dokan_selling', 'off' ) ) {
            $core_plugin_file = 'user-switching/user-switching.php';

            if ( file_exists( WP_PLUGIN_DIR . '/' . $core_plugin_file ) && is_plugin_active( $core_plugin_file ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Add localize scription for loading if feature avaiable or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function add_localize_data( $localize_data ) {
        $localize_data['is_vendor_switching_enabled'] = $this->is_feature_active();

        return $localize_data;
    }

    /**
     * Populate swith url for user
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function populate_switch_url( $data, $store, $request ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return $data;
        }

        if ( ! $this->is_feature_active() ) {
            return $data;
        }

        $store_id = $store->get_id();

        if ( ! $store_id ) {
            return $data;
        }

        $data['switch_url'] = html_entity_decode( user_switching::maybe_switch_url( new WP_User( $store_id ) ) );

        return $data;
    }

    /**
     * Switch to or Switch Back to user message in vendor dashboard
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return html
     */
    public function show_user_switching_message() {
        if ( ! class_exists( 'user_switching' ) ) {
            return;
        }

        $user     = wp_get_current_user();
        $old_user = user_switching::get_old_user();

        if ( ! $this->is_feature_active() ) {
            return;
        }

        if ( $old_user ) {
            $switched_locale = false;
            $lang_attr       = '';

            if ( function_exists( 'get_user_locale' ) ) {
                $locale          = get_user_locale( $old_user );
                $switched_locale = switch_to_locale( $locale );
                $lang_attr       = str_replace( '_', '-', $locale );
            }
            ?>
            <div class="dokan-alert dokan-alert-info">
                <span id="user_switching" class="user-switching-message">
                    <?php
                        if ( $lang_attr ) {
                            printf(
                                '<span lang="%s">',
                                esc_attr( $lang_attr )
                            );
                        } else {
                            echo '<span>';
                        }
                    ?>
                    <span class="fa fa-user" style="color:#f05025" aria-hidden="true"></span>
                    <?php
                        $message       = '';
                        $just_switched = isset( $_GET['user_switched'] );
                        if ( $just_switched ) {
                            $message = esc_html( sprintf(
                                /* Translators: 1: user display name; 2: username; */
                                __( 'Switched to %1$s (%2$s).', 'dokan-lite' ),
                                $user->display_name,
                                $user->user_login
                            ) );
                        }
                        $switch_back_url = add_query_arg( array(
                            'redirect_to' => urlencode( user_switching::current_url() ),
                        ), user_switching::switch_back_url( $old_user ) );

                        $message .= sprintf(
                            ' <a href="%s">%s</a>.',
                            esc_url( $switch_back_url ),
                            esc_html( sprintf(
                                /* Translators: 1: user display name; 2: username; */
                                __( 'Switch back to %1$s (%2$s)', 'dokan-lite' ),
                                $old_user->display_name,
                                $old_user->user_login
                            ) )
                        );

                        $message = apply_filters( 'dokan_user_switching_switched_message', $message, $user, $old_user, $switch_back_url, $just_switched );

                        echo wp_kses( $message, array(
                            'a' => array(
                                'href' => array(),
                            ),
                        ) );
                    ?>
                    </span>
                </span>
            </div>
            <?php
            if ( $switched_locale ) {
                restore_previous_locale();
            }
        } elseif ( isset( $_GET['user_switched'] ) ) {
            ?>
            <div class="dokan-alert dokan-alert-warning">
                <span id="user_switching" class="user-switching-message">
                    <?php
                        if ( isset( $_GET['switched_back'] ) ) {
                            echo esc_html( sprintf(
                                /* Translators: 1: user display name; 2: username; */
                                __( 'Switched back to %1$s (%2$s).', 'dokan-lite' ),
                                $user->display_name,
                                $user->user_login
                            ) );
                        } else {
                            echo esc_html( sprintf(
                                /* Translators: 1: user display name; 2: username; */
                                __( 'Switched to %1$s (%2$s).', 'dokan-lite' ),
                                $user->display_name,
                                $user->user_login
                            ) );
                        }
                    ?>
                </span>
            </div>
            <?php
        }
    }

}
