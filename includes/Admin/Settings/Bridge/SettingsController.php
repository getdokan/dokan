<?php

namespace WeDevs\Dokan\Admin\Settings\Bridge;

use WeDevs\PluginSettings\REST\SettingsController as BaseSettingsController;

/**
 * Dokan Settings Controller Bridge
 *
 * Extends the plugin-settings package's REST controller with Dokan-specific
 * configuration.
 *
 * @since DOKAN_SINCE
 */
class SettingsController extends BaseSettingsController {

    /**
     * Constructor.
     *
     * @param SettingsManager $manager Settings manager instance.
     */
    public function __construct( SettingsManager $manager ) {
        parent::__construct( $manager, 'dokan/v1/admin' );
        $this->set_capability( 'manage_woocommerce' );
    }
}

