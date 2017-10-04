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

dokan_update_user_cap_269();
dokan_replace_seller_commission();
dokan_replace_seller_commission_by_seller();