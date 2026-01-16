<?php
namespace WeDevs\Dokan\Utilities;

class VendorUtil {

    /**
     * Get the vendor default store banner URL.
     *
     * @since 4.0.6
     *
     * @return string The default store banner URL.
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


    /**
     * Get the vendor/store ID associated with a user.
     *
     * This method determines the vendor ID based on the user's role:
     * - Vendors: Returns their own user ID as the vendor ID
     * - Vendor staff: Returns their parent vendor's ID (stored in user meta)
     * - Other users: Returns 0 if not associated with any vendor
     *
     * @since 4.2.5
     *
     * @param int $user_id Optional. The user ID to get the vendor ID for. Defaults to 0 (current user).
     *
     * @return int The vendor/store ID. Returns 0 if the user is not a vendor or vendor staff,
     *             or if vendor ID cannot be determined.
     */
    public static function get_vendor_id_for_user( int $user_id = 0 ): int {
        if ( empty( $user_id ) ) {
            $user_id = dokan_get_current_user_id();
        }

        if ( dokan_is_user_seller( $user_id, true ) ) {
            return (int) $user_id;
        }

        if ( user_can( $user_id, 'vendor_staff' ) ) {
            $vendor_id = (int) get_user_meta( $user_id, '_vendor_id', true );

            return $vendor_id;
        }

        return 0;
    }
}
