<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

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
    protected int $priority = 40;

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
        $this->set_title( __( 'Appearance', 'dokan-lite' ) );
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
