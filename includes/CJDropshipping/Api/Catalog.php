<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

/**
 * CJ product, stock, freight and webhook endpoints.
 *
 * @since DOKAN_SINCE
 */
class Catalog {

    // Vendor searches are cached to save points (F2).
    private const SEARCH_CACHE_TTL = HOUR_IN_SECONDS;

    protected Client $client;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param Client|null $client API client.
     */
    public function __construct( ?Client $client = null ) {
        $this->client = $client ?? new Client();
    }

    /**
     * Search CJ's catalog.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args keyword, category_id, warehouse (country code), page, per_page.
     *
     * @return array{items: array, total: int, pages: int}
     * @throws ApiException When CJ fails.
     */
    public function search( array $args ): array {
        $query = array_filter(
            [
                'keyWord'     => (string) ( $args['keyword'] ?? '' ),
                'categoryId'  => (string) ( $args['category_id'] ?? '' ),
                'countryCode' => strtoupper( (string) ( $args['warehouse'] ?? '' ) ),
                'page'        => max( 1, min( 1000, (int) ( $args['page'] ?? 1 ) ) ),
                'size'        => max( 1, min( 100, (int) ( $args['per_page'] ?? 20 ) ) ),
            ],
            static fn( $value ) => '' !== $value
        );

			$cache_key = 'dokan_cj_search_' . md5( wp_json_encode( $query ) );
			$cached    = get_transient( $cache_key );

			if ( is_array( $cached ) ) {
				return $cached;
			}

			$data  = $this->client->get( 'product/listV2', $query, Points::INTERACTIVE );
			$items = $data['content'][0]['productList'] ?? [];

			$result = [
				'items' => array_map( [ $this, 'format_search_item' ], is_array( $items ) ? $items : [] ),
				'total' => (int) ( $data['totalRecords'] ?? 0 ),
				'pages' => (int) ( $data['totalPages'] ?? 0 ),
			];

			set_transient( $cache_key, $result, self::SEARCH_CACHE_TTL );

			return $result;
    }

