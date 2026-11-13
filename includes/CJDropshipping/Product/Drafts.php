<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

/**
 * Takes CJ products off sale as Draft and remembers why, so they can be restored (B9).
 *
 * @since DOKAN_SINCE
 */
class Drafts {

    public const PREV_STATUS_META  = '_dokan_cj_prev_status';
    public const DRAFT_REASON_META = '_dokan_cj_draft_reason';

    /**
     * Move a product to Draft, remembering why and its earlier status.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $product_id Parent product id.
     * @param string $reason     loss, disconnected, category.
     *
     * @return void
     */
    public static function move( int $product_id, string $reason ): void {
        $status = get_post_status( $product_id );

        if ( ! $status ) {
            return;
        }

        update_post_meta( $product_id, self::DRAFT_REASON_META, $reason );

        if ( 'draft' === $status ) {
            return;
        }

        update_post_meta( $product_id, self::PREV_STATUS_META, $status );
        wp_update_post(
            [
                'ID'          => $product_id,
                'post_status' => 'draft',
            ]
        );
    }
}
