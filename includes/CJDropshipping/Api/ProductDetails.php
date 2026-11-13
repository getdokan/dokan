<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;

/**
 * Loads a CJ product with variants and stock, and keeps the variant tables current.
 *
 * @since DOKAN_SINCE
 */
class ProductDetails {

    protected Catalog $catalog;

    protected VariantRepository $variants;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param Catalog|null           $catalog  CJ catalog API.
     * @param VariantRepository|null $variants Variant repository.
     */
    public function __construct( ?Catalog $catalog = null, ?VariantRepository $variants = null ) {
        $this->catalog  = $catalog ?? new Catalog();
        $this->variants = $variants ?? new VariantRepository();
    }

    /**
     * Product, variants with cost and stock per warehouse.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid      CJ product id.
     * @param string $priority Points priority.
     * @param int    $max_age  Reuse a fetch this many seconds old; 0 always fetches.
     *
     * @return array
     * @throws ApiException When CJ fails.
     */
    public function get( string $pid, string $priority = Points::INTERACTIVE, int $max_age = 10 * MINUTE_IN_SECONDS ): array {
        $cache_key = 'dokan_cj_product_' . md5( $pid );
        $cached    = $max_age ? get_transient( $cache_key ) : false;

        if ( is_array( $cached ) && time() - (int) $cached['fetched_at'] <= $max_age ) {
            return $cached;
        }

        $product = $this->catalog->product( $pid, $priority );
        $stock   = $this->catalog->stock( $pid, $priority );
        $details = $this->normalize( $product, $stock );

        $this->persist( $details );
        set_transient( $cache_key, $details, HOUR_IN_SECONDS );

        return $details;
    }

    /**
     * Mark a product's variants as no longer sold by CJ.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return void
     */
    public function mark_removed( string $pid ): void {
        foreach ( $this->variants->for_product( $pid ) as $variant ) {
            $this->mark_variant_removed( $variant['vid'] );
        }

        delete_transient( 'dokan_cj_product_' . md5( $pid ) );
    }

    /**
     * Mark one variant as gone: no stock, and checked now so it leaves the head of the sync queue.
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid CJ variant id.
     *
     * @return void
     */
    public function mark_variant_removed( string $vid ): void {
        $this->variants->save(
            $vid,
            [
                'status'    => VariantRepository::STATUS_REMOVED,
                'synced_at' => current_time( 'mysql', true ),
            ]
        );
        $this->variants->save_stock( $vid, [] );
    }

    /**
     * Units that count as stock for a variant in one warehouse (F6).
     *
     * @since DOKAN_SINCE
     *
     * @param array $row Stock row: cj, factory.
     *
     * @return int
     */
    public static function counted( array $row ): int {
        return (int) $row['cj'] + ( Settings::counts_warehouse_only() ? 0 : (int) $row['factory'] );
    }

    /**
     * Shape CJ's product and stock into what Dokan needs.
     *
     * @since DOKAN_SINCE
     *
     * @param array $product CJ product/query data.
     * @param array $stock   Catalog::stock() result.
     *
     * @return array
     */
    protected function normalize( array $product, array $stock ): array {
        $props    = array_values( array_filter( (array) ( $product['productProEnSet'] ?? [] ) ) );
        $variants = [];

        foreach ( (array) ( $product['variants'] ?? [] ) as $variant ) {
            $vid = (string) ( $variant['vid'] ?? '' );

            if ( '' === $vid ) {
                continue;
            }

            $warehouses = $stock[ $vid ] ?? [];
            $counted    = [];

            foreach ( $warehouses as $country => $row ) {
                $counted[ $country ] = self::counted( $row );
            }

            $variants[] = [
                'vid'        => $vid,
                'sku'        => (string) ( $variant['variantSku'] ?? '' ),
                'name'       => (string) ( $variant['variantNameEn'] ?? '' ),
                'key'        => (string) ( $variant['variantKey'] ?? '' ),
                'image'      => (string) ( $variant['variantImage'] ?? '' ),
                'cost_usd'   => (float) ( $variant['variantSellPrice'] ?? 0 ),
                'cost'       => round( Settings::to_store_currency( (float) ( $variant['variantSellPrice'] ?? 0 ) ), wc_get_price_decimals() ),
                'weight_g'   => (int) ceil( (float) ( $variant['variantWeight'] ?? $product['productWeight'] ?? 0 ) ),
                'volume_cm3' => round( (float) ( $variant['variantVolume'] ?? 0 ) / 1000, 4 ),
                'stock'      => $counted,
                'raw_stock'  => $warehouses,
            ];
        }

        return [
            'pid'         => (string) $product['pid'],
            'name'        => (string) ( $product['productNameEn'] ?? '' ),
            'sku'         => (string) ( $product['productSku'] ?? '' ),
            'image'       => (string) ( $product['bigImage'] ?? '' ),
            'images'      => array_values( array_filter( (array) ( $product['productImageSet'] ?? [] ) ) ),
            'description' => (string) ( $product['description'] ?? '' ),
            'option_name' => (string) ( $product['productKeyEn'] ?? '' ),
            'props'       => $props ? $props : [ 'COMMON' ],
            'on_sale'     => '3' === (string) ( $product['status'] ?? '3' ),
            'variants'    => $variants,
            'fetched_at'  => time(),
        ];
    }

    /**
     * Save variants and stock so import, sync and checkout share them.
     *
     * @since DOKAN_SINCE
     *
     * @param array $details Normalized product.
     *
     * @return void
     */
    protected function persist( array $details ): void {
        foreach ( $details['variants'] as $variant ) {
            $this->variants->save(
                $variant['vid'],
                [
                    'pid'           => $details['pid'],
                    'sku'           => $variant['sku'],
                    'name'          => $variant['name'],
                    'cost_usd'      => $variant['cost_usd'],
                    'weight_g'      => $variant['weight_g'],
                    'volume_cm3'    => $variant['volume_cm3'],
                    'props'         => $details['props'],
                    'status'        => $details['on_sale'] ? VariantRepository::STATUS_ACTIVE : VariantRepository::STATUS_REMOVED,
                    'sync_failures' => 0,
                    'synced_at'     => current_time( 'mysql', true ),
                ]
            );
            $this->variants->save_stock( $variant['vid'], $variant['raw_stock'] );
        }
    }
}
