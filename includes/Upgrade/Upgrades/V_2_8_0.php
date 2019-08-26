<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_8_0 extends DokanUpgrader {

    /**
    * Remove product_style option from database
    */
    public static function remove_product_style_option() {
        delete_option( 'product_style' );
    }
}
