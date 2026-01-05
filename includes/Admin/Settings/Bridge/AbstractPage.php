<?php

namespace WeDevs\Dokan\Admin\Settings\Bridge;

use WeDevs\PluginSettings\Pages\AbstractPage as BaseAbstractPage;

/**
 * Dokan Abstract Page Bridge
 *
 * Extends the plugin-settings package's AbstractPage with Dokan-specific defaults.
 * This allows existing Dokan settings pages to work with minimal changes.
 *
 * @since DOKAN_SINCE
 */
abstract class AbstractPage extends BaseAbstractPage {

    /**
     * Constructor.
     *
     * Sets Dokan-specific defaults for the page.
     */
    public function __construct() {
        parent::__construct( $this->id, 'dokan_admin_settings' );
        $this->set_pages_filter( 'dokan_admin_settings_pages' );
    }

    /**
     * Register hooks for the page.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_settings_pages', [ $this, 'enlist' ] );
    }
}

