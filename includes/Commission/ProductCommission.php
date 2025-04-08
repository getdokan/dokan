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
        if ( ! $product_id ) {
			throw new DokanException( esc_html__( 'Product ID or Total Amount with category ID is required.', 'dokan-lite' ) );
        }

        $this->product_id = $product_id;

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
            $product = wc_get_product( $product_id );
            $total_amount = floatval( $product->get_price() );
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

        $this->price = $total_amount;
        $this->quantity = 1;
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
    public function calculate(): Commission {
        $strategies = [
            new Product( $this->product_id ),
            new Vendor( $this->vendor_id, $this->category_id ),
            new GlobalStrategy( $this->category_id ),
            new DefaultStrategy(),
        ];

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
    public function retrieve(): Commission {
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
