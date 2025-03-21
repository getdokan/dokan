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
    protected int $priority = 10;

    protected $settings_options = [ 'dokan_selling' ];

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_commission';

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

	public function styles(): array {
		return [ 'dokan-fontawesome' ];
	}

	/**
	 * @inheritDoc
	 */
	public function describe_settings(): void {
        $default_selling = [
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
        ];

        $dokan_selling = get_option( 'dokan_selling', $default_selling );

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
                            ->set_default( $default_selling['commission_type'] )
                            ->set_value( $dokan_selling['commission_type'] )
                    )
                    ->add(
                        Factory::field( 'admin_commission', 'combine_input' )
                            ->set_title( __( 'Admin Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                            ->set_percentage( $dokan_selling['admin_percentage'] )
                            ->set_fixed( $dokan_selling['additional_fee'] )
                    )
                    ->add(
                        Factory::field( 'reset_sub_category_when_edit_all_category', 'switch' )
                            ->set_title( __( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ) )
                            ->set_description( esc_html__( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ) )
                            ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( $default_selling['reset_sub_category_when_edit_all_category'] )
                            ->set_value( $dokan_selling['reset_sub_category_when_edit_all_category'] )
                    )
                    ->add(
                        Factory::field( 'commission_category_based_values', 'category_based_commission' )
                            ->set_title( esc_html__( 'Admin Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Amount you will get from each sale', 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'show', '===' )
                            ->set_reset_subcategory( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_selling['reset_sub_category_when_edit_all_category'] )
                            ->set_commission( (array) $dokan_selling['commission_category_based_values'] )
                    )
            );
    }

	public function settings(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        // TODO: Implement option_dispatcher() method.
        //        $commission_type = isset( $data['commission']['commission_type'] ) ? sanitize_text_field( $data['commission']['commission_type'] ) : 'fixed';
        //        update_option( 'dokan_commission_type', $commission_type );
        //
        //        if ( $commission_type === 'fixed' ) {
        //            $fixed_commission = isset( $data['commission']['fixed_commission'] ) ? $data['commission']['fixed_commission'] : [];
        //            $admin_percentage = isset( $fixed_commission['percentage'] ) ? floatval( $fixed_commission['percentage'] ) : 10;
        //            $additional_fee   = isset( $fixed_commission['fixed'] ) ? floatval( $fixed_commission['fixed'] ) : 0;
        //
        //            update_option('dokan_admin_percentage', $admin_percentage);
        //            update_option('dokan_additional_fee', $additional_fee);
        //        } else {
        //            $category_commission = isset( $data['commission']['category_commission'] ) ? $data['commission']['category_commission'] : [];
        //            $reset_subcategory = isset( $data['commission']['reset_subcategory'] ) ? (bool) $data['commission']['reset_subcategory'] : true;
        //
        //            update_option('dokan_commission_category_based_values', $category_commission);
        //            update_option('dokan_reset_sub_category', $reset_subcategory);
        //        }
    }
}
