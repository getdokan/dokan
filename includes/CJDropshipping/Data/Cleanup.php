<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Removes CJ data that belongs to deleted products and vendors (E7).
 *
 * @since DOKAN_SINCE
 */
class Cleanup implements Hookable {

    protected LinkRepository $links;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param LinkRepository|null $links Link repository.
     */
    public function __construct( ?LinkRepository $links = null ) {
        $this->links = $links ?? new LinkRepository();
    }

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'delete_user', [ $this, 'delete_vendor_data' ] );
        add_action( 'before_delete_post', [ $this, 'delete_product_links' ] );
    }

    /**
     * Delete a vendor's CJ links and onboarding meta.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User id.
     *
     * @return void
     */
    public function delete_vendor_data( $user_id ): void {
        $this->links->unlink_vendor( (int) $user_id );
    }

    /**
     * Delete a product's links when it is deleted for good.
     *
     * @since DOKAN_SINCE
     *
     * @param int $post_id Post id.
     *
     * @return void
     */
    public function delete_product_links( $post_id ): void {
        if ( ! in_array( get_post_type( $post_id ), [ 'product', 'product_variation' ], true ) ) {
            return;
        }

        $this->links->unlink( (int) $post_id );
    }
}
