<?php
namespace WeDevs\Dokan\Utilities;

/**
 * ProductUtil class
 *
 * @since DOKAN_SINCE
 */
class ProductUtil {

    /**
     * Check if product listing should be rendered.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function dokan_should_skip_product_listing_render(): bool {

        /**
         * Filter to control product listing template rendering.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $should_render Whether to render the product listing template.
         */
        return apply_filters( 'dokan_product_listing_template_render', false );
    }
}
