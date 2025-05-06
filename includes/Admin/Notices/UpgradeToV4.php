<?php

namespace WeDevs\Dokan\Admin\Notices;

/**
 * V4 upgrader notice handler class
 *
 * @since 4.0.0
 */
class UpgradeToV4 {

    /**
     * Class constructor
     *
     * @since 4.0.0
     */
    public function __construct() {
        add_filter( 'dokan_admin_notices', [ $this, 'render_notice' ] );
    }

    /**
     * Render upgrade notice.
     *
     * @since 4.0.0
     *
     * @param array $notices Existing notices.
     *
     * @return array
     */
    public function render_notice( $notices ) {
        $has_v3_installed = defined( 'DOKAN_PRO_PLUGIN_VERSION' ) && version_compare( DOKAN_PRO_PLUGIN_VERSION, '4.0.0', '<' );

        if ( ! $has_v3_installed ) {
            return $notices;
        }

        $notices[] = [
            'type'        => 'warning',
            'title'       => esc_html__( 'Dokan Pro Upgrade Required!', 'dokan-lite' ),
            'description' => esc_html__( 'A major update happened in Dokan Pro which is available in v4.0.0. You are using a previous version which may run into some issues if you don\'t update so requesting you to update into the latest version.', 'dokan-lite' ),
            'priority'    => 1,
            'scope'       => 'global',
        ];

        return $notices;
    }
}
