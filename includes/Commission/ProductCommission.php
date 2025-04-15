<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\ProductCategory\Helper;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since DOKAN_SINCE
 */
class ProductCommission extends AbstractCommissionCalculator {

    protected ?int $product_id;
    protected ?int $category_id;
    protected ?int $vendor_id;
    protected $total_amount;

    public function get_product_id(): ?int {
        return $this->product_id;
    }

    public function set_product_id( ?int $product_id ): void {
        $this->product_id = $product_id;
    }

    public function get_category_id(): ?int {
        return $this->category_id;
    }

    public function set_category_id( ?int $category_id ): void {
        $this->category_id = $category_id;
    }

    public function get_vendor_id(): ?int {
        return $this->vendor_id;
    }

    public function set_vendor_id( ?int $vendor_id ): void {
        $this->vendor_id = $vendor_id;
    }

    /**
     * @return mixed
     */
    public function get_total_amount() {
        return $this->total_amount;
    }

    /**
     * @param mixed $total_amount
     */
    public function set_total_amount( $total_amount ): void {
        $this->total_amount = $total_amount;
    }

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @param $auto_save
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|DokanException
     */
    public function calculate(): Commission {
        if ( ! $this->product_id ) {
            throw new DokanException( esc_html__( 'Product ID or Total Amount with category ID is required.', 'dokan-lite' ) );
        }

        if ( $this->total_amount ) {
            $total_amount = floatval( $this->total_amount );
            if ( $total_amount < 0 ) {
                throw new DokanException( esc_html__( 'Total Amount must be greater than or equal to 0.', 'dokan-lite' ) );
            }
        }

        if ( empty( $this->total_amount ) && ! empty( $this->product_id ) ) {
            $product = wc_get_product( $this->product_id );
            $this->total_amount = floatval( $product->get_price() );
        }

        if ( empty( $this->category_id ) && ! empty( $this->product_id ) ) {
            $product_categories = Helper::get_saved_products_category( $this->product_id );
            $chosen_categories  = $product_categories['chosen_cat'];
            $category_id        = reset( $chosen_categories );
            $this->category_id = $category_id;
        }

        if ( empty( $this->vendor_id ) && ! empty( $this->product_id ) ) {
            $this->vendor_id = dokan_get_vendor_by_product( $this->product_id, true );
        }

        $this->price = $this->total_amount;
        $this->quantity = 1;

        $strategies = apply_filters(
            'dokan_product_commission_strategies', [
                new Product( $this->product_id ),
                new Vendor( $this->vendor_id, $this->category_id ),
                new GlobalStrategy( $this->category_id ),
                new DefaultStrategy(),
            ]
        );

        $this->determine_strategy_to_apply( $strategies );

        return $this->calculate_commission();
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function get(): Commission {
        return $this->calculate();
    }

    /**
     * Additional adjustments to the commission data.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Commission $commission_data
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function additional_adjustments( Commission $commission_data ): Commission {
        return $commission_data;
    }
}
