<?php
namespace WeDevs\Dokan\Utilities;

class VendorUtil {

    /**
     * Get the vendor default store banner URL.
     *
     * @since 4.0.6
     *
     * @return void
     */
    public static function get_vendor_default_banner_url(): string {
        // Define the default store banner URL from plugin assets
        $default_store_banner = DOKAN_PLUGIN_ASSEST . '/images/default-store-banner.png';

        // Retrieve the default banner URL from Dokan settings, with fallback to the plugin's default banner.
        $banner_url = dokan_get_option( 'default_store_banner', 'dokan_appearance', $default_store_banner );

        /**
         * Filters for the default store banner URL.
         *
         * Allows overriding of the default store banner URL via external plugins or themes.
         * This is particularly useful if there is a need to dynamically change the banner based on specific conditions or configurations.
         *
         * @since 4.0.6
         */
        return apply_filters( 'dokan_get_vendor_default_banner_url', $banner_url );
    }

    /**
     * Get the vendor default store avatar URL.
     *
     * @since 4.0.6
     *
     * @return string
     */
    public static function get_vendor_default_avatar_url(): string {
        // Define the default avatar URL from plugin assets.
        $default_store_avatar = DOKAN_PLUGIN_ASSEST . '/images/mystery-person.jpg';

        // Retrieve the default avatar URL from Dokan settings, with fallback to the plugin's default avatar.
        $avatar_url = dokan_get_option( 'default_store_profile', 'dokan_appearance', $default_store_avatar );

        /**
         * Filters for the default store avatar URL.
         *
         * Allows overriding of the default store avatar URL via external plugins or themes.
         * This is particularly useful if there is a need to dynamically change the avatar based on specific conditions or configurations.
         *
         * @since 4.0.6
         */
        return apply_filters( 'dokan_get_vendor_default_avatar_url', $avatar_url );
    }
}
