<?php

function dokan_update_user_cap_269() {
    $role = get_role( 'seller' );
    $role->add_cap( 'edit_product' );
}

dokan_update_user_cap_269();