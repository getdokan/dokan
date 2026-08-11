<?php

namespace WeDevs\Dokan\AgentDiscovery;

class DataProvider {

    public function snapshot() {
        return [
            'name'           => $this->marketplace_name(),
            'description'    => $this->marketplace_description(),
            'home_url'       => home_url( '/' ),
            'vendor_count'   => $this->vendor_count(),
            'product_count'  => $this->product_count(),
            'top_categories' => $this->top_categories(),
            'endpoints'      => $this->api_endpoints(),
            'capabilities'   => $this->agent_capabilities(),
            'policies'       => $this->policies(),
            'pages'          => $this->important_pages(),
            'generated_at'   => time(),
        ];
    }

    public function marketplace_name() {
        return get_bloginfo( 'name' );
    }

    public function marketplace_description() {
        $description = get_bloginfo( 'description' );
        return $description ?: __( 'Multi-vendor marketplace powered by Dokan.', 'dokan-lite' );
    }

    public function vendor_count() {
        if ( function_exists( 'dokan_get_seller_count' ) ) {
            $counts = dokan_get_seller_count();
            if ( is_array( $counts ) && isset( $counts['active'] ) ) {
                return (int) $counts['active'];
            }
        }

        $query = new \WP_User_Query(
            [
                'role'   => 'seller',
                'fields' => 'ID',
                'number' => 0,
            ]
        );
        return (int) $query->get_total();
    }

    public function product_count() {
        $counts = wp_count_posts( 'product' );
        return isset( $counts->publish ) ? (int) $counts->publish : 0;
    }

    public function top_categories( $limit = 5 ) {
        $terms = get_terms(
            [
                'taxonomy'   => 'product_cat',
                'orderby'    => 'count',
                'order'      => 'DESC',
                'number'     => $limit,
                'hide_empty' => true,
            ]
        );

        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            return [];
        }

        return array_map(
            function ( $term ) {
                return [
                    'name'  => $term->name,
                    'slug'  => $term->slug,
                    'count' => (int) $term->count,
                ];
            },
            $terms
        );
    }

    public function api_endpoints() {
        $endpoints = [
            'rest_api' => rest_url( 'dokan/v2/' ),
            'wc_rest'  => rest_url( 'wc/v3/' ),
        ];
        return apply_filters( 'dokan_agent_discovery_endpoints', $endpoints );
    }

    public function agent_capabilities() {
        $caps = [
            'read_catalog'     => true,
            'search_products'  => true,
            'filter_by_vendor' => true,
            'create_cart'      => false,
            'checkout'         => false,
        ];
        return apply_filters( 'dokan_agent_discovery_capabilities', $caps );
    }

    public function policies() {
        $selling_settings = get_option( 'dokan_selling', [] );

        $returns = isset( $selling_settings['refund_policy'] )
            ? wp_strip_all_tags( (string) $selling_settings['refund_policy'] )
            : __( 'Return policy varies by vendor. See individual vendor store pages.', 'dokan-lite' );

        $shipping = __( 'Shipping varies by vendor. See individual vendor store pages.', 'dokan-lite' );

        return [
            'returns'  => $returns,
            'shipping' => $shipping,
        ];
    }

    public function important_pages() {
        $pages = [];

        if ( function_exists( 'dokan_get_page_url' ) ) {
            $vendor_listing = dokan_get_page_url( 'store_listing' );
            if ( $vendor_listing ) {
                $pages['vendor_directory'] = $vendor_listing;
            }
        }

        $shop_page_id = function_exists( 'wc_get_page_id' ) ? wc_get_page_id( 'shop' ) : 0;
        if ( $shop_page_id > 0 ) {
            $pages['shop'] = get_permalink( $shop_page_id );
        }

        return $pages;
    }
}
