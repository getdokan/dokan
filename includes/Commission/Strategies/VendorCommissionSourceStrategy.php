<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class VendorCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * @var object|\WeDevs\Dokan\Vendor\Vendor
     */
    private $vendor;
    const SOURCE = 'vendor';
    /**
     * @var mixed
     */
    private $category_id;

    public function __construct( $vendor_id, $category_id ) {
        $this->vendor = dokan()->vendor->get( $vendor_id );
        $this->category_id = $category_id;
    }

    /**
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function get_settings(): CommissionSettings {
        $commission_settings = $this->vendor->get_commission_settings();
        $commission_settings->set_category_id( $this->get_category_id() );

        return $commission_settings;
    }
}
