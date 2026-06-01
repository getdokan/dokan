<?php

namespace WeDevs\Dokan\StructuredData;

class VendorStoreSchema {

    public function __construct() {
        add_action( 'wp_head', [ $this, 'output' ], 30 );
    }

    public function output() {
        $vendor = Helper::current_store_vendor();
        if ( ! $vendor ) {
            return;
        }

        $organization = Helper::vendor_organization_node( $vendor );
        $shop_url     = $vendor->get_shop_url();

        $store = [
            '@type' => 'Store',
            '@id'   => trailingslashit( $shop_url ) . '#store',
            'name'  => $organization['name'],
            'url'   => $shop_url,
        ];

        $logo = Helper::vendor_logo_url( $vendor );
        if ( $logo ) {
            $store['image'] = $logo;
        }

        $description = $this->vendor_description( $vendor );
        if ( $description ) {
            $store['description'] = $description;
        }

        $store['parentOrganization'] = [ '@id' => $organization['@id'] ];

        $graph = [
            '@context' => 'https://schema.org',
            '@graph'   => [ $store, $organization ],
        ];

        $graph = apply_filters( 'dokan_jsonld_vendor_store', $graph, $vendor );

        if ( empty( $graph ) || ( isset( $graph['@graph'] ) && empty( $graph['@graph'] ) ) ) {
            return;
        }

        $json = wp_json_encode( $graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
        if ( false === $json ) {
            return;
        }

        echo "\n" . '<script type="application/ld+json">' . $json . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    private function vendor_description( $vendor ) {
        if ( method_exists( $vendor, 'get_info_part' ) ) {
            $bio = $vendor->get_info_part( 'store_biography' );
            if ( $bio ) {
                return wp_strip_all_tags( $bio );
            }
        }

        $about = get_user_meta( $vendor->get_id(), 'description', true );
        return $about ? wp_strip_all_tags( $about ) : '';
    }
}
