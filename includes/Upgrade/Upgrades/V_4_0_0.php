<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_4_0_0_UpdateCommissions;

class V_4_0_0 extends DokanUpgrader {

    /**
     * Update global commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_global_commission_type() {
        $options         = get_option( 'dokan_selling', [] );
        $commission_type = isset( $options['commission_type'] ) ? $options['commission_type'] : FixedCommissionCalculator::SOURCE;

        if ( in_array( $commission_type, array_keys( dokan()->commission->get_legacy_commission_types() ), true ) ) {
            $options['commission_type'] = FixedCommissionCalculator::SOURCE;
            update_option( 'dokan_selling', $options );
        }
    }

    /**
     * Update global category commisions.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_global_category_commission_types() {
        $has_categories = true;
        $page_number    = 1;
        $processor      = new V_4_0_0_UpdateCommissions();

        while ( $has_categories ) {
            $args = [
                'taxonomy'   => 'product_cat',
                'number'     => 20,
                'orderby'    => 'name',
                'order'      => 'ASC',
                'hide_empty' => false,
                'offset'     => ( $page_number - 1 ) * 20,
            ];

            $terms = get_terms( $args );

            if ( empty( $terms ) ) {
                $has_categories = false;
            } else {
                $args = [
                    'data' => $terms,
                    'task' => 'global-commission',
                ];
                $processor->push_to_queue( $args );
            }

            ++$page_number;
        }

        $processor->dispatch_process();
    }

    /**
     * Update vendor comission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_category_commission_of_vendors() {
        $page_number = 1;
        $has_vendors = true;
        $processor   = new V_4_0_0_UpdateCommissions();

        while ( $has_vendors ) {
            $vendors = dokan()->vendor->all(
                [
                    'paged' => $page_number,
                ]
            );

            if ( empty( $vendors ) ) {
                $has_vendors = false;
            } else {
                $args = [
                    'data' => $vendors,
                    'task' => 'vendors-commission',
                ];
                $processor->push_to_queue( $args );
            }

            ++$page_number;
        }

        $processor->dispatch_process();
    }

    /**
     * Update product commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_category_commission_of_products() {
        $page_number  = 1;
        $has_products = true;
        $processor    = new V_4_0_0_UpdateCommissions();

        while ( $has_products ) {
            $products = dokan()->product->all(
                [
                    'posts_per_page' => 10,
                    'paged'          => $page_number,
                ]
            );

            $products = $products->posts;

            if ( empty( $products ) ) {
                $has_products = false;
            } else {
                $args = [
                    'data' => $products,
                    'task' => 'products-commission',
                ];
                $processor->push_to_queue( $args );
            }

            ++$page_number;
        }

        $processor->dispatch_process();
    }
}
