<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\ProductCategory\Categories;

class CommissionStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'commission';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
	protected int $priority = 20;

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
    protected $storage_key = 'dokan_admin_onboarding_setup_step_commission';

    /**
     * Get default commission settings
     *
     * @since 4.0.0
     *
     * @return array Default commission settings
     */
    protected function get_default_settings(): array {
		/**
		 * Filter the default settings for the commission step in the onboarding setup.
		 *
		 * @since 4.0.0
		 *
		 * @param array $default_settings The default settings for the commission step.
		 *
		 * @return array Filtered default settings.
		 */
		return apply_filters(
            'dokan_admin_setup_guides_commission_step_default_data',
            [
				'additional_fee'                            => '10',
				'commission_type'                           => 'fixed',
				'admin_percentage'                          => '10',
				'reset_sub_category_when_edit_all_category' => 'on',
				'commission_category_based_values'          => [
					'items' => [],
					'all'   => [
						'flat'       => '',
						'percentage' => '',
					],
				],
			]
		);
    }

    /**
     * @inheritDoc
     */
    public function register(): void {
        wp_localize_script(
            'dokan-admin-dashboard',
            'adminWithdrawData',
            [ 'currency' => dokan_get_container()->get( 'scripts' )->get_localized_price() ],
        );
    }

    /**
     * @inheritDoc
     */
    public function scripts(): array {
        return [ 'dokan-fontawesome', 'dokan-accounting' ];
    }

    /**
     * @inheritDoc
     */
    public function styles(): array {
        return [ 'dokan-fontawesome' ];
    }

    /**
     * @inheritDoc
     */
    public function describe_settings(): void {
        $default_settings = $this->get_default_settings();
        $dokan_selling    = get_option( 'dokan_selling', $default_settings );

        $this->set_title( esc_html__( 'Commission', 'dokan-lite' ) );

		// Build product category map (matches legacy setup-guide payload shape).
		$categories = ( new Categories() )->get();

        // Commission Type field
        $commission_type_field = FieldFactory::select(
            'commission_type',
            esc_html__( 'Commission Type', 'dokan-lite' ),
            [
                [
					'value' => 'fixed',
					'label' => esc_html__( 'Fixed', 'dokan-lite' ),
				],
                [
					'value' => 'category_based',
					'label' => esc_html__( 'Category Based', 'dokan-lite' ),
				],
            ],
            [
                'description' => esc_html__( 'Select a commission type for your marketplace', 'dokan-lite' ),
                'default'     => $default_settings['commission_type'],
                'value'       => $dokan_selling['commission_type'] ?? $default_settings['commission_type'],
            ]
        );

        // Admin Commission (combine_input) field
        $admin_commission_field = FieldFactory::create(
			[
				'id'          => 'admin_commission',
				'type'        => 'field',
				'variant'     => 'combine_input',
				'title'       => esc_html__( 'Admin Commission', 'dokan-lite' ),
				'description' => esc_html__( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ),
				'default'     => [
					'additional_fee'   => $default_settings['additional_fee'],
					'admin_percentage' => $default_settings['admin_percentage'],
				],
				'value'       => [
					'additional_fee'   => $dokan_selling['additional_fee'] ?? $default_settings['additional_fee'],
					'admin_percentage' => $dokan_selling['admin_percentage'] ?? $default_settings['admin_percentage'],
				],
				'inputs'      => [
					[
						'id'      => 'admin_percentage',
						'label'   => esc_html__( 'Percentage', 'dokan-lite' ),
						'type'    => 'number',
						'postfix' => '%',
						'default' => $default_settings['admin_percentage'],
					],
					[
						'id'      => 'additional_fee',
						'label'   => esc_html__( 'Fixed Fee', 'dokan-lite' ),
						'type'    => 'number',
						'prefix'  => get_woocommerce_currency_symbol(),
						'default' => $default_settings['additional_fee'],
					],
				],
				'dependencies' => [
					[
						'field'    => 'commission.commission_type',
						'value'    => 'fixed',
						'operator' => '===',
					],
				],
			]
		);

        // Reset Subcategory field
        $reset_subcategory_field = FieldFactory::toggle(
            'reset_sub_category_when_edit_all_category',
            esc_html__( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ),
            [
                'description'   => esc_html__( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ),
                'default'       => $default_settings['reset_sub_category_when_edit_all_category'] === 'on',
                'value'         => ( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'] ) === 'on',
                'enable_state'  => [
					'value' => 'on',
					'title' => esc_html__( 'Enabled', 'dokan-lite' ),
				],
                'disable_state' => [
					'value' => 'off',
					'title' => esc_html__( 'Disabled', 'dokan-lite' ),
				],
                'dependencies'  => [
                    [
                        'field'    => 'commission.commission_type',
                        'value'    => 'category_based',
                        'operator' => '===',
                    ],
                ],
            ]
        );

        // Category Based Commission field (custom field type)
        $category_based_field = FieldFactory::create(
			[
				'id'               => 'commission_category_based_values',
				'type'             => 'field',
				'variant'          => 'category_based_commission',
				'title'            => esc_html__( 'Admin Commission', 'dokan-lite' ),
				'description'      => esc_html__( 'Amount you will get from each sale', 'dokan-lite' ),
				'default'          => $default_settings['commission_category_based_values'],
				'value'            => $dokan_selling['commission_category_based_values'] ?? $default_settings['commission_category_based_values'],
				'categories'       => $categories,
				'reset_subcategory' => $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'],
				'dependencies'     => [
					[
						'field'    => 'commission.commission_type',
						'value'    => 'category_based',
						'operator' => '===',
					],
					// Keep legacy "custom" dependencies (frontend behavior parity).
					[
						'key'        => 'commission.reset_sub_category_when_edit_all_category',
						'value'      => 'on',
						'to_self'    => true,
						'attribute'  => 'custom',
						'effect'     => 'custom',
						'comparison' => '===',
					],
					[
						'key'        => 'commission.reset_sub_category_when_edit_all_category',
						'value'      => 'off',
						'to_self'    => true,
						'attribute'  => 'custom',
						'effect'     => 'custom',
						'comparison' => '===',
					],
				],
			]
		);

        // Create section with all fields
        $section = FieldFactory::section(
            'commission',
            esc_html__( 'Commission', 'dokan-lite' ),
            [
                $commission_type_field,
                $admin_commission_field,
                $reset_subcategory_field,
                $category_based_field,
            ]
        );

        $this->add_field_factory_element( $section );
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

        $dokan_selling['additional_fee']                            = $data['commission']['admin_commission']['additional_fee'] ?? $default_settings['additional_fee'];
        $dokan_selling['commission_type']                           = $data['commission']['commission_type'] ?? $default_settings['commission_type'];
        $dokan_selling['admin_percentage']                          = $data['commission']['admin_commission']['admin_percentage'] ?? $default_settings['admin_percentage'];
        $dokan_selling['commission_category_based_values']          = $data['commission']['commission_category_based_values'] ?? $default_settings['commission_category_based_values'];
        $dokan_selling['reset_sub_category_when_edit_all_category'] = $data['commission']['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'];

        update_option( 'dokan_selling', $dokan_selling );
    }
}
