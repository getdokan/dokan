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
     * Load automatically when class initiate
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        add_filter( 'dokan_admin_localize_script', [ $this, 'add_localize_data' ], 15 );
        add_filter( 'dokan_rest_store_additional_fields', [ $this, 'populate_switch_url' ], 2, 3 );
        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'show_user_switching_message' ], 9 );
    }

    /**
     * Is feature active or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return boolean
     */
    public function is_feature_active() {
        $core_plugin_file = 'user-switching/user-switching.php';

        if ( file_exists( WP_PLUGIN_DIR . '/' . $core_plugin_file ) && is_plugin_active( $core_plugin_file ) ) {
            return true;
        }

        return false;
    }

    /**
     * Add localize scription for loading if feature available or not
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
     * Populate switch url for user
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
     * @return void
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
