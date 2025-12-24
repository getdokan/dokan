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

    protected string $source;

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
     * Sets the commission type.
     *
     * @since 3.14.0
     *
     * @param mixed|string $type
     *
     * @return $this
     */
    public function set_source( string $source ): Setting {
        $this->source = $source;

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
     * Sets the category commission data.
     *
     * @since 3.14.0
     *
     * @param array $category_commissions
     *
     * @return $this
     */
    public function set_category_commissions( array $category_commissions ): Setting {
        $this->category_commissions = $category_commissions;

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
     * Sets the commission source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return $this->source;
    }

    /**
     * Returns the value of the flat settings.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_flat(): string {
        return $this->flat;
    }

    /**
     * Returns the flat amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_flat_value(): float {
        return $this->is_combined() ? 0 : floatval( $this->get_flat() );
    }

    /**
     * Returns the flat amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_combine_flat(): float {
        return $this->is_combined() ? floatval( $this->flat ) : 0;
    }

    /**
     * Returns true if the commission is combined. 
     * N.B. This is a legacy type. It does not exist in the new commission system.
     *
     * @return bool
     */
    protected function is_combined(): bool {
        return $this->type === 'combine';
    }

    /**
     * Returns the value of the percentage settings.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_percentage(): string {
        return $this->percentage;
    }

    /**
     * Returns the percentage amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_percentage_value(): float {
        return floatval( $this->percentage );
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
        return trim( $this->percentage ) !== '' || trim( $this->flat ) !== '';
    }

    /**
     * Returns the commission settings as an array.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function to_array(): array {
        return [
            'type'       => $this->get_type(),
            'flat'       => $this->get_flat(),
            'percentage' => $this->get_percentage(),
            'source'     => $this->get_source(),
            'meta_data'  => $this->get_meta_data(),
        ];
    }
}
