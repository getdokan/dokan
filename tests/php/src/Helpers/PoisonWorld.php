<?php

namespace WeDevs\Dokan\Test\Helpers;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WC_Product_Download;
use WeDevs\Dokan\Test\Factories\DokanFactory;

/**
 * Seeds the data shapes that have produced shipped fatals.
 *
 * Every fatal in getdokan/plugin-internal-tasks#2452 needed one nasty fixture to
 * surface: a refund in an order listing, an order whose product was deleted, a
 * product without a price, a stale AI model id, a vendor with no store, a download
 * permission on a live product. None of those exist in a factory-fresh test world,
 * so a route or page that fatals on them passes every ordinary test.
 *
 * The world is seeded once and every smoke walker (REST, dashboard, background
 * handlers) runs on top of it. Add a fixture here whenever the fatal audit finds a
 * shape the walkers could not reach; Pro extends it with module fixtures.
 *
 * @since DOKAN_SINCE
 */
class PoisonWorld {

    /**
     * An id that no row in any table will ever have.
     *
     * Every integer route parameter is also walked with this value, because
     * `wc_get_order( $missing )` and `wc_get_product( $missing )` return `false`
     * and a controller that forgets to check fatals on the next line.
     */
    public const MISSING_ID = 987654321;

    /**
     * Seeded ids, keyed by fixture name.
     *
     * @var array<string,mixed>
     */
    protected array $ids = [];

    /**
     * Fixtures that could not be seeded, keyed by name with the reason.
     *
     * @var array<string,string>
     */
    protected array $skipped = [];

    protected DokanFactory $factory;

    /**
     * @param DokanFactory $factory     Test factory.
     * @param int          $admin_id    Administrator user id.
     * @param int          $customer_id Customer user id.
     * @param int          $seller_id   Vendor with a store; owns the poison products and orders.
     * @param int          $seller2_id  Second vendor with a store; is disabled for selling by the seed.
     */
    public function __construct( DokanFactory $factory, int $admin_id, int $customer_id, int $seller_id, int $seller2_id ) {
        $this->factory = $factory;

        $this->ids['admin']    = $admin_id;
        $this->ids['customer'] = $customer_id;
        $this->ids['vendor']   = $seller_id;
        $this->ids['vendor2']  = $seller2_id;
    }

    /**
     * Seed every fixture. Safe to call once per test.
     *
     * @return self
     */
    public function seed(): self {
        $this->seed_vendors();
        $this->seed_products();
        $this->seed_orders();
        $this->seed_downloads();
        $this->seed_withdraw();
        $this->seed_reviews_and_coupons();
        $this->seed_stale_options();

        return $this;
    }

    /**
     * @param string $name Fixture name.
     *
     * @return mixed|null Null when the fixture is unknown or was skipped.
     */
    public function id( string $name ) {
        return $this->ids[ $name ] ?? null;
    }

    /**
     * @return array<string,mixed>
     */
    public function all(): array {
        return $this->ids;
    }

    /**
     * @return array<string,string>
     */
    public function skipped(): array {
        return $this->skipped;
    }

    /**
     * Ids to try for a REST resource segment such as `orders` or `products`.
     *
     * @param string $kind Route segment or parameter-name prefix, e.g. `orders`.
     *
     * @return int[]
     */
    public function ids_for_resource( string $kind ): array {
        $kind = strtolower( $kind );

        switch ( $kind ) {
            case 'order':
            case 'orders':
            case 'suborder':
            case 'suborders':
                return $this->collect( [ 'order_with_refund', 'order_with_deleted_product', 'order_with_downloads', 'parent_order', 'suborder' ] );

            case 'product':
            case 'products':
            case 'item':
            case 'items':
                return $this->collect( [ 'product', 'priceless_product', 'variable_product', 'downloadable_product', 'deleted_product' ] );

            case 'variation':
            case 'variations':
                return $this->collect( [ 'variation' ] );

            case 'store':
            case 'stores':
            case 'vendor':
            case 'vendors':
            case 'seller':
            case 'sellers':
                return $this->collect( [ 'vendor', 'vendor_without_store', 'vendor2', 'customer' ] );

            case 'customer':
            case 'customers':
            case 'user':
            case 'users':
                return $this->collect( [ 'customer', 'vendor' ] );

            case 'withdraw':
            case 'withdraws':
            case 'withdrawal':
            case 'withdrawals':
                return $this->collect( [ 'withdraw' ] );

            case 'refund':
            case 'refunds':
                return $this->collect( [ 'refund' ] );

            case 'coupon':
            case 'coupons':
                return $this->collect( [ 'coupon' ] );

            case 'review':
            case 'reviews':
            case 'comment':
            case 'comments':
                return $this->collect( [ 'review' ] );

            case 'download':
            case 'downloads':
            case 'permission':
            case 'permissions':
                return $this->collect( [ 'download_permission' ] );
        }

        return [];
    }

