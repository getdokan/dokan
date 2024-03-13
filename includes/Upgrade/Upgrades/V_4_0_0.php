<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_4_0_0_UpdateCategoryGlobalCommissions;

class V_4_0_0 extends DokanUpgrader {

    public static function update_global_commission_type() {
        /**
         * TODO: commission-restructure gets all category commission and saves into global category based commisssion.
         * TODO: commission-restructure update all venodr saved commission type to fixed.
         */
        $options         = get_option( 'dokan_selling', [] );
        $commission_type = isset( $options['dokan_commission_type'] ) ? $options['dokan_commission_type'] : FixedCommissionCalculator::SOURCE;

        if ( in_array( $commission_type, array_keys( dokan()->commission->get_legacy_commission_types() ), true ) ) {
            $options['dokan_commission_type'] = 'fixed';
            update_option( 'dokan_selling', $options );
        }
    }

    public static function update_global_category_commission_types() {
        $has_categories = true;
        $page_number    = 1;
        $processor      = new V_4_0_0_UpdateCategoryGlobalCommissions();

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
                $processor->push_to_queue( $terms );
            }

            ++$page_number;
        }

        $processor->dispatch_process();
    }
}
