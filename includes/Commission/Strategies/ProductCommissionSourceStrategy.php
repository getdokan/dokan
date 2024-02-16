<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class ProductCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * @var false|\WC_Product|null
     */
    private $product_id;

    const SOURCE = 'product';

    public function __construct( $product_id ) {
        $this->product_id = $product_id;
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function get_settings(): CommissionSettings {
        $settings = dokan()->product->get_commission_settings( $this->product_id );

        return $settings;
    }
}
