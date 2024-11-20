<?php

namespace WeDevs\Dokan\Commission\Model;

use WeDevs\Dokan\Commission\Settings\DefaultSetting;

class Setting {

    /**
     * Commission type.
     *
     * @since DOKAN_SINCE
     *
     * @var null|string
     */
    protected $type = DefaultSetting::TYPE;

    /**
     * Flat commission amount
     *
     * @since DOKAN_SINCE
     *
     * @var string|float|int
     */
    protected $flat = '';

    /**
     * Commissin percentage amount.
     *
     * @since DOKAN_SINCE
     *
     * @var string|int|float
     */
    protected $percentage = '';

    /**
     * The category id for which the commission will be applied.
     *
     * @since DOKAN_SINCE
     * @var string|int
     */
    protected $category_id = '';

    /**
     * The category commission data.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected $category_commissions = [];

    /**
     * Applied commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected $meta_data = [];

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
    public function set_meta_data( array $meta_data ): Setting {
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
    public function set_type( $type ): Setting {
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
    public function set_flat( $flat ): Setting {
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
    public function set_percentage( $percentage ): Setting {
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
    public function set_category_id( $category_id ): Setting {
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
    public function set_category_commissions( $category_commissions ): Setting {
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