    /**
     * @param string[] $names Fixture names.
     *
     * @return int[]
     */
    protected function collect( array $names ): array {
        $out = [];

        foreach ( $names as $name ) {
            if ( isset( $this->ids[ $name ] ) && is_int( $this->ids[ $name ] ) && $this->ids[ $name ] > 0 ) {
                $out[] = $this->ids[ $name ];
            }
        }

        return array_values( array_unique( $out ) );
    }

    /**
     * A seller role with no `dokan_profile_settings`, and a vendor whose selling is disabled.
     */
    protected function seed_vendors(): void {
        $this->ids['vendor_without_store'] = $this->factory->user->create( [ 'role' => 'seller' ] );

        update_user_meta( $this->ids['vendor2'], 'dokan_enable_selling', 'no' );
        update_user_meta( $this->ids['vendor2'], 'dokan_publishing', 'no' );
    }

    /**
     * A plain product, one without any price, a variable one, and one that no longer exists.
     */
    protected function seed_products(): void {
        $product_factory = $this->factory->product;

        $this->ids['product'] = $product_factory->set_seller_id( $this->ids['vendor'] )->create( [ 'name' => 'Poison plain product' ] );

        $this->ids['priceless_product'] = $product_factory->set_seller_id( $this->ids['vendor'] )->create(
            [
                'name'          => 'Poison priceless product',
                'regular_price' => '',
                'price'         => '',
            ]
        );

        $variable = WC_Helper_Product::create_variation_product();
        wp_update_post(
            [
                'ID'          => $variable->get_id(),
                'post_author' => $this->ids['vendor'],
            ]
        );
        $this->ids['variable_product'] = $variable->get_id();
        $children                      = $variable->get_children();
        $this->ids['variation']        = $children ? (int) reset( $children ) : 0;

        $deleted = $product_factory->set_seller_id( $this->ids['vendor'] )->create( [ 'name' => 'Poison product that will be deleted' ] );
        $this->ids['deleted_product'] = $deleted;
    }

    /**
     * Orders carrying a refund, a deleted product, and a parent with suborders.
     */
    protected function seed_orders(): void {
        $order_factory = $this->factory->order;

        // Order that will carry a refund.
        $this->ids['order_with_refund'] = $order_factory->create(
            [
                'customer_id' => $this->ids['customer'],
                'status'      => 'completed',
                'line_items'  => [
                    [
                        'product_id' => $this->ids['product'],
                        'quantity'   => 2,
                    ],
                ],
            ]
        );
        $this->ids['refund'] = $this->factory->refund->create( [ 'order_id' => $this->ids['order_with_refund'] ] );
        if ( ! $this->ids['refund'] ) {
            $this->skipped['refund'] = 'wc_create_refund() refused';
        }

        // Order whose product is deleted after purchase.
        $this->ids['order_with_deleted_product'] = $order_factory->create(
            [
                'customer_id' => $this->ids['customer'],
                'status'      => 'processing',
                'line_items'  => [
                    [
                        'product_id' => $this->ids['deleted_product'],
                        'quantity'   => 1,
                    ],
                ],
            ]
        );

        // Multi-vendor parent order with suborders.
        $vendor2_product = $this->factory->product->set_seller_id( $this->ids['vendor2'] )->create( [ 'name' => 'Poison vendor 2 product' ] );

        $this->ids['parent_order'] = $order_factory->create(
            [
                'customer_id' => $this->ids['customer'],
                'status'      => 'processing',
                'line_items'  => [
                    [
                        'product_id' => $this->ids['product'],
                        'quantity'   => 1,
                    ],
                    [
                        'product_id' => $vendor2_product,
                        'quantity'   => 1,
                    ],
                ],
            ]
        );

        $suborders             = dokan_get_suborder_ids_by( $this->ids['parent_order'] );
        $this->ids['suborder'] = $suborders ? (int) reset( $suborders ) : 0;
        if ( ! $this->ids['suborder'] ) {
            $this->skipped['suborder'] = 'parent order was not split';
        }

        // Now the product disappears from under the order.
        wp_delete_post( $this->ids['deleted_product'], true );
    }

