<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\ProductCategory\Helper;

class Product extends AbstractStrategy {

    /**
     * Product id
     *
     * @since 3.14.0
     *
     * @var int
     */
    protected $product_id;

    protected $vendor_id;
    protected ?int $category_id;

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
    public function __construct( $product_id, $vendor_id = 0, $category_id = null ) {
        $this->product_id  = $product_id;
        $this->vendor_id   = $vendor_id;
        $this->category_id = $category_id;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function set_next(): AbstractStrategy {
        if ( ! $this->next ) {
            $product_id = $this->product_id;
            $vendor_id = $this->vendor_id ? $this->vendor_id : dokan_get_vendor_by_product( $product_id, true );

			$this->next = new Vendor( $vendor_id, $this->get_category_from_product( $product_id ) );
        }

        return $this;
    }

    /**
     * Get category for the given product.
     *
     * @param int $product_id
     * @return void|int
     */
    protected function get_category_from_product( $product_id ) {
        if ( empty( $this->category_id ) && ! empty( $product_id ) ) {
            $product_categories = Helper::get_saved_products_category( $product_id );
            $chosen_categories  = $product_categories['chosen_cat'];
            $category_id        = reset( $chosen_categories );
            $this->category_id = $category_id;
        }

        return $this->category_id ? $this->category_id : 0;
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
    public function set_settings() {
        $settings = new \WeDevs\Dokan\Commission\Settings\Product( $this->product_id );

        $this->settings = $settings->get();
    }
}
