<?php

namespace WeDevs\Dokan\Vendor\SettingsApi;

use WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Gateways\Bank;
use WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Gateways\PayPal;
use WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Payments;
use WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Store;

defined( 'ABSPATH' ) || exit;

/**
 * Vendor Settings API Manager.
 *
 * @since DOKAN_SINCE
 */
class Manager {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->init();
    }

    /**
     * Initialize the class instance.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    private function init() {
        new Store();
        new Payments();
        new PayPal();
        new Bank();
    }
}
