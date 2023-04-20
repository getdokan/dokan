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
        $product_types = array_filter(
            wc_get_product_types(), function ( $type ) {
                return 'product_pack' !== $type;
            }
        );

        $args = [
            'status' => 'change_status' === $this->get_task_type() ? 'publish' : 'pending',
            'type'   => array_merge( array_keys( $product_types ) ),
            'author' => $this->get_vendor_id(),
            'page'   => $this->get_current_page(),
            'limit'  => $this->get_per_page(),
            'return' => 'ids',
        ];

        return wc_get_products( $args );
    }
}