    /**
     * Product with its variants and per-warehouse stock.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid      CJ product id.
     * @param string $priority Points priority.
     *
     * @return array
     * @throws ApiException When CJ fails.
     */
    public function product( string $pid, string $priority = Points::INTERACTIVE ): array {
        $data = $this->client->get( 'product/query', [ 'pid' => $pid ], $priority );

        if ( empty( $data['pid'] ) ) {
            throw new ApiException( ApiException::NOT_FOUND, esc_html__( 'CJ product not found.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        return $data;
    }

    /**
     * Stock per variant and warehouse country, CJ shelf and factory kept apart (F6).
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid      CJ product id.
     * @param string $priority Points priority.
     *
     * @return array<string, array<string, array{cj: int, factory: int}>> vid => country => stock.
     * @throws ApiException When CJ fails.
     */
    public function stock( string $pid, string $priority = Points::INTERACTIVE ): array {
        $data  = $this->client->get( 'product/stock/getInventoryByPid', [ 'pid' => $pid ], $priority );
        $stock = [];

        foreach ( (array) ( $data['variantInventories'] ?? [] ) as $variant ) {
            $vid = (string) ( $variant['vid'] ?? '' );

            foreach ( (array) ( $variant['inventory'] ?? [] ) as $row ) {
                $country = strtoupper( (string) ( $row['countryCode'] ?? '' ) );

                if ( $vid && $country ) {
                    $stock[ $vid ][ $country ] = [
                        'cj'      => (int) ( $row['cjInventory'] ?? 0 ),
                        'factory' => (int) ( $row['factoryInventory'] ?? 0 ),
                    ];
                }
            }
        }

        return $stock;
    }

    /**
     * Shipping quotes for several warehouse groups in one call (10 points).
     *
     * @since DOKAN_SINCE
     *
     * @param array[] $requests Each: warehouse, country, zip, items (vid, sku, quantity, weight, volume), props.
     *
     * @return array[] CJ quote rows; each row's origin is in srcAreaCode or srcArea.shortCode.
     * @throws ApiException When CJ fails.
     */
    public function freight( array $requests ): array {
        $dtos = [];

        foreach ( $requests as $request ) {
            $weight = 0;
            $volume = 0.0;
            $skus   = [];
            $trial  = [];

            foreach ( $request['items'] as $item ) {
                $quantity = max( 1, (int) $item['quantity'] );
                $weight  += max( 1, (int) ceil( (float) $item['weight'] ) ) * $quantity;
                $volume  += (float) $item['volume'] * $quantity;
                $skus[]   = (string) $item['sku'];
                $trial[]  = [
                    'sku'         => (string) $item['sku'],
                    'vid'         => (string) $item['vid'],
                    'skuQuantity' => $quantity,
                    'skuWeight'   => max( 1, (int) ceil( (float) $item['weight'] ) ),
                    'skuVolume'   => (float) $item['volume'],
                ];
            }

            $dtos[] = array_filter(
                [
                    'srcAreaCode'         => (string) $request['warehouse'],
                    'destAreaCode'        => (string) $request['country'],
                    'zip'                 => (string) ( $request['zip'] ?? '' ),
                    'weight'              => max( 1, $weight ),
                    'wrapWeight'          => max( 1, $weight ),
                    'volume'              => $volume,
                    'productProp'         => array_values( array_unique( $request['props'] ? $request['props'] : [ 'COMMON' ] ) ),
                    'skuList'             => $skus,
                    'freightTrialSkuList' => $trial,
                ],
                static fn( $value ) => '' !== $value
            );
        }

        $data = $this->client->post( 'logistic/freightCalculateTip', [ 'reqDTOS' => $dtos ], Points::CHECKOUT );

        return is_array( $data ) ? $data : [];
    }

    /**
     * Point CJ's product, stock, order and logistics pushes at our webhook (F4).
     *
     * @since DOKAN_SINCE
     *
     * @param string $url Public HTTPS webhook URL.
     *
     * @return void
     * @throws ApiException When CJ rejects the URL.
     */
    public function register_webhooks( string $url ): void {
        $topic = [
            'type'         => 'ENABLE',
            'callbackUrls' => [ $url ],
        ];

        $this->client->post(
            'webhook/set',
            [
                'product'   => $topic,
                'stock'     => $topic,
                'order'     => $topic,
                'logistics' => $topic,
            ],
            Points::CHECKOUT
        );
    }

    /**
     * Stop CJ's pushes to this site.
     *
     * @since DOKAN_SINCE
     *
     * @param string $url Webhook URL; CJ asks for it even when cancelling.
     *
     * @return void
     * @throws ApiException When CJ fails.
     */
    public function cancel_webhooks( string $url ): void {
        $topic = [
            'type'         => 'CANCEL',
            'callbackUrls' => [ $url ],
        ];

        $this->client->post(
            'webhook/set',
            [
                'product'   => $topic,
                'stock'     => $topic,
                'order'     => $topic,
                'logistics' => $topic,
            ],
            Points::CHECKOUT
        );
    }

    /**
     * Subscribe products to product and stock pushes, 100 per call.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $pids CJ product ids.
     *
     * @return string[] Product ids CJ refused.
     * @throws ApiException When CJ fails.
     */
    public function subscribe( array $pids ): array {
        $failed = [];

        foreach ( array_chunk( array_values( array_unique( $pids ) ), 100 ) as $chunk ) {
            $data   = $this->client->post(
                'webhook/product/subscribe',
                [
                    'productIds'   => $chunk,
                    'subscribeAll' => false,
                ],
                Points::STOCK
            );
            $failed = array_merge( $failed, (array) ( $data['failProductIds'] ?? [] ) );
        }

        return $failed;
    }

    /**
     * Unsubscribe products from pushes.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $pids CJ product ids.
     *
     * @return void
     * @throws ApiException When CJ fails.
     */
    public function unsubscribe( array $pids ): void {
        foreach ( array_chunk( array_values( array_unique( $pids ) ), 100 ) as $chunk ) {
            $this->client->post( 'webhook/product/unsubscribe', [ 'productIds' => $chunk ], Points::BACKGROUND );
        }
    }

    /**
     * Warehouse countries for the "Ships from" filter, from CJ's free warehouse list.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string> Country code => country name.
     */
    public function warehouses(): array {
        $cached = get_transient( 'dokan_cj_warehouses' );

        if ( is_array( $cached ) && $cached ) {
            return $cached;
        }

        $countries = [];

        try {
            foreach ( (array) $this->client->get( 'product/globalWarehouseList', [], Points::INTERACTIVE ) as $row ) {
                $code = strtoupper( (string) ( $row['countryCode'] ?? '' ) );

                if ( 2 === strlen( $code ) && empty( $row['disabled'] ) ) {
                    $countries[ $code ] = WC()->countries->get_countries()[ $code ] ?? $code;
                }
            }
        } catch ( ApiException $e ) {
            $countries = [];
        }

        if ( ! $countries ) {
            foreach ( [ 'CN', 'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'TH', 'ID', 'AU', 'BR' ] as $code ) {
                $countries[ $code ] = WC()->countries->get_countries()[ $code ] ?? $code;
            }
        } else {
            set_transient( 'dokan_cj_warehouses', $countries, DAY_IN_SECONDS );
        }

        return $countries;
    }

    /**
     * Account details, used to check a connection.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     * @throws ApiException When CJ fails.
     */
    public function account(): array {
        $data = $this->client->get( 'setting/get', [], Points::CHECKOUT );

        return is_array( $data ) ? $data : [];
    }

    /**
     * Shape a search row for the vendor screen.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row CJ productList row.
     *
     * @return array
     */
    private function format_search_item( array $row ): array {
        return [
            'pid'            => (string) ( $row['id'] ?? '' ),
            'name'           => (string) ( $row['nameEn'] ?? '' ),
            'sku'            => (string) ( $row['sku'] ?? '' ),
            'image'          => (string) ( $row['bigImage'] ?? '' ),
            'price'          => (string) ( $row['nowPrice'] ?? $row['sellPrice'] ?? '' ),
            'inventory'      => (int) ( $row['warehouseInventoryNum'] ?? 0 ),
            'delivery_cycle' => (string) ( $row['deliveryCycle'] ?? '' ),
        ];
    }
}
