<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;
use WeDevs\Dokan\AgentAbilities\Schemas;

/**
 * dokan/vendors-query — list/search vendors on the marketplace.
 *
 * Public read so AI agents (Claude, ChatGPT) can discover vendors without
 * auth. Returns a uniform vendor summary list with pagination.
 */
class VendorsQuery {

    const NAME = 'dokan/vendors-query';

    public static function definition(): array {
        return [
            'label'               => __( 'List Vendors', 'dokan-lite' ),
            'description'         => __( 'Search and list vendors on the marketplace. Supports filtering by search term, status, and featured flag. Returns vendor identity, ratings, and product counts.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => array_merge(
                    [
                        'search'   => [ 'type' => 'string', 'description' => __( 'Free-text search across vendor name, shop name, email.', 'dokan-lite' ) ],
                        'featured' => [ 'type' => 'boolean', 'description' => __( 'Limit to featured vendors only.', 'dokan-lite' ) ],
                        'status'   => [ 'type' => 'string', 'enum' => [ 'all', 'approved', 'pending' ], 'default' => 'approved' ],
                        'orderby'  => [ 'type' => 'string', 'enum' => [ 'registered', 'product_count', 'rating' ], 'default' => 'registered' ],
                        'order'    => [ 'type' => 'string', 'enum' => [ 'asc', 'desc' ], 'default' => 'desc' ],
                    ],
                    Schemas::pagination()
                ),
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'vendors' => [ 'type' => 'array', 'items' => Schemas::vendor_summary() ],
                    'total'   => [ 'type' => 'integer' ],
                    'page'    => [ 'type' => 'integer' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'public_read' ],
            'meta'                => [
                'annotations'  => [ 'readonly' => true, 'idempotent' => true ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $args = [
            'per_page' => isset( $input['per_page'] ) ? (int) $input['per_page'] : 20,
            'paged'    => isset( $input['page'] ) ? (int) $input['page'] : 1,
            'orderby'  => $input['orderby'] ?? 'registered',
            'order'    => strtoupper( $input['order'] ?? 'desc' ),
        ];

        if ( ! empty( $input['search'] ) ) {
            $args['search'] = sanitize_text_field( $input['search'] );
        }

        if ( isset( $input['featured'] ) && $input['featured'] ) {
            $args['featured'] = 'yes';
        }

        $status = $input['status'] ?? 'approved';
        if ( 'approved' === $status ) {
            $args['status'] = 'approved';
        } elseif ( 'pending' === $status ) {
            $args['status'] = 'pending';
        }

        if ( ! function_exists( 'dokan_get_sellers' ) ) {
            return new \WP_Error( 'dokan_unavailable', __( 'Dokan is not active.', 'dokan-lite' ) );
        }

        $result   = dokan_get_sellers( $args );
        $vendors  = [];
        $raw_list = $result['users'] ?? $result;

        if ( ! is_array( $raw_list ) ) {
            return [ 'vendors' => [], 'total' => 0, 'page' => (int) $args['paged'] ];
        }

        foreach ( $raw_list as $user ) {
            $user_id = is_object( $user ) ? (int) $user->ID : (int) $user;
            $vendor  = dokan_get_vendor( $user_id );
            if ( ! $vendor ) {
                continue;
            }
            $vendors[] = self::shape( $vendor );
        }

        return [
            'vendors' => $vendors,
            'total'   => isset( $result['count'] ) ? (int) $result['count'] : count( $vendors ),
            'page'    => (int) $args['paged'],
        ];
    }

    public static function shape( $vendor ): array {
        $rating = method_exists( $vendor, 'get_rating' ) ? (array) $vendor->get_rating() : [];

        return [
            'id'            => (int) $vendor->get_id(),
            'name'          => (string) $vendor->get_name(),
            'shop_name'     => (string) $vendor->get_shop_name(),
            'shop_url'      => (string) $vendor->get_shop_url(),
            'email'         => (string) $vendor->get_email(),
            'rating'        => isset( $rating['rating'] ) ? (float) $rating['rating'] : 0,
            'rating_count'  => isset( $rating['count'] ) ? (int) $rating['count'] : 0,
            'product_count' => (int) ( method_exists( $vendor, 'get_total_products' ) ? $vendor->get_total_products() : 0 ),
            'enabled'       => (bool) $vendor->is_enabled(),
        ];
    }
}
