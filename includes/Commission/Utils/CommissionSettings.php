<?php

namespace WeDevs\Dokan\Commission\Utils;

class CommissionSettings {
    private $type = null;
    private $flat = '';
    private $percentage = '';
    private $category_id = '';

    private $category_commissions = [];
    private $meta_data = [];

    public function get_meta_data(): array {
        return $this->meta_data;
    }

    public function set_meta_data( array $meta_data ): CommissionSettings {
        $this->meta_data = $meta_data;

        return $this;
    }

    /**
     * @param mixed|string $type
     */
    public function set_type( $type ): CommissionSettings {
        $this->type = $type;

        return $this;
    }

    /**
     * @param mixed|string $flat
     */
    public function set_flat( $flat ): CommissionSettings {
        $this->flat = $flat;

        return $this;
    }

    /**
     * @param mixed|string $percentage
     */
    public function set_percentage( $percentage ): CommissionSettings {
        $this->percentage = $percentage;

        return $this;
    }

    /**
     * @param mixed|string $category_id
     */
    public function set_category_id( $category_id ): CommissionSettings {
        $this->category_id = $category_id;

        return $this;
    }

    /**
     * @param array|mixed $category_commissions
     */
    public function set_category_commissions( $category_commissions ): CommissionSettings {
        $this->category_commissions = $category_commissions;

        return $this;
    }

    public function __construct( $type = '', $flat = '', $percentage = '', $category_commissions = [], $category_id = '', $meta_data = [] ) {
        $this->set_type( $type );
        $this->set_flat( $flat );
        $this->set_percentage( $percentage );
        $this->set_category_commissions( $category_commissions );
        $this->set_category_id( $category_id );
        $this->set_meta_data( $meta_data );
    }

    /**
     * @return mixed|string|null
     */
    public function get_type() {
        return $this->type;
    }

    /**
     * @return mixed|string
     */
    public function get_flat() {
        return $this->flat;
    }

    /**
     * @return mixed|string
     */
    public function get_percentage() {
        return $this->percentage;
    }

    /**
     * @return array|mixed|null
     */
    public function get_category_commissions() {
        return $this->category_commissions;
    }

    /**
     * @return array|mixed|null
     */
    public function get_category_id() {
        return $this->category_id;
    }
}
