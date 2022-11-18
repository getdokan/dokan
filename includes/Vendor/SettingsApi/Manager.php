<?php

namespace WeDevs\Dokan\Vendor\SettingsApi;

use WeDevs\Dokan\Vendor\SettingsApi\Pages\Payments;
use WeDevs\Dokan\Vendor\SettingsApi\Pages\Store;
use WeDevs\Dokan\Vendor\SettingsApi\PaymentProcessors\Bank;
use WeDevs\Dokan\Vendor\SettingsApi\PaymentProcessors\PayPal;

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
