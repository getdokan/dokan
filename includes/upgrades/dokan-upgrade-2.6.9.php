<?php

function dokan_update_user_cap_269() {
    $role = get_role( 'seller' );
    $role->add_cap( 'edit_product' );
}

function dokan_replace_seller_commission() {
    $seller_percentage           = dokan_get_seller_percentage();
    $options                     = get_option( 'dokan_selling' );
    $options['admin_percentage'] = 100 - (float) $seller_percentage;
    update_option( 'dokan_selling', $options );
}

function dokan_replace_seller_commission_by_seller() {
    $args = array(
        'role'       => 'seller',
        'meta_query' => array(
            array(
                'key'     => 'dokan_seller_percentage',
                'value'   => '',
                'compare' => '!='
            )
        )
    );

    $user_query = new WP_User_Query( $args );
    $sellers    = $user_query->get_results();
    foreach ( $sellers as $s ) {
        $seller_percentage = get_user_meta( $s->ID, 'dokan_seller_percentage', true );
        $admin_percentage  = 100 - $seller_percentage;
        update_user_meta( $s->ID , 'dokan_admin_percentage', $admin_percentage );
    }
}

function dokan_replace_product_commissions(){
    $args  = array(
        'post_type' => 'product',
        'meta_query' => array(
            array(
                'key'     => '_per_product_commission',
                'value'   => '',
                'compare' => '!='
            )
        )
    );
   
    $query    = new WP_Query( $args );
    $products = $query->get_posts();

    foreach ( $products as $p ) {
        $seller_commission = get_post_meta( $p->ID, '_per_product_commission' );
        $admin_commission = 100 - $seller_commission;
        update_post_meta( $p->ID, '_per_product_admin_commission', $admin_commission );
    }
}

dokan_update_user_cap_269();
dokan_replace_seller_commission();
dokan_replace_seller_commission_by_seller();
dokan_replace_product_commissions();