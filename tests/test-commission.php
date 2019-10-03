<?php

/**
 * Dokan Commission Test Class
 *
 * @since 2.9.21
 */
class Dokan_Commission_Test extends WP_UnitTestCase {
    /**
     * Vendor id holder
     *
     * @var integer
     */
    protected $vendor_id = 0;

    /**
     * Product id holder
     *
     * @var integer
     */
    protected $product_id = 0;

    /**
     * Category id holder
     *
     * @var integer
     */
    protected $category_id = 0;

    /**
     * Set expected vendor earning
     *
     * @var float
     */
    protected $vendor_earning = 65;

    /**
     * Set expected admin earning
     *
     * @var float
     */
    protected $admin_earning  = 35;

    /**
     * Set global wise commission type
     *
     * @var string
     */
    protected $global_commission_type = 'combine';

    /**
     * Set global commission rate
     *
     * @var string
     */
    protected $global_commission_rate = '20';

    /**
     * Set global wise additional fee
     *
     * @var string
     */
    protected $global_additional_fee  = '30';

    /**
     * Set vendor wise commision type
     *
     * @var string
     */
    protected $vendor_wise_commission_type = 'flat';

    /**
     * Set vendor wise commission rate
     *
     * @var string
     */
    protected $vendor_wise_commission_rate = '10';

    /**
     * Set vendor wise additional fee
     *
     * @var string
     */
    protected $vendor_wise_additional_fee  = '5';

    /**
     * Set category wise commission type
     *
     * @var string
     */
    protected $category_wise_commission_type = 'percentage';

    /**
     * Set category wise commission rate
     *
     * @var string
     */
    protected $category_wise_commission_rate = '12';

    /**
     * Set category wise additioanl fee
     *
     * @var string
     */
    protected $category_wise_additional_fee = '5';

    /**
     * Set product wise commission type
     *
     * @var string
     */
    protected $product_wise_commission_type = 'combine';

    /**
     * Set product wise commission rate
     *
     * @var float
     */
    protected $product_wise_commission_rate = '30';

    /**
     * Set product wise additional fee
     *
     * @var string
     */
    protected $product_wise_additional_fee = '5';

    /**
     * Setup method
     *
     * @since 2.9.21
     */
    public function setUp() {
        parent::setUp();

        $this->create_vendor();
        $this->create_product();

        $this->set_global_settings();
        $this->set_vendor_settings();
        $this->set_category_settings();
        $this->set_product_settings();

        add_filter( 'dokan_prepare_for_calculation', [ $this, 'dokan_add_combine_commission' ], 10, 8 );
    }

    public function tearDown() {
        parent::tearDown();
    }

