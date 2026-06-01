<?php

namespace WeDevs\Dokan\StructuredData;

class Helper {

    public static function vendor_for_product( $product ) {
        if ( is_numeric( $product ) ) {
            $product = wc_get_product( $product );
        }
        if ( ! $product instanceof \WC_Product ) {
            return null;
        }

        $author_id = (int) get_post_field( 'post_author', $product->get_id() );
        if ( ! $author_id || ! function_exists( 'dokan_get_vendor' ) ) {
            return null;
        }

        $vendor = dokan_get_vendor( $author_id );
        if ( ! $vendor || ! $vendor->get_id() ) {
            return null;
        }

        return $vendor;
    }

    public static function vendor_organization_node( $vendor ) {
        $shop_url = $vendor->get_shop_url();
        $name     = $vendor->get_shop_name();

        $node = [
            '@type' => 'Organization',
            '@id'   => trailingslashit( $shop_url ) . '#organization',
            'name'  => $name ?: get_the_author_meta( 'display_name', $vendor->get_id() ),
            'url'   => $shop_url,
        ];

        $logo = self::vendor_logo_url( $vendor );
        if ( $logo ) {
            $node['logo'] = $logo;
        }

        return $node;
    }

    public static function vendor_logo_url( $vendor ) {
        $gravatar_id = method_exists( $vendor, 'get_avatar_id' ) ? (int) $vendor->get_avatar_id() : 0;
        if ( $gravatar_id ) {
            $url = wp_get_attachment_image_url( $gravatar_id, 'full' );
            if ( $url ) {
                return $url;
            }
        }

        if ( method_exists( $vendor, 'get_avatar' ) ) {
            $avatar = $vendor->get_avatar();
            if ( $avatar && filter_var( $avatar, FILTER_VALIDATE_URL ) ) {
                return $avatar;
            }
        }

        return '';
    }

    public static function current_store_vendor() {
        if ( ! function_exists( 'dokan_is_store_page' ) || ! dokan_is_store_page() ) {
            return null;
        }
        if ( ! function_exists( 'dokan_get_vendor' ) ) {
            return null;
        }

        $store_user = get_query_var( 'author_name' );
        if ( ! $store_user ) {
            return null;
        }

        $user = get_user_by( 'slug', $store_user );
        if ( ! $user ) {
            return null;
        }

        return dokan_get_vendor( $user->ID );
    }
}
