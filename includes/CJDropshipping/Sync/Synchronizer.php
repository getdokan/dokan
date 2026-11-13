<?php

namespace WeDevs\Dokan\CJDropshipping\Sync;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Product\Drafts;
use WeDevs\Dokan\CJDropshipping\Product\Importer;
use WeDevs\Dokan\CJDropshipping\Product\Stock;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\Contracts\Hookable;
use WC_Product;

/**
 * Keeps linked products in step with CJ's cost and stock (epic §2 Sync, F8).
 *
 * @since DOKAN_SINCE
 */
class Synchronizer implements Hookable {

    public const BATCH_HOOK   = 'dokan_cj_sync_batch';
    public const PRODUCT_HOOK = 'dokan_cj_sync_product';

    // product/query + getInventoryByPid.
    public const COST_PER_PRODUCT = 20;

    public const REMOVED_META = '_dokan_cj_removed';

    protected ProductDetails $details;

    protected LinkRepository $links;

    protected VariantRepository $variants;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param ProductDetails|null    $details  CJ product details.
     * @param LinkRepository|null    $links    Links.
     * @param VariantRepository|null $variants Variants.
     */
    public function __construct( ?ProductDetails $details = null, ?LinkRepository $links = null, ?VariantRepository $variants = null ) {
        $this->details  = $details ?? new ProductDetails();
        $this->links    = $links ?? new LinkRepository();
        $this->variants = $variants ?? new VariantRepository();
    }

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'schedule' ], 20 );
        add_action( self::BATCH_HOOK, [ $this, 'run_batch' ] );
        add_action( self::PRODUCT_HOOK, [ $this, 'sync_product' ] );
        add_action( 'transition_post_status', [ $this, 'clear_loss_on_publish' ], 10, 3 );
    }

    /**
     * Once the vendor fixes the price and publishes again, the loss alert is done.
     *
     * @since DOKAN_SINCE
     *
     * @param string   $new_status New status.
     * @param string   $old_status Old status.
     * @param \WP_Post $post       Post.
     *
     * @return void
     */
    public function clear_loss_on_publish( $new_status, $old_status, $post ): void {
        if ( 'publish' !== $new_status || 'publish' === $old_status || ! in_array( $post->post_type, [ 'product', 'product_variation' ], true ) ) {
            return;
        }

        $parent_id = 'product_variation' === $post->post_type ? (int) $post->post_parent : (int) $post->ID;

        if ( ! $this->links->is_cj_product( $parent_id ) || 'loss' !== get_post_meta( $post->ID, Drafts::DRAFT_REASON_META, true ) ) {
            return;
        }

        delete_post_meta( $post->ID, Drafts::DRAFT_REASON_META );
        Alerts::clear( (int) get_post_field( 'post_author', $parent_id ), 'loss', $parent_id );
    }

    /**
     * Keep the batch job scheduled while CJ is connected.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function schedule(): void {
        if ( ! Settings::is_enabled() || ! Status::is_connected() || ! function_exists( 'WC' ) ) {
            return;
        }

        Queue::ensure_recurring( self::BATCH_HOOK, (int) apply_filters( 'dokan_cj_sync_interval', 15 * MINUTE_IN_SECONDS ) );
    }

    /**
     * Check a few products that are due, oldest first, within the background points share.
     *
     * @since DOKAN_SINCE
     *
     * @return int Products checked.
     */
    public function run_batch(): int {
        if ( ! Settings::is_enabled() || ! Status::is_connected() ) {
            return 0;
        }

        $checked = 0;
        $size    = (int) apply_filters( 'dokan_cj_sync_batch_size', 10 );
        $stale   = time() - (int) apply_filters( 'dokan_cj_sync_max_age', DAY_IN_SECONDS );

        foreach ( $this->variants->due_for_sync( $size ) as $row ) {
            // Fresh enough: the rest of the list is fresher still.
            if ( $row['synced_at'] && strtotime( $row['synced_at'] . ' UTC' ) > $stale ) {
                break;
            }

            if ( ! Points::can_spend( self::COST_PER_PRODUCT, Points::BACKGROUND ) ) {
                break;
            }

            if ( ! $this->sync_product( $row['pid'] ) ) {
                break;
            }

            ++$checked;
        }

        return $checked;
    }

    /**
     * Refresh one CJ product and apply it to every linked product.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return bool False when CJ can't be asked right now, so a batch should stop.
     */
    public function sync_product( $pid ): bool {
        $pid = (string) $pid;

        try {
            $details = $this->details->get( $pid, Points::BACKGROUND, 0 );
        } catch ( ApiException $e ) {
            if ( ApiException::NOT_FOUND === $e->get_reason() ) {
                $this->mark_removed( $pid );

                return true;
            }

            // Account-wide problems stop the batch; they say nothing about this product.
            if ( in_array( $e->get_reason(), [ ApiException::POINTS_EXHAUSTED, ApiException::RATE_LIMITED, ApiException::SUSPENDED, ApiException::AUTH_FAILED, ApiException::NOT_CONNECTED ], true ) ) {
                return false;
            }

            $this->record_failure( $pid );

            return true;
        }

        if ( ! $details['on_sale'] ) {
            $this->mark_removed( $pid );

            return true;
        }

        $variants = array_column( $details['variants'], null, 'vid' );

        foreach ( $this->links->for_cj_product( $pid ) as $link ) {
            $product = wc_get_product( (int) $link['product_id'] );

            if ( ! $product ) {
                continue;
            }

            if ( ! isset( $variants[ $link['vid'] ] ) ) {
                $this->details->mark_variant_removed( $link['vid'] );
                $this->take_off_sale( $product, $link, 'removed' );
                continue;
            }

            // Back on sale at CJ: drop the "Removed by CJ" mark.
            if ( get_post_meta( (int) $link['product_id'], self::REMOVED_META, true ) ) {
                delete_post_meta( (int) $link['product_id'], self::REMOVED_META );
                Alerts::clear( (int) $link['vendor_id'], 'removed', (int) $link['parent_id'] );
            }

            Stock::apply( $product, $link['vid'] );
            Alerts::clear( (int) $link['vendor_id'], 'sync_failed', (int) $link['parent_id'] );
            $this->check_loss( $product, $link, (float) $variants[ $link['vid'] ]['cost'] );
        }

        return true;
    }

    /**
     * Move a product to Draft when CJ's new cost means the vendor would sell at a loss.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product Product or variation.
     * @param array      $link    Link row.
     * @param float      $cost    CJ cost in store currency.
     *
     * @return void
     */
    protected function check_loss( WC_Product $product, array $link, float $cost ): void {
        $prices = array_filter( [ $product->get_regular_price( 'edit' ), $product->get_sale_price( 'edit' ) ], static fn( $price ) => '' !== (string) $price );

        if ( ! $prices ) {
            return;
        }

        $parent     = $product->get_parent_id() ? wc_get_product( $product->get_parent_id() ) : $product;
        $categories = $parent ? $parent->get_category_ids() : [];
        $result     = Importer::earning( (int) $link['vendor_id'], (float) min( $prices ), $cost, (int) reset( $categories ) );

        if ( $result['keeps'] > 0 ) {
            return;
        }

        $this->take_off_sale( $product, $link, 'loss' );
    }

    /**
     * Take a product off sale: Draft for a loss, out of stock when CJ stopped selling it.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product Product or variation.
     * @param array      $link    Link row.
     * @param string     $reason  loss or removed.
     *
     * @return void
     */
    protected function take_off_sale( WC_Product $product, array $link, string $reason ): void {
        $parent_id = (int) $link['parent_id'];
        $name      = $product->get_name();

        if ( 'removed' === $reason ) {
            // Already handled on an earlier check: no repeat alert or email.
            if ( get_post_meta( $product->get_id(), self::REMOVED_META, true ) ) {
                return;
            }

            Stock::$syncing = true;

            try {
                $product->set_stock_quantity( 0 );
                $product->set_stock_status( 'outofstock' );
                $product->save();
            } finally {
                Stock::$syncing = false;
            }

            update_post_meta( $product->get_id(), self::REMOVED_META, time() );

            Alerts::add(
                (int) $link['vendor_id'],
                'removed',
                $parent_id,
                sprintf(
                    /* translators: %s: product name */
                    __( 'CJ stopped selling "%s", so it is now out of stock. It is marked "Removed by CJ" in your products.', 'dokan-lite' ),
                    $name
                )
            );

            return;
        }

        // Already off sale for a loss: don't alert again every check.
        if ( 'loss' === get_post_meta( $product->get_id(), Drafts::DRAFT_REASON_META, true ) && in_array( $product->get_status(), [ 'draft', 'private' ], true ) ) {
            return;
        }

        // A losing variation is switched off; a losing simple product goes to Draft (B13).
        if ( $product->get_parent_id() ) {
            update_post_meta( $product->get_id(), Drafts::DRAFT_REASON_META, 'loss' );
            $product->set_status( 'private' );
            $product->save();
        } else {
            Drafts::move( $parent_id, 'loss' );
        }

        Alerts::add(
            (int) $link['vendor_id'],
            'loss',
            $parent_id,
            sprintf(
                /* translators: %s: product name */
                __( 'CJ raised its cost for "%s". At your price you would sell at a loss, so it was taken off sale. Raise the price, then publish it again.', 'dokan-lite' ),
                $name
            )
        );
    }

    /**
     * CJ no longer sells the product: every vendor's copy goes out of stock.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return void
     */
    protected function mark_removed( string $pid ): void {
        $this->details->mark_removed( $pid );

        foreach ( $this->links->for_cj_product( $pid ) as $link ) {
            $product = wc_get_product( (int) $link['product_id'] );

            if ( $product ) {
                $this->take_off_sale( $product, $link, 'removed' );
            }
        }
    }

    /**
     * Count a failed check; tell vendors after two in a row, never take products off sale (B10).
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return void
     */
    protected function record_failure( string $pid ): void {
        $failures = 0;

        foreach ( $this->variants->for_product( $pid ) as $variant ) {
            $failures = (int) $variant['sync_failures'] + 1;
            $this->variants->save(
                $variant['vid'],
                [
                    'sync_failures' => $failures,
                    'synced_at'     => current_time( 'mysql', true ),
                ]
            );
        }

        if ( $failures < 2 ) {
            return;
        }

        foreach ( $this->links->for_cj_product( $pid ) as $link ) {
            Alerts::add(
                (int) $link['vendor_id'],
                'sync_failed',
                (int) $link['parent_id'],
                sprintf(
                    /* translators: %s: product name */
                    __( 'We couldn\'t check "%s" with CJ twice in a row. It stays on sale with the last known cost and stock; we\'ll keep trying.', 'dokan-lite' ),
                    get_the_title( (int) $link['parent_id'] )
                )
            );
        }
    }

    /**
     * Ask for a product to be checked soon, e.g. after a CJ webhook.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return void
     */
    public static function request( string $pid ): void {
        $fresh = time() - (int) apply_filters( 'dokan_cj_webhook_min_age', HOUR_IN_SECONDS );

        foreach ( ( new VariantRepository() )->for_product( $pid ) as $variant ) {
            if ( $variant['synced_at'] && strtotime( $variant['synced_at'] . ' UTC' ) > $fresh ) {
                return;
            }
        }

        // A short delay lets several pushes about one product share one check.
        Queue::schedule( 10 * MINUTE_IN_SECONDS, self::PRODUCT_HOOK, [ 'pid' => $pid ] );
    }
}
