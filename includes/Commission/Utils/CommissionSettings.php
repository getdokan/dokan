<?php

namespace WeDevs\Dokan\Commission\Utils;

class CommissionSettings {

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param string           $type
     * @param int|float|string $flat
     * @param int|float|string $percentage
     * @param array            $category_commissions
     * @param int|string       $category_id
     * @param array           $meta_data
     */
    public function __construct( $type = '', $flat = '', $percentage = '', $category_commissions = [], $category_id = '', $meta_data = [] ) {
        $this->set_type( $type );
        $this->set_flat( $flat );
        $this->set_percentage( $percentage );
        $this->set_category_commissions( $category_commissions );
        $this->set_category_id( $category_id );
        $this->set_meta_data( $meta_data );
    }

    /**
     * Commission type.
     *
     * @since DOKAN_SINCE
     *
     * @var null|string
     */
    private $type = null;

    /**
     * Flat commission amount
     *
     * @since DOKAN_SINCE
     *
     * @var string|float|int
     */
    private $flat = '';

    /**
     * Commissin percentage amount.
     *
     * @since DOKAN_SINCE
     *
     * @var string|int|float
     */
    private $percentage = '';

    /**
     * The category id for which the commission will be applied.
     *
     * @since DOKAN_SINCE
     * @var string|int
     */
    private $category_id = '';

    /**
     * The category commission data.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    private $category_commissions = [];

    /**
     * Applied commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    private $meta_data = [];

    /**
     * Returns the commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_meta_data(): array {
        return $this->meta_data;
    }

    /**
     * Sets the commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @param array $meta_data
     *
     * @return $this
     */
    public function set_meta_data( array $meta_data ): CommissionSettings {
        $this->meta_data = $meta_data;

        return $this;
    }

    /**
     * Sets the commission type.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed|string $type
     *
     * @return $this
     */
    public function set_type( $type ): CommissionSettings {
        $this->type = $type;

        return $this;
    }

    /**
     * Sets the flat commissin amount.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed|string $flat
     *
     * @return $this
     */
    public function set_flat( $flat ): CommissionSettings {
        $this->flat = $flat;

        return $this;
    }

    /**
     * Sets the percentage amount.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed|string $percentage
     *
     * @return $this
     */
    public function set_percentage( $percentage ): CommissionSettings {
        $this->percentage = $percentage;

        return $this;
    }

    /**
     * Sets the category id.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed|string $category_id
     *
     * @return $this
     */
    public function set_category_id( $category_id ): CommissionSettings {
        $this->category_id = $category_id;

        return $this;
    }

    /**
     * Sets the category commission data.
     *
     * @since DOKAN_SINCE.
     *
     * @param array|mixed $category_commissions
     *
     * @return $this
     */
    public function set_category_commissions( $category_commissions ): CommissionSettings {
        $this->category_commissions = $category_commissions;

        return $this;
    }

    /**
     * Sets the commission type.
     *
     * @since DOKAN_SINCE
     *
     * @return mixed|string|null
     */
    public function get_type() {
        return $this->type;
    }

    /**
     * Returns the flat amount.
     *
     * @since DOKAN_SINCE
     *
     * @return mixed|string
     */
    public function get_flat() {
        return $this->flat;
    }

    /**
     * Returns the percentage amount.
     *
     * @since DOKAN_SINCE
     *
     * @return mixed|string
     */
    public function get_percentage() {
        return $this->percentage;
    }

    /**
     * Returns the category commission data.
     *
     * @since DOKAN_SINCE
     *
     * @return array|mixed|null
     */
    public function get_category_commissions() {
        return $this->category_commissions;
    }

    /**
     * Returns the category id
     *
     * @since DOKAN_SINCE
     *
     * @return array|mixed|null
     */
    public function get_category_id() {
        return $this->category_id;
    }
}
