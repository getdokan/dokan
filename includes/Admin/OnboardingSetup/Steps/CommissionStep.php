<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

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

        $this
            ->set_title( esc_html__( 'Commission', 'dokan-lite' ) )
            ->add(
                Factory::section( 'commission' )
                    ->set_title( esc_html__( 'Commission', 'dokan-lite' ) )
                    ->add(
                        Factory::field( 'commission_type', 'select' )
                            ->set_title( esc_html__( 'Commission Type', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select a commission type for your marketplace', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Fixed', 'dokan-lite' ), 'fixed' )
                            ->add_option( esc_html__( 'Category Based', 'dokan-lite' ), 'category_based' )
                            ->set_default( $default_settings['commission_type'] )
                            ->set_value( $dokan_selling['commission_type'] ?? $default_settings['commission_type'] )
                    )
                    ->add(
                        Factory::field( 'admin_commission', 'combine_input' )
                            ->set_title( __( 'Admin Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'show', '===' )
                            ->set_admin_percentage( $dokan_selling['admin_percentage'] ?? $default_settings['admin_percentage'] )
                            ->set_additional_fee( $dokan_selling['additional_fee'] ?? $default_settings['additional_fee'] )
                            ->set_value(
                                [
                                    'additional_fee'   => $dokan_selling['additional_fee'] ?? $default_settings['additional_fee'],
                                    'admin_percentage' => $dokan_selling['admin_percentage'] ?? $default_settings['admin_percentage'],
                                ]
                            )
                    )
                    ->add(
                        Factory::field( 'reset_sub_category_when_edit_all_category', 'switch' )
                            ->set_title( __( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ) )
                            ->set_description( esc_html__( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                            ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( $default_settings['reset_sub_category_when_edit_all_category'] )
                            ->set_value( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'] )
                    )
                    ->add(
                        Factory::field( 'commission_category_based_values', 'category_based_commission' )
                            ->set_title( esc_html__( 'Admin Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Amount you will get from each sale', 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                            ->add_dependency( 'commission.reset_sub_category_when_edit_all_category', 'on', true, 'custom', 'custom', '===' )
                            ->add_dependency( 'commission.reset_sub_category_when_edit_all_category', 'off', true, 'custom', 'custom', '===' )
                            ->set_reset_subcategory( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'] )
                            ->set_value( (array) ( $dokan_selling['commission_category_based_values'] ?? $default_settings['commission_category_based_values'] ) )
                    )
            );
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
