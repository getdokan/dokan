<?php

namespace WeDevs\Dokan\Blocks;

/**
 * Dokan Block For Products.
 *
 * @since 3.7.10
 */
class ProductBlock {

    /**
     * Get Product configurations.
     *
     * @since 3.7.10
     *
     * @return array
     */
    public function get_configurations() {
        $can_create_tags = dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling' );

        return apply_filters(
            'dokan_get_product_block_configurations',
            [
                'disable_popup' => 'on' === dokan_get_option( 'disable_product_popup', 'dokan_selling', 'off' ),
                'statuses' => apply_filters(
                    'dokan_post_status',
                    [
                        'publish' => __( 'Online', 'dokan-lite' ),
                        'draft'   => __( 'Draft', 'dokan-lite' ),
                    ]
                ),
                'visibility_options' => dokan_get_product_visibility_options(),
                'manage_stocks' => 'yes' === get_option( 'woocommerce_manage_stock' ),
                'stock_statuses' => [
                    'instock'    => __( 'In Stock', 'dokan-lite' ),
                    'outofstock' => __( 'Out of Stock', 'dokan-lite' ),
                ],
                'backorders' => [
                    'no'     => __( 'Do not allow', 'dokan-lite' ),
                    'notify' => __( 'Allow, but notify customer', 'dokan-lite' ),
                    'yes'    => __( 'Allow', 'dokan-lite' ),
                ],
                'tags' => [
                    'can_create'  => $can_create_tags,
                    'placeholder' => 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' ),
                    'max_limit'   => apply_filters( 'dokan_product_tags_select_max_length', -1 ),
                ],
                'category' => [
                    'default' => get_term( get_option( 'default_product_cat' ) ),
                ],
                'can_export' => false,
                'can_import' => false,
            ]
        );
    }
}
