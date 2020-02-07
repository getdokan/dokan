<?php

namespace WeDevs\Dokan\Upgrade;

use Exception;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\Traits\AjaxResponseError;

class AdminNotice {

    use AjaxResponseError;

    /**
     * Show admin notice to upgrade Dokan
     *
     * @since 3.0.0
     *
     * @return void
     */
    public static function show_notice() {
        if ( ! current_user_can( 'update_plugins' ) || dokan()->upgrades->has_ongoing_process() ) {
            return;
        }

        if ( ! dokan()->upgrades->is_upgrade_required() ) {
            /**
             * Fires when upgrade is not required
             *
             * @since 3.0.0
             */
            do_action( 'dokan_upgrade_is_not_required' );
            return;
        }

        dokan_get_template_part( 'upgrade-notice' );
        wp_enqueue_style( 'dokan-upgrade', DOKAN_PLUGIN_ASSEST . '/css/dokan-upgrade.css', [], DOKAN_PLUGIN_VERSION );
        wp_localize_script( 'dokan-vue-vendor', 'dokan', dokan()->scripts->get_admin_localized_scripts() );
        wp_enqueue_script( 'dokan-upgrade', DOKAN_PLUGIN_ASSEST . '/js/dokan-upgrade.js', [ 'jquery', 'dokan-vue-vendor', 'dokan-vue-bootstrap' ], DOKAN_PLUGIN_VERSION, true );
    }

    /**
     * Ajax handler method to initiate Dokan upgrade process
     *
     * @since 3.0.0
     *
     * @return void
     */
    public static function do_upgrade() {
        check_ajax_referer( 'dokan_admin' );

        try {
            if ( ! current_user_can( 'update_plugins' ) ) {
                throw new DokanException( 'dokan_ajax_upgrade_error', __( 'You are not authorize to perform this operation.', 'dokan-lite' ), 403 );
            }

            if ( dokan()->upgrades->has_ongoing_process() ) {
                throw new DokanException( 'dokan_ajax_upgrade_error', __( 'There is an upgrading process going on.', 'dokan-lite' ), 400 );
            }

            if ( ! dokan()->upgrades->is_upgrade_required() ) {
                throw new DokanException( 'dokan_ajax_upgrade_error', __( 'Update is not required.', 'dokan-lite' ), 400 );
            }

            dokan()->upgrades->do_upgrade();

            wp_send_json_success( [ 'success' => true ], 201 );
        } catch ( Exception $e ) {
            self::send_response_error( $e );
        }
    }
}
