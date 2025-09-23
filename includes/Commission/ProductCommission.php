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
 * @since 4.0.0
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


    public function set_category_id( ?int $category_id ): void {
        $this->category_id = $category_id;
    }


    public function set_vendor_id( ?int $vendor_id ): void {
        $this->vendor_id = $vendor_id;
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
     * @since 4.0.0
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

        $strategy = apply_filters( 'dokan_product_commission_strategies', new Product( $this->product_id, $this->vendor_id, $this->category_id ) );

        $commission_calculator = dokan_get_container()->get( Calculator::class );
        return $commission_calculator
            ->set_settings( $strategy->get_settings() )
            ->set_total( $this->total_amount )
            ->set_quantity( 1 )
            ->calculate();
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function get(): Commission {
        return $this->calculate();
    }
}
