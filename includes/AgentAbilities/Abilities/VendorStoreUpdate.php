<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan-vendor/store-update — vendor updates own storefront fields.
 *
 * Whitelisted field set only. Vendor staff are blocked from store-level
 * updates because those affect the parent vendor's public identity.
 */
class VendorStoreUpdate {

    const NAME = 'dokan-vendor/store-update';

    public static function definition(): array {
        return [
            'label'               => __( 'Update Store (Vendor)', 'dokan-lite' ),
            'description'         => __( 'Update your storefront information: shop name, phone, address, social links, store hours, and return policy. Only parent vendors can update store-level fields; staff accounts are blocked.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'shop_name'   => [ 'type' => 'string' ],
                    'phone'       => [ 'type' => 'string' ],
                    'address'     => [
                        'type'       => 'object',
                        'properties' => [
                            'street_1' => [ 'type' => 'string' ],
                            'street_2' => [ 'type' => 'string' ],
                            'city'     => [ 'type' => 'string' ],
                            'zip'      => [ 'type' => 'string' ],
                            'state'    => [ 'type' => 'string' ],
                            'country'  => [ 'type' => 'string' ],
                        ],
                    ],
                    'social'      => [
                        'type'       => 'object',
                        'properties' => [
                            'facebook'  => [ 'type' => 'string' ],
                            'twitter'   => [ 'type' => 'string' ],
                            'instagram' => [ 'type' => 'string' ],
                            'youtube'   => [ 'type' => 'string' ],
                        ],
                    ],
                    'return_policy' => [ 'type' => 'string' ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id'      => [ 'type' => 'integer' ],
                    'fields_updated' => [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
                    'message'        => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'vendor_only_no_staff' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => false ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = (int) get_current_user_id();

        if ( function_exists( 'dokan_is_user_seller' ) && ! dokan_is_user_seller( $vendor_id, true ) ) {
            return new \WP_Error( 'rest_forbidden', __( 'Only parent vendors can update store-level information.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $profile = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
        if ( ! is_array( $profile ) ) {
            $profile = [];
        }

        $updated = [];

        if ( isset( $input['shop_name'] ) ) {
            $profile['store_name'] = sanitize_text_field( $input['shop_name'] );
            $updated[] = 'shop_name';
        }
        if ( isset( $input['phone'] ) ) {
            $profile['phone'] = sanitize_text_field( $input['phone'] );
            $updated[] = 'phone';
        }
        if ( isset( $input['address'] ) && is_array( $input['address'] ) ) {
            $address = isset( $profile['address'] ) && is_array( $profile['address'] ) ? $profile['address'] : [];
            foreach ( [ 'street_1', 'street_2', 'city', 'zip', 'state', 'country' ] as $key ) {
                if ( isset( $input['address'][ $key ] ) ) {
                    $address[ $key ] = sanitize_text_field( $input['address'][ $key ] );
                }
            }
            $profile['address'] = $address;
            $updated[]          = 'address';
        }
        if ( isset( $input['social'] ) && is_array( $input['social'] ) ) {
            $social = isset( $profile['social'] ) && is_array( $profile['social'] ) ? $profile['social'] : [];
            foreach ( [ 'facebook', 'twitter', 'instagram', 'youtube' ] as $key ) {
                if ( isset( $input['social'][ $key ] ) ) {
                    $social[ $key ] = esc_url_raw( $input['social'][ $key ] );
                }
            }
            $profile['social'] = $social;
            $updated[]         = 'social';
        }
        if ( isset( $input['return_policy'] ) ) {
            $profile['return_policy'] = wp_kses_post( $input['return_policy'] );
            $updated[] = 'return_policy';
        }

        if ( empty( $updated ) ) {
            return new \WP_Error( 'nothing_to_update', __( 'No update fields provided.', 'dokan-lite' ) );
        }

        update_user_meta( $vendor_id, 'dokan_profile_settings', $profile );

        do_action( 'dokan_store_profile_saved', $vendor_id, $profile );

        return [
            'vendor_id'      => $vendor_id,
            'fields_updated' => $updated,
            'message'        => sprintf( __( 'Storefront updated. Changed %d field(s).', 'dokan-lite' ), count( $updated ) ),
        ];
    }
}
