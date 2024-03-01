<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class ProductCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * Product id
     *
     * @since DOKAN_SINCE
     *
     * @var int
     */
    private $product_id;

    /**
     * Product strategy source
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'product';

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param $product_id
     */
    public function __construct( $product_id ) {
        $this->product_id = $product_id;
    }

    /**
     * Returns product strategy source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns product commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Utils\CommissionSettings
     */
    public function get_settings(): CommissionSettings {
        $settings = dokan()->product->get_commission_settings( $this->product_id );

        return $settings;
    }
}
