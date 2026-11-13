<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Commission\Calculator;
use WeDevs\Dokan\ProductCategory\Helper;
use WeDevs\Dokan\Commission\Strategies\Product as ProductStrategy;
use WC_Product;
use WC_Product_Attribute;
use WC_Product_Simple;
use WC_Product_Variable;
use WC_Product_Variation;
use WP_Error;

/**
 * Creates a vendor's WooCommerce product from a CJ product.
 *
 * @since DOKAN_SINCE
 */
class Importer {

    public const IMAGES_HOOK = 'dokan_cj_import_images';

    protected ProductDetails $details;

    protected LinkRepository $links;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param ProductDetails|null $details CJ product details.
     * @param LinkRepository|null $links   Link repository.
     */
    public function __construct( ?ProductDetails $details = null, ?LinkRepository $links = null ) {
        $this->details = $details ?? new ProductDetails();
        $this->links   = $links ?? new LinkRepository();
    }

    /**
     * Whether whole products with all variants can be imported (Pro).
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function supports_variable(): bool {
        return (bool) apply_filters( 'dokan_cj_supports_variable_import', false );
    }

    /**
     * Price, commission and what the vendor keeps for one sale (epic §2 import card).
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id   Vendor id.
     * @param float $price       Selling price.
     * @param float $cost        CJ cost in store currency.
     * @param int   $category_id Category, for category commission.
     * @param int   $product_id  Saved product, for a per-product commission; 0 before import.
     *
     * @return array{price: float, commission: float, earning: float, keeps: float}
     */
    public static function earning( int $vendor_id, float $price, float $cost, int $category_id = 0, int $product_id = 0 ): array {
        // ProductCommission::calculate() needs a saved product, so run the same strategy directly.
        $strategy = apply_filters( 'dokan_product_commission_strategies', new ProductStrategy( $product_id, $vendor_id, $category_id ) );
        $earning  = (float) dokan_get_container()->get( Calculator::class )
            ->set_settings( $strategy->get_settings() )
            ->set_total( $price )
            ->set_quantity( 1 )
            ->calculate()
            ->get_vendor_earning();
        $decimals   = wc_get_price_decimals();

        return [
            'price'      => round( $price, $decimals ),
            'commission' => round( $price - $earning, $decimals ),
            'earning'    => round( $earning, $decimals ),
            'keeps'      => round( $earning - $cost, $decimals ),
        ];
    }

