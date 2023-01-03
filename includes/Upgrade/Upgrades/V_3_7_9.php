<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_7_9_VariableProductsAuthor;

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
        $processor = new V_3_7_9_VariableProductsAuthor();

        $args = [
            'updating' => 'variable_product_variations_author_ids',
            'page'     => 1
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
