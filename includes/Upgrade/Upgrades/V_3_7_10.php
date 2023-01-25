<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

defined( 'ABSPATH' ) || exit;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * Upgrader Class.
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_7_10 extends DokanUpgrader {

    /**
     * Rewrite variable product variations author IDs.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public static function rewrite_variable_product_variations_author_ids() {
        $bg_processor = dokan()->bg_process->rewrite_variable_products_author;

        $args = [
            'updating' => 'dokan_update_variable_product_variations_author_ids',
            'page'     => 1,
        ];

        $bg_processor->push_to_queue( $args )->save()->dispatch();
    }
}
