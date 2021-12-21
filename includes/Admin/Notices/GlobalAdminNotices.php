<?php

namespace WeDevs\Dokan\Admin\Notices;

/**
 * Dokan global admin notice handler class
 *
 * @since 3.3.5
 */
class GlobalAdminNotices {
    /**
     * Class constructor
     *
     * @since 3.3.5
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'render_global_admin_notices_html' ], 8 );
        add_action( 'admin_notices', [ $this, 'enqueue_global_admin_notices_scripts' ] );
    }

    /**
     * Render dokan global admin notices via Vue.js
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_global_admin_notices_html() {
        echo '<div id="dokan-admin-notices"></div>';
    }

    /**
     * Enqueue dokan global admin notices scripts
     *
     * @since 3.3.5
     *
     * @return void
     */
    public function enqueue_global_admin_notices_scripts() {
        wp_enqueue_script( 'dokan-admin-notice-js' );
        wp_localize_script( 'dokan-vue-vendor', 'dokan', dokan()->scripts->get_admin_localized_scripts());
    }
}
