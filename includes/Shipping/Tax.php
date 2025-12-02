<?php

namespace WeDevs\Dokan\Shipping;

use WC_Tax;

class Tax extends WC_Tax {

    /**
     * @param $rate \WC_Shipping_Rate
     * @param $args array
     *
     * @return array Array of tax rate arrays, each containing 'rate', 'label', 'shipping', and 'compound' keys. Empty array if no shipping rates found for the tax class.
     */
    public static function get_tax_rates( $rate, $args ) {
        $tax_class = null;
        $customer = null;
        // See if we have an explicitly set shipping tax class.
        $shipping_tax_class = get_option( 'woocommerce_shipping_tax_class' );

        if ( 'inherit' !== $shipping_tax_class ) {
            $tax_class = $shipping_tax_class;
        }

        // If we don't have a shipping tax class yet, work out which one to use.
        if ( is_null( $tax_class ) ) {
            $tax_class = self::get_shipping_tax_class_from_vendor_cart_items( $rate, $args );
        }

        // If we still don't have a tax class, there must be no taxable items.
        if ( is_null( $tax_class ) ) {
            return array();
        }

        $location = self::get_tax_location( $tax_class, $customer );

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
     * Get the shipping tax class from the cart items.
     *
     * Determines the appropriate tax class for shipping based on cart contents.
     * Standard tax class takes priority, followed by the first non-standard class
     * found in the configured tax class hierarchy.
     * @param $rate \WC_Shipping_Rate
     * @param $args array
     *
     * @return string|null The shipping tax class slug, or null if no taxable items are found.
     */
    private static function get_shipping_tax_class_from_vendor_cart_items( $rate, $args ) {
        $standard_tax_class = '';
        $vendor_cart = $args['package']['contents'];

        // Check if cart has items before proceeding.
        if ( ! $vendor_cart ) {
            return $standard_tax_class;
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
     * Get all tax classes for shipping based on the items in the cart.
     *
     * @return array
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