    /**
     * An order with a download permission on a live downloadable product, plus a
     * permission whose product has since been deleted.
     */
    protected function seed_downloads(): void {
        $approved      = wc_get_container()->get( DownloadApprovedDirectories::class );
        $previous_mode = $approved->get_mode();
        $approved->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        try {
            $live_download = new WC_Product_Download();
            $live_download->set_name( 'Poison live file' );
            $live_download->set_id( wp_generate_uuid4() );
            $live_download->set_file( 'https://example.com/poison-live.pdf' );

            $live = WC_Helper_Product::create_downloadable_product( [ $live_download ] );
            wp_update_post(
                [
                    'ID'          => $live->get_id(),
                    'post_author' => $this->ids['vendor'],
                ]
            );
            $this->ids['downloadable_product'] = $live->get_id();

            $gone_download = new WC_Product_Download();
            $gone_download->set_name( 'Poison gone file' );
            $gone_download->set_id( wp_generate_uuid4() );
            $gone_download->set_file( 'https://example.com/poison-gone.pdf' );

            $gone = WC_Helper_Product::create_downloadable_product( [ $gone_download ] );
            wp_update_post(
                [
                    'ID'          => $gone->get_id(),
                    'post_author' => $this->ids['vendor'],
                ]
            );

            $this->ids['order_with_downloads'] = $this->factory->order->create(
                [
                    'customer_id' => $this->ids['customer'],
                    'status'      => 'completed',
                    'line_items'  => [
                        [
                            'product_id' => $live->get_id(),
                            'quantity'   => 1,
                        ],
                        [
                            'product_id' => $gone->get_id(),
                            'quantity'   => 1,
                        ],
                    ],
                ]
            );

            $order = wc_get_order( $this->ids['order_with_downloads'] );

            $permission_id = wc_downloadable_file_permission( $live_download->get_id(), $live->get_id(), $order );
            wc_downloadable_file_permission( $gone_download->get_id(), $gone->get_id(), $order );

            $this->ids['download_permission'] = is_int( $permission_id ) ? $permission_id : 0;

            wp_delete_post( $gone->get_id(), true );
        } finally {
            $approved->set_mode( $previous_mode );
        }
    }

    /**
     * A pending withdraw request for the vendor.
     */
    protected function seed_withdraw(): void {
        $withdraw = dokan()->withdraw->create(
            [
                'user_id' => $this->ids['vendor'],
                'amount'  => 5,
                'method'  => 'paypal',
                'note'    => 'poison-world withdraw',
                'ip'      => '127.0.0.1',
            ]
        );

        if ( is_wp_error( $withdraw ) ) {
            $this->ids['withdraw']     = 0;
            $this->skipped['withdraw'] = $withdraw->get_error_message();

            return;
        }

        $this->ids['withdraw'] = (int) $withdraw->get_id();
    }

    /**
     * A product review and a coupon owned by the vendor.
     */
    protected function seed_reviews_and_coupons(): void {
        $this->ids['review'] = (int) WC_Helper_Product::create_product_review( $this->ids['product'], 'poison-world review' );

        $coupon_id = $this->factory->coupon->create( [ 'code' => 'poison-coupon' ] );
        if ( $coupon_id ) {
            wp_update_post(
                [
                    'ID'          => $coupon_id,
                    'post_author' => $this->ids['vendor'],
                ]
            );
        }
        $this->ids['coupon'] = (int) $coupon_id;
    }

    /**
     * Options holding ids that no longer resolve to anything.
     *
     * The AI engine `chatgpt` and the model `gemini-2.0-flash` were real values in
     * earlier releases; `/ai/generate` fataled on both (dokan#3328).
     */
    protected function seed_stale_options(): void {
        update_option(
            'dokan_ai',
            [
                'dokan_ai_engine'       => 'chatgpt',
                'dokan_ai_gemini_model' => 'gemini-2.0-flash',
                'dokan_ai_openai_model' => 'gpt-3.5-turbo-0301',
            ]
        );
    }
}
