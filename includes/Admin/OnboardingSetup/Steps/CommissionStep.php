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
        $commission_type = dokan_get_option( 'commission_type', 'dokan_selling', 'fixed' );

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
                            ->set_default( $commission_type )
                    )
                    ->add(
                        Factory::field( 'admin_commission', 'radio' )
                            ->set_title( __( 'Admin Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Amount you get from each sale', 'dokan-lite' ) )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                            ->set_default( 2500 )
                    )
                    ->add(
                        Factory::field( 'fixed_commission', 'radio_box' )
                            ->set_title( __( 'Fixed Commission', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Fixed you get from each sale', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Vendor', 'dokan-lite' ), 'seller' )
                            ->add_option( esc_html__( 'Admin', 'dokan-lite' ), 'admin' )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'hide', '!==' )
                            ->add_dependency( 'commission.commission_type', 'fixed', true, 'display', 'show', '===' )
                            ->set_default( 'seller' )
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
        // TODO: Implement option_dispatcher() method.
    }
}
