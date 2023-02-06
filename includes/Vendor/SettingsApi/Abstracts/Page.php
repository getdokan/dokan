<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Abstracts;

defined( 'ABSPATH' ) || exit;

/**
 * Vendor Settings Page.
 */
abstract class Page {

    /**
     * Hook Order for setting rendering.
     *
     * @var int
     */
    protected $hook_order = 10;


    /**
     * Settings Group Key for setting rendering.
     *
     * @var string
     */
    protected $group = '';

    /**
     * Constructor function.
     */
    public function __construct() {
        add_filter( 'dokan_vendor_rest_settings_page_list', [ $this, 'render_group' ], $this->hook_order );
        add_filter( 'dokan_vendor_rest_settings_for' . $this->group . '_page', [ $this, 'render_settings' ], $this->hook_order );
    }

    /**
     * Render the settings page with tab, cad, fields.
     *
     * @since 3.7.10
     *
     * @param array $settings Settings to render.
     *
     * @return array
     */
    abstract public function render_settings( array $settings ): array;


    /**
     * Render the settings page with tab, cad, fields.
     *
     * @since 3.7.10
     *
     * @param array $groups Settings Group or page to render.
     *
     * @return array
     */
    abstract public function render_group( array $groups ): array;
}
