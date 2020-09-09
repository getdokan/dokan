<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_0_10_ProductAttributesAuthorId;

class V_3_0_10 extends DokanUpgrader {

    /**
     * Update product attribute id to same as product author id
     *
     * @return void
     */
    public static function update_product_attributes_author_id() {
        $processor = new V_3_0_10_ProductAttributesAuthorId();

        $args = [
            'updating' => 'product_attribute_author_id_as_parent_author_id',
            'paged'    => 0,
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
