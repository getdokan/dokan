<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory;

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

	public function styles(): array {
		return [];
	}

	/**
	 * @inheritDoc
	 */
	public function describe_settings(): void {
        $this
            ->set_title( __( 'Commission', 'dokan-lite' ) )
            ->add(
                ComponentFactory::section( 'commission' )
                    ->set_title( __( 'Commission', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'commission-type-heading' )
                    ->set_title( __( 'Commission Type', 'dokan-lite' ) )
                    ->set_description( __( 'Select a commission type for your marketplace', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'admin-commission-heading' )
                    ->set_title( __( 'Admin Commission', 'dokan-lite' ) )
                    ->set_description( __( 'Amount you get from each sale', 'dokan-lite' ) )
            );
    }

	public function settings(): array {
		return [ 1, 2, 3 ];
	}

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        parent::option_dispatcher( $data );
        // TODO: Implement option_dispatcher() method.
    }
}
