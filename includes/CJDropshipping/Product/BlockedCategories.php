<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Takes products from CJ categories the admin blocked off sale, when the admin asks for it (B8).
 *
 * @since DOKAN_SINCE
 */
class BlockedCategories implements Hookable {

    public const META          = '_dokan_cj_category';
    public const OVERRIDE_META = '_dokan_cj_category_allowed';
    public const DRAFT_HOOK    = 'dokan_cj_draft_blocked_categories';

    // Only products on sale move to Draft; trashed ones stay in the trash.
    private const ON_SALE = [ 'publish', 'pending', 'private', 'future' ];

    private const BATCH = 50;

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_after_saving_settings', [ $this, 'on_settings_saved' ], 10, 3 );
        add_action( self::DRAFT_HOOK, [ $this, 'draft_batch' ], 10, 2 );
        add_filter( 'wp_insert_post_data', [ $this, 'keep_blocked_in_draft' ], 20, 2 );
        add_action( 'transition_post_status', [ $this, 'on_back_on_sale' ], 10, 3 );
        add_filter( 'dokan_rest_admin_settings_sanitize_field', [ $this, 'sanitize_setting' ], 10, 3 );
    }

    /**
     * Sanitize the blocked-categories setting.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value   Submitted value.
     * @param array  $field   Field.
     * @param string $variant Field variant.
     *
     * @return mixed
     */
    public function sanitize_setting( $value, $field, $variant ) {
        return 'cj_blocked_categories' === $variant ? Settings::sanitize_blocked_categories( $value ) : $value;
    }

    /**
     * Queue Draft moves for categories that now also block products already on sale.
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

        $before = Settings::parse_blocked_categories( ( (array) $old_value )['blocked_categories'] ?? [] );
        $after  = Settings::parse_blocked_categories( ( (array) $value )['blocked_categories'] ?? [] );
        $added  = [];

        foreach ( $after as $id => $row ) {
            if ( $row['existing'] && empty( $before[ $id ]['existing'] ) ) {
                $added[] = (string) $id;
            }
        }

        if ( $added ) {
            // A fresh "move to Draft" decision ends earlier per-product exceptions.
            foreach ( $added as $id ) {
                delete_metadata( 'post', 0, self::OVERRIDE_META, $id, true );
            }

            Queue::enqueue(
                self::DRAFT_HOOK,
                [
                    'categories' => $added,
                    'after'      => 0,
                ]
            );
        }
    }

    /**
     * Move the next batch of products in the given categories to Draft, then queue the rest.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $categories CJ category ids.
     * @param int      $after      Last product id handled.
     *
     * @return void
     */
    public function draft_batch( $categories, $after = 0 ): void {
        global $wpdb;

        $categories = array_values( array_filter( array_map( 'strval', (array) $categories ) ) );

        if ( ! $categories ) {
            return;
        }

        $ids = array_map(
            'intval',
            $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value IN (" . implode( ',', array_fill( 0, count( $categories ), '%s' ) ) . ') AND post_id > %d ORDER BY post_id LIMIT %d', // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    array_merge( [ self::META ], $categories, [ (int) $after, self::BATCH + 1 ] )
                )
            )
        );

        foreach ( array_slice( $ids, 0, self::BATCH ) as $product_id ) {
            self::take_off_sale( $product_id );
        }

        if ( count( $ids ) > self::BATCH ) {
            Queue::enqueue(
                self::DRAFT_HOOK,
                [
                    'categories' => $categories,
                    'after'      => $ids[ self::BATCH - 1 ],
                ]
            );
        }
    }

    /**
     * Remember a product's CJ category, from import and every sync.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $product_id  Parent product id.
     * @param string $category_id CJ category id.
     *
     * @return void
     */
    public static function record( int $product_id, string $category_id ): void {
        if ( '' !== $category_id && get_post_meta( $product_id, self::META, true ) !== $category_id ) {
            update_post_meta( $product_id, self::META, $category_id );
        }
    }

    /**
     * Whether a CJ product must stay off sale because of its CJ category.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Parent product id.
     *
     * @return bool
     */
    public static function is_blocked( int $product_id ): bool {
        $category = (string) get_post_meta( $product_id, self::META, true );

        return Settings::blocks_existing( $category )
            && get_post_meta( $product_id, self::OVERRIDE_META, true ) !== $category
            && get_post_meta( $product_id, LinkRepository::LINKED_META, true );
    }

    /**
     * Move a product to Draft and tell the vendor why.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Parent product id.
     *
     * @return void
     */
    public static function take_off_sale( int $product_id ): void {
        // Draft is kept by the publish guard; trash and copies are left alone.
        if ( ! in_array( get_post_status( $product_id ), self::ON_SALE, true ) || ! self::is_blocked( $product_id ) ) {
            return;
        }

        Drafts::move( $product_id, 'category' );

        $category = Settings::blocked_categories()[ (string) get_post_meta( $product_id, self::META, true ) ]['name'] ?? '';

        Alerts::add(
            (int) get_post_field( 'post_author', $product_id ),
            'category',
            $product_id,
            sprintf(
                /* translators: 1: product name, 2: CJ category name */
                __( 'The marketplace no longer allows CJ products from the "%2$s" category, so "%1$s" was moved to Draft.', 'dokan-lite' ),
                get_the_title( $product_id ),
                $category
            )
        );
    }

    /**
     * Back on sale: drop the category reason and alert; an admin publishing a blocked product makes an exception.
     *
     * @since DOKAN_SINCE
     *
     * @param string   $new_status New status.
     * @param string   $old_status Old status.
     * @param \WP_Post $post       Post.
     *
     * @return void
     */
    public function on_back_on_sale( $new_status, $old_status, $post ): void {
        if ( 'product' !== $post->post_type || 'draft' !== $old_status || ! in_array( $new_status, self::ON_SALE, true ) || ! get_post_meta( $post->ID, LinkRepository::LINKED_META, true ) ) {
            return;
        }

        if ( self::is_blocked( $post->ID ) && current_user_can( 'manage_woocommerce' ) ) {
            update_post_meta( $post->ID, self::OVERRIDE_META, (string) get_post_meta( $post->ID, self::META, true ) );
        }

        if ( 'category' === get_post_meta( $post->ID, Drafts::DRAFT_REASON_META, true ) ) {
            delete_post_meta( $post->ID, Drafts::DRAFT_REASON_META );
            delete_post_meta( $post->ID, Drafts::PREV_STATUS_META );
        }

        Alerts::clear( (int) $post->post_author, 'category', $post->ID );
    }

    /**
     * Vendors can't publish a product from a blocked category again; admins can.
     *
     * @since DOKAN_SINCE
     *
     * @param array $data    Post data about to be saved.
     * @param array $postarr Submitted post data.
     *
     * @return array
     */
    public function keep_blocked_in_draft( $data, $postarr ): array {
        $product_id = (int) ( $postarr['ID'] ?? 0 );

        if (
            ! $product_id
            || 'product' !== ( $data['post_type'] ?? '' )
            || ! in_array( $data['post_status'] ?? '', [ 'publish', 'pending', 'future', 'private' ], true )
            || 'draft' !== get_post_status( $product_id )
            || current_user_can( 'manage_woocommerce' )
            || ! self::is_blocked( $product_id )
        ) {
            return (array) $data;
        }

        $data['post_status'] = 'draft';

        return $data;
    }
}