    /**
     * Import a CJ product for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor id.
     * @param array $args      pid, vids (string[]), prices (vid => price), category_ids (int[]).
     *
     * @return int|WP_Error New product id.
     */
    public function import( int $vendor_id, array $args ) {
        $pid          = (string) ( $args['pid'] ?? '' );
        $vids         = array_values( array_unique( array_map( 'strval', (array) ( $args['vids'] ?? [] ) ) ) );
        $prices       = (array) ( $args['prices'] ?? [] );
        $category_ids = array_values( array_filter( array_map( 'absint', (array) ( $args['category_ids'] ?? [] ) ) ) );

        if ( ! $vids ) {
            return new WP_Error( 'dokan_cj_no_variant', __( 'Pick a variant to import.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( count( $vids ) > 1 && ! self::supports_variable() ) {
            return new WP_Error( 'dokan_cj_variable_needs_pro', __( 'Importing several variants as one product needs Dokan Pro. Pick one variant.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( ! $category_ids ) {
            return new WP_Error( 'dokan_cj_no_category', __( 'Pick a category for the product.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        foreach ( $vids as $vid ) {
            if ( $this->links->find_vendor_product( $vendor_id, $vid ) ) {
                return new WP_Error( 'dokan_cj_already_imported', __( 'You already sell this CJ product.', 'dokan-lite' ), [ 'status' => 409 ] );
            }
        }

        try {
            $details = $this->details->get( $pid );
        } catch ( ApiException $e ) {
            return \WeDevs\Dokan\CJDropshipping\REST\AdminController::to_error( $e );
        }

        if ( ! $details['on_sale'] ) {
            return new WP_Error( 'dokan_cj_not_on_sale', __( 'CJ no longer sells this product.', 'dokan-lite' ), [ 'status' => 409 ] );
        }

        $variants = array_column( $details['variants'], null, 'vid' );
        $chosen   = [];

        foreach ( $vids as $vid ) {
            if ( ! isset( $variants[ $vid ] ) ) {
                return new WP_Error( 'dokan_cj_unknown_variant', __( 'That variant is no longer on CJ.', 'dokan-lite' ), [ 'status' => 409 ] );
            }

            $price  = isset( $prices[ $vid ] ) ? (float) $prices[ $vid ] : 0.0;
            $result = self::earning( $vendor_id, $price, (float) $variants[ $vid ]['cost'], $category_ids[0] );

            // Refuse prices that leave the vendor nothing after commission and CJ's cost (B3).
            if ( $price <= 0 || $result['keeps'] <= 0 ) {
                return new WP_Error(
                    'dokan_cj_price_too_low',
                    sprintf(
                        /* translators: %s: variant name */
                        __( 'The price for %s leaves you nothing after commission and CJ\'s cost. Raise the price.', 'dokan-lite' ),
                        $variants[ $vid ]['key'] ? $variants[ $vid ]['key'] : $details['name']
                    ),
                    [ 'status' => 400 ]
                );
            }

            $chosen[ $vid ] = array_merge( $variants[ $vid ], [ 'price' => $price ] );
        }

        // Same checks as Dokan's own add-product path: subscription product count and categories.
        $error = apply_filters(
            'dokan_new_product_popup_args',
            '',
            [
                'post_title'            => $details['name'],
                'product_cat'           => $category_ids,
                'chosen_product_cat'    => $category_ids,
                'product_image_gallery' => '',
            ]
        );

        if ( is_wp_error( $error ) ) {
            // Pro's limit errors carry no HTTP status.
            if ( empty( $error->get_error_data()['status'] ) ) {
                $error->add_data( [ 'status' => 403 ] );
            }

            return $error;
        }

        $product_id = 1 === count( $chosen )
            ? $this->create_simple( $vendor_id, $details, reset( $chosen ), $category_ids )
            : $this->create_variable( $vendor_id, $details, $chosen, $category_ids );

        if ( is_wp_error( $product_id ) ) {
            return $product_id;
        }

        // Dokan's chosen-category meta drives category commission and the editor (B12).
        Helper::set_object_terms_from_chosen_categories( $product_id, $category_ids );

        Queue::enqueue( self::IMAGES_HOOK, [ 'product_id' => $product_id ] );

        do_action( 'dokan_cj_product_imported', $product_id, $vendor_id, $details['pid'] );
        do_action( 'dokan_new_product_added', $product_id, [] );

        return $product_id;
    }

    /**
     * Create a simple product from one CJ variant.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id    Vendor id.
     * @param array $details      CJ product.
     * @param array $variant      Chosen variant with price.
     * @param int[] $category_ids Categories.
     *
     * @return int|WP_Error
     */
    protected function create_simple( int $vendor_id, array $details, array $variant, array $category_ids ) {
        $product = new WC_Product_Simple();
        $name    = count( $details['variants'] ) > 1 && $variant['key']
            ? sprintf( '%1$s - %2$s', $details['name'], $variant['key'] )
            : $details['name'];

        $this->fill_common( $product, $details, $name, $category_ids );

        try {
            $this->fill_variant( $product, $vendor_id, $variant );
        } catch ( \WC_Data_Exception $e ) {
            return new WP_Error( 'dokan_cj_save_failed', $e->getMessage(), [ 'status' => 500 ] );
        }

        $product_id = $this->save_as_vendor( $product, $vendor_id );

        if ( is_wp_error( $product_id ) ) {
            return $product_id;
        }

        if ( ! $this->links->link( $product_id, $product_id, $vendor_id, $variant['vid'], $details['pid'] ) ) {
            return $this->roll_back( $product_id, new WP_Error( 'dokan_cj_already_imported', __( 'You already sell this CJ product.', 'dokan-lite' ), [ 'status' => 409 ] ) );
        }

        Stock::apply( wc_get_product( $product_id ), $variant['vid'] );

        return $product_id;
    }

    /**
     * Create a variable product with one variation per chosen CJ variant (Pro).
     *
     * @since DOKAN_SINCE
     *
     * @param int     $vendor_id    Vendor id.
     * @param array   $details      CJ product.
     * @param array[] $variants     Chosen variants with prices.
     * @param int[]   $category_ids Categories.
     *
     * @return int|WP_Error
     */
    protected function create_variable( int $vendor_id, array $details, array $variants, array $category_ids ) {
        $product = new WC_Product_Variable();
        $label   = $details['option_name'] ? $details['option_name'] : __( 'Option', 'dokan-lite' );
        $values  = [];

        foreach ( $variants as $variant ) {
            $values[] = $variant['key'] ? $variant['key'] : $variant['sku'];
        }

        $attribute = new WC_Product_Attribute();
        $attribute->set_name( $label );
        $attribute->set_options( array_values( array_unique( $values ) ) );
        $attribute->set_visible( true );
        $attribute->set_variation( true );

        $this->fill_common( $product, $details, $details['name'], $category_ids );
        $product->set_attributes( [ $attribute ] );

        $parent_id = $this->save_as_vendor( $product, $vendor_id );

        if ( is_wp_error( $parent_id ) ) {
            return $parent_id;
        }

        foreach ( $variants as $variant ) {
            $variation = new WC_Product_Variation();
            $variation->set_parent_id( $parent_id );
            $variation->set_attributes( [ sanitize_title( $label ) => $variant['key'] ? $variant['key'] : $variant['sku'] ] );

            try {
                $this->fill_variant( $variation, $vendor_id, $variant );
            } catch ( \WC_Data_Exception $e ) {
                return $this->roll_back( $parent_id, new WP_Error( 'dokan_cj_save_failed', $e->getMessage(), [ 'status' => 500 ] ) );
            }

            $variation_id = $this->save_as_vendor( $variation, $vendor_id );

            if ( is_wp_error( $variation_id ) ) {
                return $this->roll_back( $parent_id, $variation_id );
            }

            if ( ! $this->links->link( $variation_id, $parent_id, $vendor_id, $variant['vid'], $details['pid'] ) ) {
                return $this->roll_back( $parent_id, new WP_Error( 'dokan_cj_already_imported', __( 'You already sell this CJ product.', 'dokan-lite' ), [ 'status' => 409 ] ) );
            }

            Stock::apply( wc_get_product( $variation_id ), $variant['vid'] );
        }

        WC_Product_Variable::sync( $parent_id );

        return $parent_id;
    }

    /**
     * Fields shared by simple and variable products.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product      Product.
     * @param array      $details      CJ product.
     * @param string     $name         Product name.
     * @param int[]      $category_ids Categories.
     *
     * @return void
     */
    protected function fill_common( WC_Product $product, array $details, string $name, array $category_ids ): void {
        $product->set_name( $name );
        $product->set_description( wp_kses_post( $details['description'] ) );
        $product->set_category_ids( $category_ids );
        $product->set_status( dokan_get_new_post_status() );
        $product->set_virtual( false );
        $product->set_downloadable( false );
        $product->set_catalog_visibility( 'visible' );
        $product->update_meta_data( '_dokan_cj_pid', $details['pid'] );
    }

    /**
     * Price, SKU, weight and stock fields of one CJ variant.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product   Product or variation.
     * @param int        $vendor_id Vendor id.
     * @param array      $variant   Variant with price.
     *
     * @return void
     */
    protected function fill_variant( WC_Product $product, int $vendor_id, array $variant ): void {
        $sku = $this->unique_sku( $vendor_id, $variant['sku'] ? $variant['sku'] : $variant['vid'] );

        $product->set_regular_price( wc_format_decimal( $variant['price'] ) );
        $product->set_sku( $sku );
        // The SKU the classic form puts back if a vendor changes it.
        $product->update_meta_data( '_dokan_cj_sku', $sku );
        $product->set_manage_stock( true );
        $product->set_stock_quantity( 0 );
        $product->set_backorders( 'no' );

        if ( $variant['weight_g'] > 0 ) {
            $product->set_weight( wc_format_decimal( wc_get_weight( $variant['weight_g'], get_option( 'woocommerce_weight_unit', 'kg' ), 'g' ) ) );
        }
    }

    /**
     * Save a new product as the vendor's.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product   Product.
     * @param int        $vendor_id Vendor id.
     *
     * @return int|WP_Error
     */
    protected function save_as_vendor( WC_Product $product, int $vendor_id ) {
        $set_author = static function ( $data ) use ( $vendor_id ) {
            $data['post_author'] = $vendor_id;

            return $data;
        };

        add_filter( 'woocommerce_new_product_data', $set_author );
        add_filter( 'woocommerce_new_product_variation_data', $set_author );

        try {
            $product_id = $product->save();
        } catch ( \Exception $e ) {
            return new WP_Error( 'dokan_cj_save_failed', $e->getMessage(), [ 'status' => 500 ] );
        } finally {
            remove_filter( 'woocommerce_new_product_data', $set_author );
            remove_filter( 'woocommerce_new_product_variation_data', $set_author );
        }

        return $product_id ? (int) $product_id : new WP_Error( 'dokan_cj_save_failed', __( 'The product could not be saved.', 'dokan-lite' ), [ 'status' => 500 ] );
    }

    /**
     * Per-vendor SKU so several vendors can sell the same CJ product (B1).
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id Vendor id.
     * @param string $cj_sku    CJ variant SKU.
     *
     * @return string
     */
    public function unique_sku( int $vendor_id, string $cj_sku ): string {
        $vendor = get_userdata( $vendor_id );
        $prefix = strtoupper( substr( preg_replace( '/[^A-Za-z0-9]/', '', $vendor ? $vendor->user_nicename : '' ), 0, 6 ) );
        $prefix = '' !== $prefix ? $prefix : 'V' . $vendor_id;
        $sku    = $prefix . '-' . $cj_sku;

        for ( $i = 2; ! wc_product_has_unique_sku( 0, $sku ); $i++ ) {
            $sku = $prefix . '-' . $cj_sku . '-' . $i;
        }

        return $sku;
    }

    /**
     * Delete a half-made product and its links, and pass the error on.
     *
     * @since DOKAN_SINCE
     *
     * @param int      $product_id Product id.
     * @param WP_Error $error      Why.
     *
     * @return WP_Error
     */
    protected function roll_back( int $product_id, WP_Error $error ): WP_Error {
        $product = wc_get_product( $product_id );

        if ( $product ) {
            foreach ( $product->get_children() as $child_id ) {
                $this->links->unlink( (int) $child_id );
                wp_delete_post( (int) $child_id, true );
            }

            $this->links->unlink( $product_id );
            $product->delete( true );
        }

        return $error;
    }
}
