<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\ProductCategory\Helper as CategoryHelper;
use WeDevs\Dokan\Contracts\Hookable;
use WC_Product;
use WP_Error;

/**
 * Keeps CJ products honest: locked fields, copies, buyer stock text and images.
 *
 * @since DOKAN_SINCE
 */
class Hooks implements Hookable {

    // Vendor can't change these on a CJ product (epic §2).
    public const LOCKED_FIELDS = [ 'sku', 'manage_stock', 'stock_quantity', 'stock_status', 'backorders', 'virtual', 'downloadable' ];

    public const META_KEYS = [ LinkRepository::LINKED_META, '_dokan_cj_pid', '_dokan_cj_sku', '_dokan_cj_source_url' ];

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
        add_filter( 'dokan_product_editor_prepared_schema', [ $this, 'lock_editor_fields' ], 20, 2 );
        add_filter( 'woocommerce_rest_pre_insert_product_object', [ $this, 'guard_rest_save' ], 20, 3 );
        add_filter( 'woocommerce_rest_pre_insert_product_variation_object', [ $this, 'guard_rest_save' ], 20, 3 );
        add_filter( 'dokan_rest_pre_insert_product_variation_object', [ $this, 'guard_rest_save' ], 20, 3 );
        add_action( 'dokan_product_updated', [ $this, 'reapply_after_classic_save' ], 20 );
        add_action( 'woocommerce_save_product_variation', [ $this, 'reapply_variation' ], 20 );
        add_filter( 'woocommerce_duplicate_product_exclude_meta', [ $this, 'exclude_copy_meta' ] );
        add_filter( 'woocommerce_product_export_skip_meta_keys', [ $this, 'skip_export_meta' ] );
        add_filter( 'woocommerce_get_availability_text', [ $this, 'hide_stock_number' ], 20, 2 );
        add_action( Importer::IMAGES_HOOK, [ $this, 'import_images' ] );
    }

    /**
     * Grey out locked fields in the vendor product editor.
     *
     * @since DOKAN_SINCE
     *
     * @param array $items      Editor schema items.
     * @param int   $product_id Product id.
     *
     * @return array
     */
    public function lock_editor_fields( $items, $product_id = 0 ): array {
        $items = (array) $items;

        if ( ! $product_id || ! $this->is_cj( (int) $product_id ) ) {
            return $items;
        }

        foreach ( $items as &$item ) {
            if ( 'field' === ( $item['type'] ?? '' ) && in_array( $item['id'] ?? '', self::LOCKED_FIELDS, true ) ) {
                $item['disabled']    = true;
                $item['description'] = __( 'Set by CJ Dropshipping.', 'dokan-lite' );
            }
        }

        return $items;
    }

    /**
     * Undo vendor edits to locked fields and refuse prices below CJ's cost (B3).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product|WP_Error|mixed $product  Product about to be saved.
     * @param mixed                     $request  Request.
     * @param bool                      $creating Whether it is new.
     *
     * @return WC_Product|WP_Error|mixed
     */
    public function guard_rest_save( $product, $request = null, $creating = false ) {
        if ( ! $product instanceof WC_Product || current_user_can( 'manage_woocommerce' ) ) {
            return $product;
        }

        $parent_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();

        if ( ! $parent_id || ! $this->is_cj( $parent_id ) ) {
            return $product;
        }

        // Variations of a CJ product come only from CJ.
        if ( $creating ) {
            return $product->get_parent_id()
                ? new WP_Error( 'dokan_cj_locked', __( 'Variations of a CJ product come from CJ and can\'t be added by hand.', 'dokan-lite' ), [ 'status' => 400 ] )
                : $product;
        }

        if ( isset( $request['type'] ) && \WC_Product_Factory::get_product_type( $product->get_id() ) !== $request['type'] ) {
            return new WP_Error( 'dokan_cj_locked', __( 'The product type of a CJ product can\'t be changed.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $stored  = $product->get_data();
        $changes = $product->get_changes();
        $setters = [
            'sku'          => 'set_sku',
            'manage_stock' => 'set_manage_stock',
            'stock_status' => 'set_stock_status',
            'backorders'   => 'set_backorders',
            'virtual'      => 'set_virtual',
            'downloadable' => 'set_downloadable',
        ];

        foreach ( $setters as $prop => $setter ) {
            if ( array_key_exists( $prop, $changes ) ) {
                $product->{$setter}( $stored[ $prop ] );
            }
        }

        // Read stock fresh: an order may have reduced it during this request.
        if ( array_key_exists( 'stock_quantity', $changes ) ) {
            $product->set_stock_quantity( wc_stock_amount( get_post_meta( $product->get_id(), '_stock', true ) ) );
        }

        // The CJ markers aren't the vendor's to change.
        foreach ( self::META_KEYS as $key ) {
            $value = get_post_meta( $product->get_id(), $key, true );

            if ( '' !== $value ) {
                $product->update_meta_data( $key, $value );
            }
        }

        $link  = $this->links->get( $product->get_id() );
        $error = $link ? $this->check_price( $product, $link ) : null;

        return $error ? $error : $product;
    }

    /**
     * Put CJ values back after a save from the classic product form.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product id.
     *
     * @return void
     */
    public function reapply_after_classic_save( $product_id ): void {
        $product_id = (int) $product_id;

        if ( current_user_can( 'manage_woocommerce' ) || ! $this->is_cj( $product_id ) ) {
            return;
        }

        foreach ( $this->links->for_parent( $product_id ) as $link ) {
            $this->reapply( $link );
        }
    }

    /**
     * Put CJ values back after a classic variation save.
     *
     * @since DOKAN_SINCE
     *
     * @param int $variation_id Variation id.
     *
     * @return void
     */
    public function reapply_variation( $variation_id ): void {
        $link = $this->links->get( (int) $variation_id );

        if ( $link && ! current_user_can( 'manage_woocommerce' ) ) {
            $this->reapply( $link );
        }
    }

    /**
     * Restore the locked fields of one linked product and take it off sale if it now loses money.
     *
     * @since DOKAN_SINCE
     *
     * @param array $link Link row.
     *
     * @return void
     */
    protected function reapply( array $link ): void {
        $product = wc_get_product( (int) $link['product_id'] );

        if ( ! $product ) {
            return;
        }

        $sku = (string) $product->get_meta( '_dokan_cj_sku' );

        Stock::$syncing = true;

        try {
            $product->set_virtual( false );
            $product->set_downloadable( false );
            $product->set_backorders( 'no' );

            if ( '' !== $sku && $sku !== $product->get_sku( 'edit' ) ) {
                $product->set_sku( $sku );
            }

            $product->save();
        } catch ( \WC_Data_Exception $e ) {
            dokan_log( '[CJ Dropshipping] Could not restore CJ fields: ' . $e->getMessage(), 'error' );
        } finally {
            Stock::$syncing = false;
        }

        Stock::apply( $product, $link['vid'] );

        if ( ! $this->check_price( $product, $link ) ) {
            return;
        }

        if ( $product->get_parent_id() ) {
            $product->set_status( 'private' );
            $product->save();
        } else {
            Drafts::move( (int) $link['parent_id'], 'loss' );
        }

        Alerts::add(
            (int) $link['vendor_id'],
            'loss',
            (int) $link['parent_id'],
            sprintf(
                /* translators: %s: product name */
                __( 'The price of "%s" leaves you nothing after commission and CJ\'s cost, so it was taken off sale. Raise the price, then publish it again.', 'dokan-lite' ),
                $product->get_name()
            )
        );
    }

    /**
     * A copy made by Duplicate (or SPMV) is a normal product, not a CJ product (B2).
     *
     * @since DOKAN_SINCE
     *
     * @param array $keys Meta keys WooCommerce leaves off the copy.
     *
     * @return array
     */
    public function exclude_copy_meta( $keys ): array {
        return array_merge( (array) $keys, self::META_KEYS );
    }

    /**
     * Keep CJ links out of CSV exports.
     *
     * @since DOKAN_SINCE
     *
     * @param array $keys Meta keys to skip.
     *
     * @return array
     */
    public function skip_export_meta( $keys ): array {
        return array_merge( (array) $keys, self::META_KEYS );
    }

    /**
     * Buyers see in stock or out of stock, never a CJ stock number (decided PM 2026-10-30).
     *
     * @since DOKAN_SINCE
     *
     * @param string     $text    Availability text.
     * @param WC_Product $product Product.
     *
     * @return string
     */
    public function hide_stock_number( $text, $product ): string {
        if ( ! $product instanceof WC_Product || ! $product->is_in_stock() ) {
            return (string) $text;
        }

        $parent_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();

        return $this->links->is_cj_product( $parent_id ) ? __( 'In stock', 'dokan-lite' ) : (string) $text;
    }

    /**
     * Download a CJ product's images in the background.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Parent product id.
     *
     * @return void
     */
    public function import_images( $product_id ): void {
        $product = wc_get_product( (int) $product_id );
        $pid     = $product ? (string) $product->get_meta( '_dokan_cj_pid' ) : '';

        if ( ! $product || '' === $pid ) {
            return;
        }

        try {
            $cached = ( new ProductDetails() )->get( $pid, Points::BACKGROUND, DAY_IN_SECONDS );
        } catch ( ApiException $e ) {
            return;
        }

        $images = array_values( array_unique( array_filter( array_merge( [ $cached['image'] ], $cached['images'] ) ) ) );

        if ( ! $images ) {
            return;
        }

        $vendor_id = (int) get_post_field( 'post_author', $product->get_id() );
        $limit     = (int) apply_filters( 'dokan_cj_import_gallery_limit', -1, $vendor_id );
        $gallery   = array_slice( $images, 1 );

        if ( $limit >= 0 ) {
            $gallery = array_slice( $gallery, 0, $limit );
        }

        $main_id = $this->sideload( $images[0], $product->get_id(), $vendor_id );

        if ( $main_id ) {
            $product->set_image_id( $main_id );
        }

        $product->set_gallery_image_ids( array_filter( array_map( fn( $url ) => $this->sideload( $url, $product->get_id(), $vendor_id ), $gallery ) ) );
        $product->save();

        $variants = array_column( $cached['variants'], 'image', 'vid' );

        foreach ( $this->links->for_parent( $product->get_id() ) as $link ) {
            if ( (int) $link['product_id'] === $product->get_id() || empty( $variants[ $link['vid'] ] ) ) {
                continue;
            }

            $variation = wc_get_product( (int) $link['product_id'] );
            $image_id  = $this->sideload( $variants[ $link['vid'] ], $product->get_id(), $vendor_id );

            if ( $variation && $image_id ) {
                $variation->set_image_id( $image_id );
                $variation->save();
            }
        }
    }

    /**
     * Whether a product is a CJ product, from the links table (meta can be edited).
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Parent product id.
     *
     * @return bool
     */
    protected function is_cj( int $product_id ): bool {
        return null !== $this->links->get( $product_id ) || [] !== $this->links->for_parent( $product_id );
    }

    /**
     * Refuse a price that leaves the vendor nothing after commission and CJ's cost.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product Product or variation.
     * @param array      $link    Link row.
     *
     * @return WP_Error|null
     */
    protected function check_price( WC_Product $product, array $link ): ?WP_Error {
        $variant = ( new VariantRepository() )->get( $link['vid'] );

        // `price` only syncs on save, so judge the regular and sale prices being saved.
        $prices = array_filter( [ $product->get_regular_price( 'edit' ), $product->get_sale_price( 'edit' ) ], static fn( $price ) => '' !== (string) $price );

        if ( ! $variant || ! $prices ) {
            return null;
        }

        $parent_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
        $chosen    = CategoryHelper::get_saved_products_category( $parent_id )['chosen_cat'] ?? [];
        $cost      = Settings::to_store_currency( (float) $variant['cost_usd'] );
        $result    = Importer::earning( (int) $link['vendor_id'], (float) min( $prices ), $cost, (int) reset( $chosen ), $parent_id );

        if ( $result['keeps'] > 0 ) {
            return null;
        }

        return new WP_Error(
            'dokan_cj_price_too_low',
            __( 'This price leaves you nothing after commission and CJ\'s cost. Raise the price.', 'dokan-lite' ),
            [ 'status' => 400 ]
        );
    }

    /**
     * Download an image once and reuse it for every product that needs it.
     *
     * @since DOKAN_SINCE
     *
     * @param string $url        Image URL.
     * @param int    $product_id Product the image is attached to.
     * @param int    $vendor_id  Vendor who owns it.
     *
     * @return int Attachment id, 0 on failure.
     */
    protected function sideload( string $url, int $product_id, int $vendor_id ): int {
        $existing = get_posts(
            [
                'post_type'      => 'attachment',
                'post_status'    => 'inherit',
                'author'         => $vendor_id,
                'posts_per_page' => 1,
                'fields'         => 'ids',
                'meta_key'       => '_dokan_cj_source_url', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                'meta_value'     => esc_url_raw( $url ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
            ]
        );

        if ( $existing ) {
            return (int) $existing[0];
        }

        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $attachment_id = media_sideload_image( $url, $product_id, null, 'id' );

        if ( is_wp_error( $attachment_id ) ) {
            dokan_log( '[CJ Dropshipping] Image download failed: ' . $attachment_id->get_error_message(), 'error' );

            return 0;
        }

        update_post_meta( (int) $attachment_id, '_dokan_cj_source_url', esc_url_raw( $url ) );
        wp_update_post(
            [
                'ID'          => (int) $attachment_id,
                'post_author' => $vendor_id,
            ]
        );

        return (int) $attachment_id;
    }
}
