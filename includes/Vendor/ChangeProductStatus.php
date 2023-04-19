<?php

namespace WeDevs\Dokan\Vendor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // exit if accessed directly
}

use WeDevs\Dokan\Abstracts\ProductStatusChanger;

/**
 * Change product status
 *
 * @since DOKAN_SINCE
 */
class ChangeProductStatus extends ProductStatusChanger {

    /**
     * Get products
     *
     * @since DOKAN_SINCE
     *
     * @return int[]
     */
    public function get_products() {
        $args = [
            'status' => 'change_status' === $this->get_task_type() ? 'publish' : 'pending',
            'author' => $this->get_vendor_id(),
            'page'   => $this->get_current_page(),
            'limit'  => $this->get_per_page(),
            'return' => 'ids',
        ];

        return wc_get_products( $args );
    }
}
