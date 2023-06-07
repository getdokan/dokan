<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Cache;

class V_3_6_5 extends DokanUpgrader {

    /**
     * Delete product category cache
     *
     * @since 3.6.5
     *
     * @return void
     */
    public static function clear_multistep_category_cache() {
        if ( function_exists( 'wpml_get_active_languages' ) ) {
            foreach ( wpml_get_active_languages() as $active_language ) {
                $transient_key = 'multistep_categories_' . $active_language['code'];
                Cache::delete_transient( $transient_key );
            }
        }

        Cache::delete_transient( 'multistep_categories' );
    }
}
