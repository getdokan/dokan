<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\FieldFactory\FieldFactory;

class BasicStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'basic';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
	protected int $priority = 10;

    /**
     * The step skippable or not.
     * The default is true.
     *
     * @var bool $skippable The step skippable or not.
     */
    protected bool $skippable = false;

    /**
     * The settings options.
     *
     * @var array The settings options.
     */
    protected $settings_options = [ 'dokan_selling' ];

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_basic';

    /**
     * Get default basic settings
     *
     * @since 4.0.0
     *
     * @return array Default basic settings
     */
    protected function get_default_settings(): array {
		/**
		 * Filter the default settings for the basic step in the onboarding setup.
		 *
		 * @since 4.0.0
		 *
		 * @param array $default_settings The default settings for the basic step.
		 *
		 * @return array Filtered default settings.
		 */
		return apply_filters(
            'dokan_admin_setup_guides_basic_step_default_data',
            [
				'shipping_fee_recipient'     => 'seller',
				'tax_fee_recipient'          => 'seller',
				'shipping_tax_fee_recipient' => 'seller',
				'order_status_change'        => 'on',
				'new_seller_enable_selling'  => 'on',
			]
		);
    }

    /**
     * @inheritDoc
     */
	public function register(): void {}

    /**
     * @inheritDoc
     */
	public function scripts(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
	public function styles(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
    public function describe_settings(): void {
        $default_settings = $this->get_default_settings();
        $dokan_selling    = get_option( 'dokan_selling', $default_settings );

        $this->set_title( esc_html__( 'Basic', 'dokan-lite' ) );

        // Create fields using FieldFactory
        $shipping_fee_field = FieldFactory::radio_box(
            'shipping_fee_recipient',
            esc_html__( 'Shipping Fee Recipient', 'dokan-lite' ),
            [
                [
					'value' => 'admin',
					'label' => esc_html__( 'Admin', 'dokan-lite' ),
				],
                [
					'value' => 'seller',
					'label' => esc_html__( 'Vendor', 'dokan-lite' ),
				],
            ],
            [
                'description' => esc_html__( 'Choose who receives shipping charges - Admin keeps all shipping fees or Vendors receive fees for their products', 'dokan-lite' ),
                'default'     => $default_settings['shipping_fee_recipient'],
                'value'       => $dokan_selling['shipping_fee_recipient'] ?? $default_settings['shipping_fee_recipient'],
            ]
        );

        $tax_fee_field = FieldFactory::radio_box(
            'tax_fee_recipient',
            esc_html__( 'Product Tax Fee Recipient', 'dokan-lite' ),
            [
                [
					'value' => 'admin',
					'label' => esc_html__( 'Admin', 'dokan-lite' ),
				],
                [
					'value' => 'seller',
					'label' => esc_html__( 'Vendor', 'dokan-lite' ),
				],
            ],
            [
                'description' => esc_html__( 'Determine who collects product taxes - Admin manages all tax collection or Vendors handle their product taxes', 'dokan-lite' ),
                'default'     => $default_settings['tax_fee_recipient'],
                'value'       => $dokan_selling['tax_fee_recipient'] ?? $default_settings['tax_fee_recipient'],
            ]
        );

        $shipping_tax_field = FieldFactory::radio_box(
            'shipping_tax_fee_recipient',
            esc_html__( 'Shipping Tax Fee Recipient', 'dokan-lite' ),
            [
                [
					'value' => 'admin',
					'label' => esc_html__( 'Admin', 'dokan-lite' ),
				],
                [
					'value' => 'seller',
					'label' => esc_html__( 'Vendor', 'dokan-lite' ),
				],
            ],
            [
                'description' => esc_html__( 'Select who receives shipping tax - Admin centralizes all shipping tax or Vendors collect shipping tax for their orders', 'dokan-lite' ),
                'default'     => $default_settings['shipping_tax_fee_recipient'],
                'value'       => $dokan_selling['shipping_tax_fee_recipient'] ?? $default_settings['shipping_tax_fee_recipient'],
            ]
        );

        $order_status_field = FieldFactory::toggle(
            'order_status_change',
            esc_html__( 'Vendors can change order status', 'dokan-lite' ),
            [
                'description'   => esc_html__( 'Allow vendors to update order statuses (processing, completed, etc.) for their products', 'dokan-lite' ),
                'default'       => $default_settings['order_status_change'] === 'on',
                'value'         => ( $dokan_selling['order_status_change'] ?? $default_settings['order_status_change'] ) === 'on',
                'enable_state'  => [
					'value' => 'on',
					'title' => esc_html__( 'Enabled', 'dokan-lite' ),
				],
                'disable_state' => [
					'value' => 'off',
					'title' => esc_html__( 'Disabled', 'dokan-lite' ),
				],
            ]
        );

        $new_seller_field = FieldFactory::toggle(
            'new_seller_enable_selling',
            esc_html__( 'New Vendor Selling Directly', 'dokan-lite' ),
            [
                'description'   => esc_html__( 'Automatically enable selling capabilities for newly registered vendors', 'dokan-lite' ),
                'default'       => $default_settings['new_seller_enable_selling'] === 'on',
                'value'         => ( $dokan_selling['new_seller_enable_selling'] ?? $default_settings['new_seller_enable_selling'] ) === 'on',
                'enable_state'  => [
					'value' => 'on',
					'title' => esc_html__( 'Enabled', 'dokan-lite' ),
				],
                'disable_state' => [
					'value' => 'off',
					'title' => esc_html__( 'Disabled', 'dokan-lite' ),
				],
            ]
        );

        // Create section with children
        $section = FieldFactory::section(
            'basic',
            esc_html__( 'Basic', 'dokan-lite' ),
            [
                $shipping_fee_field,
                $tax_fee_field,
                $shipping_tax_field,
                $order_status_field,
                $new_seller_field,
            ]
        );

        $this->add_field_element( $section );
    }

    /**
     * @inheritDoc
     */
    public function settings(): array {
        return [];
    }

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        $default_settings = $this->get_default_settings();
        $dokan_selling    = get_option( 'dokan_selling', $default_settings );

        $dokan_selling['shipping_fee_recipient']     = $data['basic']['shipping_fee_recipient'] ?? $default_settings['shipping_fee_recipient'];
        $dokan_selling['tax_fee_recipient']          = $data['basic']['tax_fee_recipient'] ?? $default_settings['tax_fee_recipient'];
        $dokan_selling['shipping_tax_fee_recipient'] = $data['basic']['shipping_tax_fee_recipient'] ?? $default_settings['shipping_tax_fee_recipient'];
        $dokan_selling['order_status_change']        = $data['basic']['order_status_change'] ?? $default_settings['order_status_change'];
        $dokan_selling['new_seller_enable_selling']  = $data['basic']['new_seller_enable_selling'] ?? $default_settings['new_seller_enable_selling'];

        update_option( 'dokan_selling', $dokan_selling );
    }
}
