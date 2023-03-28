<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments;

use WeDevs\Dokan\Vendor\SettingsApi\Abstracts\Page;

defined( 'ABSPATH' ) || exit;

/**
 * Payment Settings API Page.
 *
 * @since 3.7.10
 */
class Payments extends Page {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct();

        add_filter( 'dokan_vendor_rest_settings_element_value_population', [ $this, 'set_active_payment_methods_status' ], 10, 3 );
    }

    /**
     * Group or page key.
     *
     * @var string $group Group or page key.
     */
    protected $group = 'payment';

    /**
     * Render the settings page with tab, cad, fields.
     *
     * @since 3.7.10
     *
     * @param array $groups Settings Group or page to render.
     *
     * @return array
     */
    public function render_group( array $groups ): array {
        $groups[] = [
            'id'          => $this->group,
            'label'       => __( 'Payment Settings', 'dokan-lite' ),
            'description' => __( 'Vendor Payment Settings', 'dokan-lite' ),
            'parent_id'   => '',
            'sub_groups'  => apply_filters( 'dokan_vendor_settings_payment_sub_groups', [] ),
        ];
        return $groups;
    }

    /**
     * Render the payment settings page.
     *
     * @since 3.7.10
     */
    public function render_settings( array $settings ): array {
        $settings[] = [
            'id'        => 'general',
            'title'     => __( 'General', 'dokan-lite' ),
            'desc'      => __( 'The general Payment settings.', 'dokan-lite' ),
            'icon'      => 'dokan-icon-paypal',
            'info'      => [],
            'type'      => 'tab',
            'parent_id' => 'payment',
        ];

        return apply_filters( 'dokan_vendor_rest_payment_settings', $settings );
    }

    /**
     * Set the active payment processor status.
     *
     * @since 3.7.10
     *
     * @param array $settings Settings Element.
     *
     * @return array
     */
    public function set_active_payment_methods_status( array $settings, array $settings_values, string $parent_id ) {
        if ( 'payment' === $parent_id ) {
            $settings['active'] = in_array( $settings['id'], array_filter( dokan_withdraw_get_active_methods() ), true );
        }
        return $settings;
    }
}
