<?php

namespace WeDevs\Dokan\StructuredData;

class ProductSchema {

    public function __construct() {
        add_filter( 'woocommerce_structured_data_product', [ $this, 'inject_vendor' ], 20, 2 );
    }

    public function inject_vendor( $markup, $product ) {
        if ( ! is_array( $markup ) || ! $product instanceof \WC_Product ) {
            return $markup;
        }

        $vendor = Helper::vendor_for_product( $product );
        if ( ! $vendor ) {
            return $markup;
        }

        $organization = Helper::vendor_organization_node( $vendor );

        if ( empty( $markup['brand'] ) ) {
            $markup['brand'] = [
                '@type' => 'Brand',
                'name'  => $organization['name'],
            ];
        }

        if ( ! empty( $markup['offers'] ) ) {
            if ( $this->is_offer_node( $markup['offers'] ) ) {
                $markup['offers']['seller'] = $organization;
            } elseif ( is_array( $markup['offers'] ) ) {
                foreach ( $markup['offers'] as $key => $offer ) {
                    if ( $this->is_offer_node( $offer ) ) {
                        $offer['seller']          = $organization;
                        $markup['offers'][ $key ] = $offer;
                    }
                }
            }
        }

        return apply_filters( 'dokan_jsonld_product', $markup, $product, $vendor );
    }

    private function is_offer_node( $node ) {
        return is_array( $node ) && isset( $node['@type'] ) && 'Offer' === $node['@type'];
    }
}
