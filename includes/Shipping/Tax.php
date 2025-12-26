<?php

namespace WeDevs\Dokan\Shipping;

use WC_Tax;

class Tax extends WC_Tax {

    /**
     * Get tax rates for shipping
     *
     * @since 4.2.4
     *
     * @param $args
     *
     * @return array
     */
    public static function get_tax_rates( $args ) {
        $tax_class = self::get_shipping_tax_class_from_vendor_cart_items( $args );

        if ( is_null( $tax_class ) ) {
            return array();
        }

        $location = self::get_tax_location( $tax_class );

        // Check for a valid location.
        if ( 4 !== count( $location ) ) {
            return array();
        }

        [ $country, $state, $postcode, $city ] = $location;

        return self::find_shipping_rates(
            array(
                'country'   => $country,
                'state'     => $state,
                'postcode'  => $postcode,
                'city'      => $city,
                'tax_class' => $tax_class,
            )
        );
    }

    /**
     * Get shipping tax class from vendor cart items.
     *
     * @since 4.2.4
     *
     * @param $args
     *
     * @return false|mixed|string|null
     */
    private static function get_shipping_tax_class_from_vendor_cart_items( $args ) {
        $standard_tax_class = '';
        $vendor_cart = ! empty( $args['package']['contents'] ) ? $args['package']['contents'] : [];

        // Check if cart has items before proceeding.
        if ( ! $vendor_cart ) {
            return null;
        }

        $cart_tax_classes = self::get_vendor_cart_item_tax_classes_for_shipping( $vendor_cart );

        // No tax classes = no taxable items.
        if ( empty( $cart_tax_classes ) ) {
            return null;
        }

        // Standard tax class takes priority over any other tax class.
        if ( in_array( $standard_tax_class, $cart_tax_classes, true ) ) {
            return $standard_tax_class;
        }

        // If only one tax class, use it directly.
        if ( 1 === count( $cart_tax_classes ) ) {
            return reset( $cart_tax_classes );
        }

        // For multiple classes, use the first one found using the order defined in settings.
        static $tax_class_slugs = null;
        if ( null === $tax_class_slugs ) {
            $tax_class_slugs = self::get_tax_class_slugs();
        }

        foreach ( $tax_class_slugs as $tax_class_slug ) {
            if ( in_array( $tax_class_slug, $cart_tax_classes, true ) ) {
                return $tax_class_slug;
            }
        }

        // Default to standard tax class if nothing else matches.
        return $standard_tax_class;
    }

    /**
     * Retrieves a list of unique tax classes for shipping from the provided vendor cart items.
     *
     * @static 4.2.4
     *
     * @param array $cart_items An array of cart items.
     *
     * @return array An array of unique tax classes applicable to shipping for the provided cart items.
     */
    public static function get_vendor_cart_item_tax_classes_for_shipping( $cart_items ) {
        $found_tax_classes = array();

        foreach ( $cart_items as $item ) {
            if ( $item['data'] && ( $item['data']->is_shipping_taxable() ) ) {
                $found_tax_classes[] = $item['data']->get_tax_class();
            }
        }

        return array_unique( $found_tax_classes );
    }
}
