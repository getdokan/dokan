<?php

namespace WeDevs\Dokan\Commission\Utils;

class CommissionSettings {
    public $type = null;
    public $flat = '';
    public $percentage          = '';
    public $category_commission = [];

    public function __construct( $type = '', $flat = '', $percentage = '', $category_commission = [] ) {
        $this->type = $type;
        $this->flat = $flat;
        $this->percentage = $percentage;
        $this->category_commission = $category_commission;
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
        return dokan()->commission->validate_rate( $this->flat );
    }

    /**
     * @return mixed|string
     */
    public function get_percentage() {
        return dokan()->commission->validate_rate( $this->percentage );
    }

    /**
     * @return array|mixed|null
     */
    public function get_category_commission() {
        return $this->category_commission;
    }
}
