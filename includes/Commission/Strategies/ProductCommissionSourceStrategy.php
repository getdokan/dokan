<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class ProductCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * @var false|\WC_Product|null
     */
    private $product;

    const SOURCE = 'product';

    public function __construct( $product_id ) {
        $this->product = dokan()->product->get( $product_id );
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function get_settings(): CommissionSettings {
        $percentage = $this->product ? $this->product->get_meta( '_per_product_admin_commission', true ) : '';
        $type = $this->product ? $this->product->get_meta( '_per_product_admin_commission_type', true ) : '';
        $flat = $this->product ? $this->product->get_meta( '_per_product_admin_additional_fee', true ) : '';

        return new CommissionSettings( $type, $flat, $percentage );
    }
}
