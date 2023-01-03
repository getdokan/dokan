<?php

namespace WeDevs\Dokan\BackgroundProcess;

defined( 'ABSPATH' ) || exit;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * RewriteVariableProductsAuthor Class.
 *
 * @since DOKAN_LITE_SINCE
 */
class RewriteVariableProductsAuthor extends DokanBackgroundProcesses {

    /**
     * Perform updates.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param mixed $item
     *
     * @return bool|array
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'dokan_variable_product_variations_author_ids' === $item['updating'] ) {
            return $this->rewrite_variable_product_variations_author_ids( $item['page'] );
        }

        return false;
    }

    /**
     * Rewrite variable product variations author IDs.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $page
     *
     * @return bool|array
     */
    function rewrite_variable_product_variations_author_ids( $page = 1 ) {
        $args = [
            'type'  => 'variable',
            'limit' => 50,
            'page'  => $page
        ];

        $variable_products = wc_get_products( $args );

        if ( empty( $variable_products ) ) {
            return false;
        }

        foreach( $variable_products as $variable_product ) {
            $product_author = get_post_field( 'post_author', $variable_product->get_id() );

            // Rewrite author of variable product.
            dokan_override_product_author( $variable_product, $product_author );
        }

        return [
            'updating' => 'dokan_variable_product_variations_author_ids',
            'page'     => ++$page,
        ];
    }
}
