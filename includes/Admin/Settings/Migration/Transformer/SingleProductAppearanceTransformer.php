<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Bridges the new `single_product_page_appearance` info_preview field to three
 * legacy switches.
 *
 * Slot layout (driven by the schema's multi `legacy_key`):
 *
 *   slot              | legacy address                              | legacy value | semantic
 *   ------------------|---------------------------------------------|--------------|---------
 *   vendor_info       | dokan_general.show_vendor_info              | "on" / ""    | direct
 *   more_products_tab | dokan_general.enabled_more_products_tab     | "on" / ""    | direct
 *   shipping_tab      | dokan_selling.disable_shipping_tab          | "on" / ""    | inverted
 *
 * `shipping_tab` is **inverted**: legacy `disable_shipping_tab = "on"` means
 * the tab is hidden, so the new schema value (which means "show") is the
 * negation. The first two slots are direct ("on" ⇔ true).
 *
 * @since DOKAN_SINCE
 */
final class SingleProductAppearanceTransformer implements TransformerInterface {

    /**
     * {@inheritDoc}
     *
     * @param array<string,mixed>|null $legacy_value
     */
    public function to_new( $legacy_value ) {
        $slots = is_array( $legacy_value ) ? $legacy_value : [];
        return [
            'vendor_info'       => 'on' === ( $slots['vendor_info'] ?? '' ),
            'more_products_tab' => 'on' === ( $slots['more_products_tab'] ?? '' ),
            'shipping_tab'      => 'on' !== ( $slots['shipping_tab'] ?? '' ),
        ];
    }

    /**
     * {@inheritDoc}
     *
     * @return array<string,string>
     */
    public function to_legacy( $new_value ) {
        $new = is_array( $new_value ) ? $new_value : [];
        return [
            'vendor_info'       => ! empty( $new['vendor_info'] ) ? 'on' : 'off',
            'more_products_tab' => ! empty( $new['more_products_tab'] ) ? 'on' : 'off',
            'shipping_tab'      => empty( $new['shipping_tab'] ) ? 'on' : 'off',
        ];
    }
}
