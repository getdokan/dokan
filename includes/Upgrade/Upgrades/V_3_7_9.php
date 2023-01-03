<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

defined( 'ABSPATH' ) || exit;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * Upgrader Class.
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_7_9 extends DokanUpgrader {

    /**
     * Rewrite variable product variations author IDs.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public static function rewrite_variable_product_variations_author_ids() {
        $processor = dokan()->background_process->manager()->rewrite_variable_products_author();

        $args = [
            'updating' => 'dokan_variable_product_variations_author_ids',
            'page'     => 1
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
