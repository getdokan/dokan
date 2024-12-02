<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\Builder;

class Product extends AbstractStrategy {

    /**
     * Product id
     *
     * @since 3.14.0
     *
     * @var int
     */
    protected $product_id;

    /**
     * Product strategy source
     *
     * @since 3.14.0
     */
    const SOURCE = 'product';

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param $product_id
     */
    public function __construct( $product_id ) {
        $this->product_id = $product_id;
    }

    /**
     * Returns product strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns product commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $settings = Builder::build( Builder::TYPE_PRODUCT, $this->product_id );

        return $settings->get();
    }
}
