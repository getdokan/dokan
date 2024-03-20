<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class VendorCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * Vendor data.
     *
     * @since DOKAN_SINCE
     *
     * @var object|\WeDevs\Dokan\Vendor\Vendor
     */
    private $vendor;

    /**
     * Vendor strategy source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'vendor';

    /**
     * Category id.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed
     */
    private $category_id;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id
     * @param int $category_id
     *
     * @return void
     */
    public function __construct( $vendor_id, $category_id ) {
        $this->vendor = dokan()->vendor->get( $vendor_id );
        $this->category_id = $category_id;
    }

    /**
     * Returns category id.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_category_id() {
        return $this->category_id;
    }

    /**
     * Returns vendor commission source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns vendor commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Utils\CommissionSettings
     */
    public function get_settings(): CommissionSettings {
        $commission_settings = $this->vendor->get_commission_settings();
        $commission_settings->set_category_id( $this->get_category_id() );

        return $commission_settings;
    }
}
