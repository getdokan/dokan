<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan Product attribute author id updater class
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_0_10_ProductAttributesAuthorId extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @param mixed $item
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'product_attribute_author_id_as_parent_author_id' === $item['updating'] ) {
            return $this->update_product_attribute_author( $item['paged'] );
        }

        return false;
    }

    /**
     * Update product attribute author
     * if its not same as product author id
     *
     * @param $paged
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|boolean
     */
    private function update_product_attribute_author( $paged ) {
        $limit = 100;
        $count = $limit * $paged;

        $query_args = [
            'post_type' => 'product_variation',
            'status'    => 'any',
            'number'    => $limit,
            'offset'    => $count,
            'fields'    => 'id=>parent',
        ];

        $product_variation_parent_ids = get_posts( $query_args );

        if ( ! $product_variation_parent_ids ) {
            return false;
        }

        foreach ( $product_variation_parent_ids as $key => $parent_id ) {
            $product        = wc_get_product( $parent_id );
            $product_author = get_post_field( 'post_author', $product->get_id() );

            //get product all variations
            foreach ( $product->get_children() as $child_id ) {
                $variation_author_id = get_post_field( 'post_author', $child_id );

                /**
                 * We will change the variation post author id if its not
                 * Same as product author id
                 */
                if ( $product_author !== $variation_author_id ) {
                    dokan_override_author_for_variations( $product, $product_author );
                }
            }
        }

        return [
            'updating' => 'product_attribute_author_id_as_parent_author_id',
            'paged'    => ++$paged,
        ];
    }
}
