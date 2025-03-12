<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory;

class WithdrawStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'withdraw';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
    protected int $priority = 30;

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_withdraw';

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
            ->set_title( __( 'Withdraw', 'dokan-lite' ) )
            ->add(
                ComponentFactory::section( 'withdraw' )
                    ->set_title( __( 'Withdraw', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'paypal-heading' )
                    ->set_title( __( 'Paypal', 'dokan-lite' ) )
                    ->set_description( __( 'Enable PayPal for your vendor as a withdraw method', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'bank-transfer-heading' )
                    ->set_title( __( 'Bank Transfer', 'dokan-lite' ) )
                    ->set_description( __( 'Enable Bank Transfer for your vendor as a withdraw method', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'skrill-heading' )
                    ->set_title( __( 'Skrill', 'dokan-lite' ) )
                    ->set_description( __( 'Enable Skrill for your vendor as a withdraw method', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'minimum-withdraw-limits-heading' )
                    ->set_title( __( 'Minimum Withdraw Limits', 'dokan-lite' ) )
                    ->set_description( __( 'Set the minimum balance required before vendors can request withdrawals', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'withdraw-order-status-heading' )
                    ->set_title( __( 'Order Status for Withdraw', 'dokan-lite' ) )
                    ->set_description( __( 'Define which order status makes funds eligible for withdrawal', 'dokan-lite' ) )
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
