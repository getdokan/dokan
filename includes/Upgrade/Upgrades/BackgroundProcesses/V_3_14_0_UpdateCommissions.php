<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WP_Term;

/**
 * Update category commission data.
 *
 * @since DOKAN_SINCE
 */
class V_3_14_0_UpdateCommissions extends DokanBackgroundProcesses {

    /**
     * Update commission data.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Term $terms
     *
     * @return bool
     */
    public function task( $item ) {
        if ( empty( $item || ! is_array( $item ) ) ) {
            return false;
        }

        if ( isset( $item['task'] ) && 'global-commission' === $item['task'] ) {
            return $this->update_global_settings( $item['data'] );
        }

        if ( isset( $item['task'] ) && 'vendors-commission' === $item['task'] ) {
            return $this->update_vendors_settings( $item['data'] );
        }

        if ( isset( $item['task'] ) && 'products-commission' === $item['task'] ) {
            return $this->update_products_settings( $item['data'] );
        }

        return false;
    }

    /**
     * Update global category commissions.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Term[] $terms
     *
     * @return true
     */
    private function update_global_settings( $terms ) {
        $dokan_selling       = get_option( 'dokan_selling', [] );
        $category_commission = dokan_get_option( 'commission_category_based_values', 'dokan_selling', [] );

        foreach ( $terms as $term ) {
            $commission_type      = get_term_meta( $term->term_id, 'per_category_admin_commission_type', true );
            $admin_additional_fee = get_term_meta( $term->term_id, 'per_category_admin_additional_fee', true );
            $commission           = get_term_meta( $term->term_id, 'per_category_admin_commission', true );

            if ( ! empty( $commission_type ) ) {
                $category_commission_item = [
                    'flat'       => $admin_additional_fee,
                    'percentage' => $commission,
                ];

                if ( Flat::SOURCE === $commission_type ) {
                    $category_commission_item['percentage'] = 0;
                    $category_commission_item['flat'] = $commission;
                } elseif ( Percentage::SOURCE === $commission_type ) {
                    $category_commission_item['percentage'] = $commission;
                    $category_commission_item['flat'] = 0;
                }

                $category_commission['items'][ $term->term_id ] = $category_commission_item;
            }
        }

        $dokan_selling['commission_category_based_values'] = $category_commission;
        update_option( 'dokan_selling', $dokan_selling );

        return true;
    }

    /**
     * Update vendor commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Vendor\Vendor[] $vendors
     *
     * @return bool
     */
    private function update_vendors_settings( $vendors ) {
        foreach ( $vendors as $vendor ) {
            $commission          = $vendor->get_commission_settings();
            $commission_type_old = $commission->get_type();
            $commission->set_type( Fixed::SOURCE );

            $commission_type = $commission->get_type();
            $flat            = $commission->get_flat();
            $percentage      = $commission->get_percentage();

            if ( Flat::SOURCE === $commission_type_old ) {
                $percentage = 0;
                $flat       = $percentage;
            } elseif ( Percentage::SOURCE === $commission_type_old ) {
                $flat = 0;
            }

            $vendor->save_commission_settings(
                [
                    'type'                 => $commission_type,
                    'flat'                 => $flat,
                    'percentage'           => $percentage,
                    'category_commissions' => $commission->get_category_commissions(),
                ]
            );
        }

        return true;
    }

    /**
     * Update product commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @param \WP_Post[] $posts
     *
     * @return bool
     */
    private function update_products_settings( $posts ) {
        foreach ( $posts as $post ) {
            $commission = dokan()->product->get_commission_settings( $post->ID );

            $commission_type_old = $commission->get_type();
            $commission->set_type( Fixed::SOURCE );

            $commission_type = $commission->get_type();
            $flat            = $commission->get_flat();
            $percentage      = $commission->get_percentage();

            if ( Flat::SOURCE === $commission_type_old ) {
                $percentage = 0;
                $flat       = $percentage;
            } elseif ( Percentage::SOURCE === $commission_type_old ) {
                $flat = 0;
            }

            dokan()->product->save_commission_settings(
                $post->ID,
                [
                    'type'       => $commission_type,
                    'percentage' => $percentage,
                    'flat'       => $flat,
                ]
            );
        }

        return true;
    }
}
