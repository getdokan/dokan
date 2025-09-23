<?php

namespace WeDevs\Dokan\Commission\Strategies;

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

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function set_next(): AbstractStrategy {
        if ( ! $this->next ) {
			$this->next = new GlobalStrategy( $this->category_id );
        }

        return $this;
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
     * @return void
     */
    public function set_settings() {
        $settings = new \WeDevs\Dokan\Commission\Settings\Vendor( $this->vendor_id, $this->category_id );
        $this->settings = $settings->get();

        return $settings;
    }
}
