<?php

namespace WeDevs\Dokan\CJDropshipping\Admin;

use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Adds the CJ Dropshipping page to the admin settings.
 *
 * @since DOKAN_SINCE
 */
class SettingsSchema implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_get_admin_settings_schema', [ $this, 'append_schema' ], 20 );
    }

    /**
     * Append the CJ subpage, sections and fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Schema elements.
     *
     * @return array
     */
    public function append_schema( $elements ): array {
        $enabled_only = [
            [
                'key'        => 'cj_enabled',
                'value'      => 'on',
                'to_self'    => true,
                'attribute'  => 'display',
                'effect'     => 'show',
                'comparison' => '===',
            ],
        ];

        $fields = [
            [
                'id'          => 'cj_dropshipping',
                'type'        => 'subpage',
                'page_id'     => 'product',
                'title'       => __( 'CJ Dropshipping', 'dokan-lite' ),
                'description' => __( 'Let vendors import CJ Dropshipping products and sell them without holding stock. Your marketplace connects one CJ account, which Dokan uses to read CJ\'s catalog, stock and shipping prices. Vendors place and pay their orders on their own CJ accounts.', 'dokan-lite' ),
                'priority'    => 210,
            ],
            [
                'id'          => 'cj_connection_section',
                'type'        => 'section',
                'subpage_id'  => 'cj_dropshipping',
                'title'       => __( 'CJ account', 'dokan-lite' ),
            ],
            [
                'id'            => 'cj_enabled',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'cj_connection_section',
                'title'         => __( 'Enable CJ Dropshipping', 'dokan-lite' ),
                'description'   => __( 'Show CJ Dropshipping in the vendor dashboard so vendors can import CJ products.', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
                    'label' => __( 'Enabled', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state' => [
                    'label' => __( 'Disabled', 'dokan-lite' ),
                    'value' => 'off',
                ],
                'legacy_key'    => [
                    'option' => Settings::OPTION,
                    'field'  => 'enabled',
                ],
            ],
            [
                'id'           => 'cj_connection',
                'type'         => 'field',
                'variant'      => 'cj_connection',
                'section_id'   => 'cj_connection_section',
                'title'        => __( 'Marketplace CJ account', 'dokan-lite' ),
                'description'  => __( 'Paste the API key from CJ: My CJ > Apps > API > Add API (type "API Key"). Use a CJ account only for this marketplace. CJ pauses API access after 30 days without a purchase on the account; Dokan warns you before that.', 'dokan-lite' ),
                'dependencies' => $enabled_only,
            ],
            [
                'id'          => 'cj_catalog_section',
                'type'        => 'section',
                'subpage_id'  => 'cj_dropshipping',
                'title'        => __( 'Stock and shipping', 'dokan-lite' ),
                'dependencies' => $enabled_only,
            ],
            [
                'id'           => 'cj_stock_source',
                'type'         => 'field',
                'variant'      => 'radio_capsule',
                'section_id'   => 'cj_catalog_section',
                'title'        => __( 'Stock that counts', 'dokan-lite' ),
                'description'  => __( 'CJ reports stock on its own shelves and stock its suppliers hold. Most CJ products are mostly supplier stock, so counting only CJ\'s shelf shows many products out of stock. CJ\'s shelf ships faster and is checked by CJ.', 'dokan-lite' ),
                'default'      => 'all',
                'options'      => [
                    [
                        'title' => __( 'CJ and supplier stock', 'dokan-lite' ),
                        'value' => 'all',
                    ],
                    [
                        'title' => __( 'CJ\'s shelf only', 'dokan-lite' ),
                        'value' => 'warehouse',
                    ],
                ],
                'legacy_key'   => [
                    'option' => Settings::OPTION,
                    'field'  => 'stock_source',
                ],
                'dependencies' => $enabled_only,
            ],
            [
                'id'            => 'cj_show_warehouse_country',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'cj_catalog_section',
                'title'         => __( 'Show the warehouse country to buyers', 'dokan-lite' ),
                'description'   => __( 'Off: buyers see "Standard shipping". On: they see where the parcel ships from, such as "Ships from China", when it comes from one warehouse.', 'dokan-lite' ),
                'default'       => 'off',
                'enable_state'  => [
                    'label' => __( 'Show', 'dokan-lite' ),
                    'value' => 'on',
                ],
                'disable_state' => [
                    'label' => __( 'Hide', 'dokan-lite' ),
                    'value' => 'off',
                ],
                'legacy_key'    => [
                    'option' => Settings::OPTION,
                    'field'  => 'show_warehouse_country',
                ],
                'dependencies'  => $enabled_only,
            ],
            [
                'id'           => 'cj_default_markup',
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'cj_catalog_section',
                'title'        => __( 'Suggested markup', 'dokan-lite' ),
                'description'  => __( 'The markup on CJ\'s cost that the import form suggests. Vendors can change it for each product.', 'dokan-lite' ),
                'postfix'      => '%',
                'default'      => 50,
                'legacy_key'   => [
                    'option' => Settings::OPTION,
                    'field'  => 'default_markup',
                ],
                'dependencies' => $enabled_only,
            ],
        ];

        // CJ prices in US dollars; other stores need a rate (epic §1).
        if ( function_exists( 'get_woocommerce_currency' ) && 'USD' !== get_woocommerce_currency() ) {
            $fields[] = [
                'id'           => 'cj_usd_rate',
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'cj_catalog_section',
                'title'        => sprintf(
                    /* translators: %s: store currency code */
                    __( 'US dollar to %s rate', 'dokan-lite' ),
                    get_woocommerce_currency()
                ),
                'description'  => __( 'CJ charges in US dollars. How much of your store currency one US dollar buys, used for CJ costs and shipping prices.', 'dokan-lite' ),
                'default'      => 1,
                'legacy_key'   => [
                    'option' => Settings::OPTION,
                    'field'  => 'usd_rate',
                ],
                'dependencies' => $enabled_only,
            ];
            $fields[] = [
                'id'           => 'cj_currency_margin',
                'type'         => 'field',
                'variant'      => 'number',
                'section_id'   => 'cj_catalog_section',
                'title'        => __( 'Currency safety margin', 'dokan-lite' ),
                'description'  => __( 'Added on top of converted CJ costs and shipping prices, so rate changes don\'t turn a sale into a loss.', 'dokan-lite' ),
                'postfix'      => '%',
                'default'      => 3,
                'legacy_key'   => [
                    'option' => Settings::OPTION,
                    'field'  => 'currency_margin',
                ],
                'dependencies' => $enabled_only,
            ];
        }

        return array_merge( (array) $elements, $fields );
    }
}
