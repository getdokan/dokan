<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Takes every CJ product off sale when CJ goes away, and lets vendors put them back (B9).
 *
 * @since DOKAN_SINCE
 */
class OffSale implements Hookable {

    public const DRAFT_HOOK = 'dokan_cj_draft_all';

    // Reasons a vendor may undo with the bulk action; a loss needs a new price first.
    public const RESTORABLE = [ 'disconnected', 'disabled', 'category' ];

    private const BATCH = 50;

    protected LinkRepository $links;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param LinkRepository|null $links Links.
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
        add_action( 'dokan_cj_disconnected', [ $this, 'on_disconnect' ] );
        add_action( 'dokan_after_saving_settings', [ $this, 'on_settings_saved' ], 10, 3 );
        add_action( self::DRAFT_HOOK, [ $this, 'draft_batch' ], 10, 2 );
    }

    /**
     * The admin disconnected the CJ account.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function on_disconnect(): void {
        Queue::enqueue(
            self::DRAFT_HOOK,
            [
                'reason' => 'disconnected',
                'after'  => 0,
            ]
        );
    }

    /**
     * The admin switched CJ Dropshipping off.
     *
     * @since DOKAN_SINCE
     *
     * @param string $option    Saved option.
     * @param array  $value     New value.
     * @param array  $old_value Previous value.
     *
     * @return void
     */
    public function on_settings_saved( $option, $value, $old_value = [] ): void {
        if ( Settings::OPTION !== $option ) {
            return;
        }

        $was_on = 'on' === ( ( (array) $old_value )['enabled'] ?? '' );
        $is_on  = 'on' === ( ( (array) $value )['enabled'] ?? '' );

        if ( $was_on && ! $is_on ) {
            Queue::enqueue(
                self::DRAFT_HOOK,
                [
                    'reason' => 'disabled',
                    'after'  => 0,
                ]
            );
        }
    }

    /**
     * Move the next batch of CJ products to Draft, then queue the rest.
     *
     * @since DOKAN_SINCE
     *
     * @param string $reason Why: disconnected or disabled.
     * @param int    $after  Last product id handled.
     *
     * @return void
     */
    public function draft_batch( $reason, $after = 0 ): void {
        $ids = array_values( array_filter( $this->links->parent_ids(), static fn( $id ) => $id > (int) $after ) );
        sort( $ids );
        $batch = array_slice( $ids, 0, self::BATCH );

        foreach ( $batch as $product_id ) {
            Drafts::move( $product_id, (string) $reason );
        }

        if ( count( $ids ) > self::BATCH ) {
            Queue::enqueue(
                self::DRAFT_HOOK,
                [
                    'reason' => (string) $reason,
                    'after'  => (int) end( $batch ),
                ]
            );
        }
    }

    /**
     * A vendor's CJ products the bulk action can put back on sale.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return int[]
     */
    public function restorable( int $vendor_id ): array {
        return array_values(
            array_filter(
                $this->links->parent_ids( $vendor_id ),
                static fn( $id ) => 'draft' === get_post_status( $id ) && in_array( get_post_meta( $id, Drafts::DRAFT_REASON_META, true ), self::RESTORABLE, true )
            )
        );
    }

    /**
     * Put a vendor's products back to the status they had; approved products skip review (B5).
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return int Products restored.
     */
    public function restore( int $vendor_id ): int {
        $count = 0;

        foreach ( $this->restorable( $vendor_id ) as $product_id ) {
            $previous = (string) get_post_meta( $product_id, Drafts::PREV_STATUS_META, true );

            wp_update_post(
                [
                    'ID'          => $product_id,
                    'post_status' => in_array( $previous, [ 'publish', 'pending', 'private' ], true ) ? $previous : dokan_get_new_post_status(),
                ]
            );
            delete_post_meta( $product_id, Drafts::PREV_STATUS_META );
            delete_post_meta( $product_id, Drafts::DRAFT_REASON_META );
            ++$count;
        }

        return $count;
    }
}
