<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory;

class AppearanceStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'appearance';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
    protected int $priority = 0;

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_appearance';

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
        $this->set_title( __( 'Appearance', 'dokan-lite' ) )
            ->add(
                ComponentFactory::section( 'appearance' )
                    ->set_title( __( 'Appearance', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::field( 'store-address-heading', 'radio_button' )
                    ->set_title( __( 'Store Address', 'dokan-lite' ) )
                                ->set_description( __( 'Display the store address on vendor store pages', 'dokan-lite' ) )
            );
    }

	public function settings(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        parent::option_dispatcher( $data );
        // TODO: Implement option_dispatcher() method.
    }
}
