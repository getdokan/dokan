<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\Builder;

class Vendor extends AbstractStrategy {

    /**
     * Vendor data.
     *
     * @since 3.14.0
     *
     * @var int
     */
    protected $vendor_id;

    /**
     * Vendor strategy source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'vendor';

    /**
     * Category id.
     *
     * @since 3.14.0
     *
     * @var mixed
     */
    protected $category_id;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param int $vendor_id
     * @param int $category_id
     *
     * @return void
     */
    public function __construct( $vendor_id, $category_id ) {
        $this->vendor_id = $vendor_id;
        $this->category_id = $category_id;
    }

    /**
     * Returns category id.
     *
     * @since 3.14.0
     *
     * @return int
     */
    public function get_category_id() {
        return $this->category_id;
    }

    /**
     * Returns vendor commission source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns vendor commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $settings = Builder::build( Builder::TYPE_VENDOR, $this->vendor_id );
        $settings = $settings->get();
        $settings->set_category_id( $this->get_category_id() );

        return $settings;
    }
}
