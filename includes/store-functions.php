<?php

/**
 * Checks if the theme sidebar is enabled on store page
 *
 * @since 3.1.0
 *
 * @return bool
 */
function dokan_store_theme_sidebar_enabled() {
    return 'on' === dokan_get_option( 'enable_theme_store_sidebar', 'dokan_appearance', 'off' );
}
