<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\ProductCategory\Helper;
use WeDevs\Dokan\Vendor\Coupon;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since DOKAN_SINCE
 */
class ProductCommission {

    protected ?int $product_id;
    protected ?float $total_amount;
    protected ?int $category_id;
    /**
     * @var int|null
     */
    protected ?int $vendor_id;

    /**
     * ProductCommission constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param int|null $product_id
     * @param float|null $total_amount
     * @param int|null $category_id
     */
    public function __construct( int $product_id = 0, ?float $total_amount = null, ?int $category_id = null, ?int $vendor_id = null ) {

        if ( ( ! $product_id ) && ( ! $total_amount ) && ( ! $category_id ) ) {
			throw new DokanException( esc_html__( 'Product ID or Total Amount with category ID is required.', 'dokan-lite' ) );
        }

        if ( $product_id ) {
            $this->product_id = $product_id;
        }

        if ( empty( $total_amount ) && empty( $category_id ) ) {
            throw new DokanException( esc_html__( 'Total Amount or Category ID is required.', 'dokan-lite' ) );
        }

        if ( $total_amount ) {
            $total_amount = floatval( $total_amount );
            if ( $total_amount < 0 ) {
                throw new DokanException( esc_html__( 'Total Amount must be greater than or equal to 0.', 'dokan-lite' ) );
            }
        }

        if ( $category_id ) {
            $category_id = intval( $category_id );
            if ( $category_id < 0 ) {
                throw new DokanException( esc_html__( 'Category ID must be greater than or equal to 0.', 'dokan-lite' ) );
            }
        }

        if ( empty( $total_amount ) && ! empty( $product_id ) ) {
            $product = dokan()->product->get( $product_id );
            if ( $product && $product->get_price() && ! empty( $product->get_price() ) ) {
                $total_amount = floatval( $product->get_price() );
            } else {
                throw new DokanException( esc_html__( 'Product price is required.', 'dokan-lite' ) );
            }
        }

        if ( empty( $category_id ) && ! empty( $product_id ) ) {
            $product_categories = Helper::get_saved_products_category( $product_id );
            $chosen_categories  = $product_categories['chosen_cat'];
            $category_id        = reset( $chosen_categories );
            $category_id        = $category_id ? $category_id : 0;
        }

        if ( empty( $vendor_id ) && ! empty( $product_id ) ) {
            $vendor_id = dokan_get_vendor_by_product( $product_id, true );
        }

        $this->total_amount = $total_amount;
        $this->category_id = $category_id;
        $this->vendor_id = $vendor_id;
    }

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @param $auto_save
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|null
     */
    public function calculate() {
        $strategies = [
            new Product( $this->product_id ),
            new Vendor( $this->vendor_id, $this->category_id ),
            new GlobalStrategy( $this->category_id ),
            new DefaultStrategy(),
        ];

        $context = new Calculator( $strategies );
        $commission_data = $context->calculate_commission( $this->total_amount, 1 );

        return $commission_data;
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function retrieve() {
        return $this->calculate();
    }
}
