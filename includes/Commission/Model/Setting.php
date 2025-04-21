<?php

namespace WeDevs\Dokan\Commission\Model;

use WeDevs\Dokan\Commission\Settings\DefaultSetting;

class Setting {

    /**
     * Commission type.
     *
     * @since 3.14.0
     *
     * @var null|string
     */
    protected $type = DefaultSetting::TYPE;

    /**
     * Flat commission amount
     *
     * @since 3.14.0
     *
     * @var string|float|int
     */
    protected $flat = '';

    /**
     * Commissin percentage amount.
     *
     * @since 3.14.0
     *
     * @var string|int|float
     */
    protected $percentage = '';

    /**
     * The category id for which the commission will be applied.
     *
     * @since 3.14.0
     * @var string|int
     */
    protected $category_id = '';

    /**
     * The category commission data.
     *
     * @since 3.14.0
     *
     * @var array
     */
    protected $category_commissions = [];

    /**
     * Applied commission meta data.
     *
     * @since 3.14.0
     *
     * @var array
     */
    protected $meta_data = [];

    /**
     * Returns the commission meta data.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_meta_data(): array {
        return $this->meta_data;
    }

    /**
     * Sets the commission meta data.
     *
     * @since 3.14.0
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
     * @since 3.14.0
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
     * @since 3.14.0
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
     * Sets the flat commissin amount.
     *
     * @since 3.14.0
     *
     * @param mixed|string $flat
     *
     * @return $this
     */
    public function set_combined_flat( $flat ): Setting {
        $this->flat = $flat;

        return $this;
    }

    /**
     * Sets the percentage amount.
     *
     * @since 3.14.0
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
     * Sets the commission type.
     *
     * @since 3.14.0
     *
     * @return mixed|string|null
     */
    public function get_type() {
        return $this->type;
    }

    /**
     * Returns the flat amount.
     *
     * @since 3.14.0
     *
     * @return mixed|string
     */
    public function get_flat(): float {
        return $this->is_combined() ? 0 : floatval($this->flat);
    }

     /**
     * Returns the flat amount.
     *
     * @since 3.14.0
     *
     * @return mixed|string
     */
    public function get_combine_flat(): float {
        return $this->is_combined() ? floatval($this->flat) : 0;
    }

    protected function is_combined(): bool {
        return $this->type === 'combine';
    }

    /**
     * Returns the percentage amount.
     *
     * @since 3.14.0
     *
     * @return mixed|string
     */
    public function get_percentage() {
        return floatval( $this->percentage ) / 100;
    }

    /**
     * Returns the category commission data.
     *
     * @since 3.14.0
     *
     * @return array|mixed|null
     */
    public function get_category_commissions() {
        return $this->category_commissions;
    }

    /**
     * Returns the category id
     *
     * @since 3.14.0
     *
     * @return array|mixed|null
     */
    public function get_category_id() {
        return $this->category_id;
    }

    public function is_applicable(): bool {
        return  $this->percentage !== '' || $this->flat !== '';
    }
}
