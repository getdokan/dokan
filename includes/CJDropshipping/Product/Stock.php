<?php

namespace WeDevs\Dokan\CJDropshipping\Product;

use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WC_Product;

/**
 * Turns CJ stock into WooCommerce stock for linked products.
 *
 * @since DOKAN_SINCE
 */
class Stock {

    // Set while CJ writes stock, so the vendor-edit guard lets it through.
    public static bool $syncing = false;

    /**
     * Sellable units of a CJ variant: counted stock in every warehouse, minus the buffer (C6).
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid CJ variant id.
     *
     * @return int
     */
    public static function sellable( string $vid ): int {
        $repository = new VariantRepository();
        $variant    = $repository->get( $vid );

        if ( ! $variant || VariantRepository::STATUS_ACTIVE !== $variant['status'] ) {
            return 0;
        }

        $total = 0;

        foreach ( $repository->get_stock( $vid ) as $row ) {
            $total += ProductDetails::counted( $row );
        }

        return max( 0, $total - Settings::stock_buffer() );
    }

    /**
     * Write CJ stock onto a product or variation.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Product $product Product or variation linked to the variant.
     * @param string     $vid     CJ variant id.
     *
     * @return void
     */
    public static function apply( WC_Product $product, string $vid ): void {
        $units = self::sellable( $vid );

        if ( $product->get_manage_stock() && (int) $product->get_stock_quantity() === $units ) {
            return;
        }

        self::$syncing = true;

        try {
            $product->set_manage_stock( true );
            $product->set_stock_quantity( $units );
            $product->set_stock_status( $units > 0 ? 'instock' : 'outofstock' );
            $product->save();
        } finally {
            self::$syncing = false;
        }
    }
}
