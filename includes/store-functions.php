<?php

/**
 * Checks if the theme sidebar is enabled on store page
 *
 * @since DOKAN_LITE_SINCE
 *
 * @return bool
 */
function dokan_store_theme_sidebar_enabled() {
    return 'on' === dokan_get_option( 'enable_theme_store_sidebar', 'dokan_appearance', 'off' );
}
