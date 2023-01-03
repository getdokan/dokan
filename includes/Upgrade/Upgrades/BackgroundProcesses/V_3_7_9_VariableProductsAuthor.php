<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan variable product variations author updater class.
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_7_9_VariableProductsAuthor extends DokanBackgroundProcesses {

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

        if ( 'variable_product_variations_author_ids' === $item['updating'] ) {
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
            'updating' => 'variable_product_variations_author_ids',
            'page'     => ++$page,
        ];
    }
}