    /**
     * Set global settings
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function set_global_settings() {
        $args = [
            'commission_type'  => $this->global_commission_type,
            'admin_percentage' => $this->global_commission_rate,
            'additional_fee'   => $this->global_additional_fee
        ];

        update_option( 'dokan_selling', $args );
    }

    /**
     * Set vendor wise commission settings
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function set_vendor_settings() {
        update_user_meta( $this->vendor_id, 'dokan_admin_percentage', $this->vendor_wise_commission_rate );
        update_user_meta( $this->vendor_id, 'dokan_admin_percentage_type', $this->vendor_wise_commission_type );
        update_user_meta( $this->vendor_id, 'dokan_admin_additional_fee', $this->vendor_wise_additional_fee );
    }

    /**
     * Create vendor
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function create_vendor() {
        $this->vendor_id = $this->factory->user->create( [
            'role'        => 'seller',
            'user_login'  => 'vendor',
            'description' => 'vendor',
        ] );
    }

    /**
     * Set category wise commission settings
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function set_category_settings() {
        update_term_meta( $this->category_id, 'per_category_admin_commission_type', $this->category_wise_commission_type );
        update_term_meta( $this->category_id, 'per_category_admin_commission', $this->category_wise_commission_rate );
        update_term_meta( $this->category_id, 'per_category_admin_additional_fee', $this->category_wise_additional_fee );
    }

    /**
     * Set product wise commission settings
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function set_product_settings() {
        update_post_meta( $this->product_id, '_per_product_admin_commission_type', $this->product_wise_commission_type );
        update_post_meta( $this->product_id, '_per_product_admin_commission', $this->product_wise_commission_rate );
        update_post_meta( $this->product_id, '_per_product_admin_additional_fee', $this->product_wise_additional_fee );
    }

    /**
     * Create term
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function create_term() {
        $term = wp_insert_term( 'cat 1', 'product_cat' );
        $this->category_id = $term['term_id'];
    }

    /**
     * Test global commission type
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_global_type() {
        $type = dokan()->commission->get_global_type();
        $this->assertEquals( $this->global_commission_type, $type );
    }

    /**
     * Test global commission rate
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_global_rate() {
        $rate = dokan()->commission->get_global_rate();
        $this->assertEquals( $this->global_commission_rate, $rate );
    }

    /**
     * Test global additional fee
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_global_additional_fee() {
        $fee = dokan()->commission->get_global_additional_fee();
        $this->assertEquals( $this->global_additional_fee, $fee );
    }

    /**
     * Test vendor wise commission type
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_vendor_wise_type() {
        $type = dokan()->commission->get_vendor_wise_type( $this->vendor_id );
        $this->assertEquals( $this->vendor_wise_commission_type, $type );
    }

    /**
     * Test vendor wise commission rate
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_vendor_wise_rate() {
        $rate = dokan()->commission->get_vendor_wise_rate( $this->vendor_id );
        $this->assertEquals( $this->vendor_wise_commission_rate, $rate );
    }

    /**
     * Test vendor wise additional fee
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_vendor_wise_additional_fee() {
        $fee = dokan()->commission->get_vendor_wise_additional_fee( $this->vendor_id );
        $this->assertEquals( $this->vendor_wise_additional_fee, $fee );
    }

    /**
     * Create product
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function create_product() {
        $product = new WC_Product_Simple();
        $product->set_regular_price( '100.00' );
        $category          = wp_insert_term( 'cat1', 'product_cat' );
        $this->category_id = $category['term_id'];

        $product->set_category_ids( [ $this->category_id ] );
        $product->save();

        wp_update_post( [
            'ID'          => $product->get_id(),
            'post_author' => $this->vendor_id
        ] );

        $this->product_id = $product->get_id();
    }

    /**
     * Test category wise commission type
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_category_wise_type() {
        $type = dokan()->commission->get_category_wise_type( $this->product_id );
        $this->assertEquals( $this->category_wise_commission_type, $type );
    }

    /**
     * Test category wise commission rate
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_category_wise_rate() {
        $rate = dokan()->commission->get_category_wise_rate( $this->product_id );
        $this->assertEquals( $this->category_wise_commission_rate, $rate );
    }

    /**
     * Test category wise additional fee
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_category_wise_additional_fee() {
        $fee = dokan()->commission->get_category_wise_additional_fee( $this->product_id );
        $this->assertEquals( $this->category_wise_additional_fee, $fee );
    }

    /**
     * Test product wise commission type
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_product_wise_type() {
        $type = dokan()->commission->get_product_wise_type( $this->product_id );
        $this->assertEquals( $this->product_wise_commission_type, $type );
    }

    /**
     * Test product wise commission rate
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_product_wise_rate() {
        $rate = dokan()->commission->get_product_wise_rate( $this->product_id );
        $this->assertEquals( $this->product_wise_commission_rate, $rate );
    }

    /**
     * Test product wise additioanl fee
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_get_product_wise_additional_fee() {
        $fee = dokan()->commission->get_product_wise_additional_fee( $this->product_id );
        $this->assertEquals( $this->product_wise_additional_fee, $fee );
    }

    /**
     * Test vendor earning by product
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_vendor_earning_by_product() {
        $earning = dokan()->commission->get_earning_by_product( $this->product_id, 'seller' );
        $this->assertEquals( $this->vendor_earning, $earning );
    }

    /**
     * Test admin earning by product
     *
     * @since 2.9.21
     *
     * @return void
     */
    public function test_admin_earning_by_product() {
        $earning = dokan()->commission->get_earning_by_product( $this->product_id, 'admin' );
        $this->assertEquals( $this->admin_earning, $earning );
    }

    /**
     * Dokan add combine commission
     *
     * @since  DOKAN_PRO_SINCE
     *
     * @param  float $earning  [earning for a vendor or admin]
     * @param  float $commission_rate
     * @param  string $commission_type
     * @param  float $additional_fee
     * @param  float $product_price
     * @param  int $order_id
     *
     * @return float
     */
    public function dokan_add_combine_commission( $earning, $commission_rate, $commission_type, $additional_fee, $product_price, $order_id ) {
        if ( 'combine' === $commission_type ) {
            // vendor will get 100 percent if commission rate > 100
            if ( $commission_rate > 100 ) {
                return (float) $product_price;
            }

            // Add `additional_fee` to `earning` only once for an order. ignore it if it's from product listing page
            static $is_additional_fee_added = false;

            // If `_dokan_additional_fee_added` returns `true` that means, the request comes from the `order refund request`.
            // So modify `additional_fee` to the correct amount to get refunded. (additional_fee/order_total)*line_item_total.
            if ( $order_id && get_post_meta( $order_id, '_dokan_additional_fee_added', true ) ) {
                $order                   = wc_get_order( $order_id );
                $additional_fee          = ( $additional_fee / $order->get_total() ) * $product_price;
                $is_additional_fee_added = false;
            }

            // if earning + additional fee > product price, then vendor will get 100 percent of the product price
            $earning       = ( (float) $product_price * $commission_rate ) / 100;
            $total_earning = $is_additional_fee_added ? $earning : $earning + $additional_fee;
            $earning       = $total_earning > $product_price ? (float) $product_price : (float) $product_price - $total_earning;

            // if order id found, means it's not from the product listing page. So we can use the `is_additional_fee_added` static
            // Variable flag to add `additional_fee` only once.
            if ( $order_id ) {
                $is_additional_fee_added = true;
            }
        }

        return $earning;
    }
}
