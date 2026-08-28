<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Vendor\Vendor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Deterministic dummy vendor used for editor previews of store blocks.
 *
 * Never backed by a real vendor, so previews are stable, privacy-safe and
 * work on an empty marketplace — the same approach the Elementor module's
 * StoreData editing mode uses.
 *
 * @since DOKAN_SINCE
 */
class PreviewVendor extends Vendor {

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        parent::__construct( null );
    }

    /**
     * Preview data set, filterable for extensions.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function get_preview_data(): array {
        return apply_filters(
            'dokan_blocks_preview_vendor_data',
            [
                'name'    => __( 'Store Name', 'dokan-lite' ),
                'banner'  => DOKAN_PLUGIN_ASSEST . '/images/default-store-banner.png',
                'avatar'  => get_avatar_url( 0, [ 'size' => 150 ] ),
                'address' => __( 'New York, United States (US)', 'dokan-lite' ),
                'phone'   => '123-456-7890',
                'email'   => 'mail@store.com',
                'social'  => [
                    'fb'        => '#',
                    'twitter'   => '#',
                    'linkedin'  => '#',
                    'youtube'   => '#',
                    'instagram' => '#',
                ],
            ]
        );
    }

    /**
     * Whether this vendor instance is an editor preview stand-in.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_preview(): bool {
        return true;
    }

    /**
     * Vendor id of the stand-in.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_id() {
        return 0;
    }

    /**
     * Preview store name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_shop_name() {
        return $this->get_preview_data()['name'];
    }

    /**
     * Placeholder store URL; a preview links nowhere.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_shop_url() {
        return '#';
    }

    /**
     * Preview store banner URL.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_banner(): string {
        return $this->get_preview_data()['banner'];
    }

    /**
     * Attachment id of the preview banner.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_banner_id() {
        return 0;
    }

    /**
     * Preview store avatar URL.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_avatar() {
        return $this->get_preview_data()['avatar'];
    }

    /**
     * Attachment id of the preview avatar.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_avatar_id() {
        return 0;
    }

    /**
     * Preview phone number.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_phone() {
        return $this->get_preview_data()['phone'];
    }

    /**
     * Preview email address.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_email() {
        return $this->get_preview_data()['email'];
    }

    /**
     * Whether the preview shows its email.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function show_email() {
        return true;
    }

    /**
     * Preview rating, as `rating` and `count`.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_rating() {
        return [
            'rating' => '5.00',
            'count'  => 2,
        ];
    }

    /**
     * Preview social profile URLs.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_social_profiles() {
        return $this->get_preview_data()['social'];
    }

    /**
     * Preview store info.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_shop_info() {
        return [];
    }

    /**
     * Preview opening hours.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_store_time() {
        return [];
    }

    /**
     * Whether the preview advertises opening hours.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_store_time_enabled() {
        return false;
    }

    /**
     * Whether the preview is a featured vendor.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_featured() {
        return false;
    }

    /**
     * Preview terms and conditions copy.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_store_tnc() {
        return __( 'The terms and conditions the vendor sets from the dashboard will show here.', 'dokan-lite' );
    }
}
