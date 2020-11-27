<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WP_Query;
use WP_Term_Query;
use WP_User_Query;
use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_6_9 extends DokanUpgrader {

    public static function update_user_capability() {
        $role = get_role( 'seller' );
        $role->add_cap( 'edit_product' );
    }

    public static function replace_seller_commission() {
        $seller_percentage           = dokan_get_seller_percentage();
        $options                     = get_option( 'dokan_selling' );
        $options['admin_percentage'] = 100 - (float) $seller_percentage;
        update_option( 'dokan_selling', $options );
    }

    public static function replace_seller_commission_by_seller() {
        $args = [
            'role'       => 'seller',
            'meta_query' => [
                [
                    'key'     => 'dokan_seller_percentage',
                    'value'   => '',
                    'compare' => '!=',
                ],
            ],
        ];

        $user_query = new WP_User_Query( $args );
        $sellers    = $user_query->get_results();
        foreach ( $sellers as $s ) {
            $seller_percentage = get_user_meta( $s->ID, 'dokan_seller_percentage', true );
            $admin_percentage  = 100 - (int) $seller_percentage;
            update_user_meta( $s->ID, 'dokan_admin_percentage', $admin_percentage );
        }
    }

    public static function replace_product_commissions() {
        $args = [
            'post_type'  => 'product',
            'meta_query' => [
                [
                    'key'     => '_per_product_commission',
                    'value'   => '',
                    'compare' => '!=',
                ],
            ],
        ];

        $query    = new WP_Query( $args );
        $products = $query->get_posts();

        foreach ( $products as $p ) {
            $seller_commission = get_post_meta( $p->ID, '_per_product_commission' );
            $admin_commission  = 100 - (float) $seller_commission;
            update_post_meta( $p->ID, '_per_product_admin_commission', $admin_commission );
        }
    }

    public static function replace_category_commission_meta() {
        $args = [
            'taxonomy'   => 'product_cat',
            'hide_empty' => true,
            'meta_key'   => 'per_category_commission',
        ];

        $the_query = new WP_Term_Query( $args );
        $terms = $the_query->get_terms();

        foreach ( $terms as $t ) {
            $admin_commission = 100 - (int) get_term_meta( $t->term_id, 'per_category_commission', true );
            update_term_meta( $t->term_id, 'per_category_admin_commission', $admin_commission );
        }
    }

}
