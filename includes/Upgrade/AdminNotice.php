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
     * @param array $notices
     *
     * @return array
     */
    public static function show_notice( $notices ) {
        if ( ! current_user_can( 'update_plugins' ) || dokan()->upgrades->has_ongoing_process() ) {
            return $notices;
        }

        if ( ! dokan()->upgrades->is_upgrade_required() ) {
            /**
             * Fires when upgrade is not required
             *
             * @since 3.0.0
             */
            do_action( 'dokan_upgrade_is_not_required' );
            return $notices;
        }

        $notices[] = [
            'type'              => 'info',
            'title'             => __( 'Dokan Data Update Required', 'dokan-lite' ),
            'description'       => __( 'We need to update your install to the latest version', 'dokan-lite' ),
            'priority'          => 1,
            'actions'           => [
                [
                    'type'            => 'primary',
                    'text'            => __( 'Update', 'dokan-lite' ),
                    'loading_text'    => __( 'Updating...', 'dokan-lite' ),
                    'competed_text'   => __( 'Updated', 'dokan-lite' ),
                    'reload'          => true,
                    'confirm_message' => __( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ),
                    'ajax_data'       => [
                        'action'   => 'dokan_do_upgrade',
                        '_wpnonce' => wp_create_nonce( 'dokan_admin' ),
                    ],
                ],
            ],
        ];

        return $notices;
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
