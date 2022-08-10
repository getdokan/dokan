<?php

namespace WeDevs\Dokan\CatalogMode\Admin;

/**
 * Class Hooks
 *
 * This class will be responsible for admin settings of Catalog Mode feature
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode\Admin
 */
class Settings {
    /**
     * Class constructor
     *
     * @since 3.6.4
     *
     * @return void
     */
    public function __construct() {
        add_filter( 'dokan_settings_selling_options', [ $this, 'admin_settings' ], 10, 1 );
    }

    /**
     * This method will register catalog mode settings section under Selling Options settings section
     *
     * @since 3.6.4
     *
     * @param array $selling_options
     *
     * @return array
     */
    public function admin_settings( $selling_options ) {
        $catalog_mode_settings = [
            'catalog_mode_settings'                => [
                'name'          => 'catalog_mode_settings',
                'label'         => __( 'Product Catalog Mode', 'dokan-lite' ),
                'type'          => 'sub_section',
                'description'   => __( 'Control Catalog Mode Settings For Your Vendors', 'dokan-lite' ),
                'content_class' => 'sub-section-styles',
            ],
            'catalog_mode_hide_add_to_cart_button' => [
                'name'    => 'catalog_mode_hide_add_to_cart_button',
                'label'   => __( 'Remove Add to Cart Button', 'dokan-lite' ),
                'desc'    => __( 'Check to remove Add to Cart option.', 'dokan-lite' ),
                'type'    => 'switcher',
                'default' => 'off',
            ],
            'catalog_mode_hide_product_price'      => [
                'name'    => 'catalog_mode_hide_product_price',
                'label'   => __( 'Hide Product Price', 'dokan-lite' ),
                'desc'    => __( 'Check to hide product price.', 'dokan-lite' ),
                'type'    => 'switcher',
                'default' => 'off',
                'show_if' => [
                    'catalog_mode_hide_add_to_cart_button' => [
                        'equal' => 'on',
                    ],
                ],
            ],
        ];

        return array_merge( $selling_options, $catalog_mode_settings );
    }
}
