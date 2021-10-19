<?php

namespace WeDevs\Dokan\Admin;

/**
 * Review notice class
 *
 * For displaying asking for review notice in admin panel
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */
class ReviewNotice {

    /**
     * ReviewNotice constructor
     */
    public function __construct() {
        add_action( 'admin_notices', [ $this, 'show_ask_for_review_notice' ], 0, 1 );
    }

    /**
     * Show ask for review notice
     *
     * @return void
     */
    public function show_ask_for_review_notice() {
        global $pagenow;

        $exclude = [ 'themes.php', 'users.php', 'tools.php', 'options-general.php', 'options-writing.php', 'options-reading.php', 'options-discussion.php', 'options-media.php', 'options-permalink.php', 'options-privacy.php', 'edit-comments.php', 'upload.php', 'media-new.php', 'admin.php', 'import.php', 'export.php', 'site-health.php', 'export-personal-data.php', 'erase-personal-data.php' ];

        if ( in_array( $pagenow, $exclude ) ) {
            return;
        }
}
