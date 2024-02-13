<?php

namespace WeDevs\Dokan\Commission\Utils;

class CommissionSettings {
    private $type = null;
    private $flat = '';
    private $percentage = '';
    private $category_id = '';

    private $category_commissions = [];

    public function __construct( $type = '', $flat = '', $percentage = '', $category_commissions = [], $category_id = '' ) {
        $this->type = $type;
        $this->flat = $flat;
        $this->percentage = $percentage;
        $this->category_commissions = $category_commissions;
        $this->category_id = $category_id;
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
