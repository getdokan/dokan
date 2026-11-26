<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Removes CJ data that belongs to deleted products and vendors (E7).
 *
 * @since DOKAN_SINCE
 */
class Cleanup implements Hookable {

    public const UNUSED_HOOK = 'dokan_cj_delete_unused_variants';

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
        add_action( 'init', [ $this, 'schedule' ], 20 );
        add_action( self::UNUSED_HOOK, [ $this, 'delete_unused_variants' ] );
    }

    /**
     * Keep the daily clean-up scheduled while CJ is on.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function schedule(): void {
        if ( Settings::is_enabled() && function_exists( 'WC' ) ) {
            Queue::ensure_recurring( self::UNUSED_HOOK, DAY_IN_SECONDS );
        }
    }

    /**
     * Delete CJ variants no product uses: left by deleted products, or saved while browsing the catalog.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function delete_unused_variants(): void {
        ( new VariantRepository() )->delete_unused( DAY_IN_SECONDS );
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
