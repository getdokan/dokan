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

dokan_update_user_cap_269();
dokan_replace_seller_commission();