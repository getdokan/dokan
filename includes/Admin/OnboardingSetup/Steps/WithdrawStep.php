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
                    ->add(
                        ComponentFactory::field( 'bank-transfer', 'radio' )
                                        ->set_title( __( 'Enable Bank Transfer', 'dokan-lite' ) )
                                        ->set_description( __( 'Allow vendors to withdraw their earnings via bank transfer', 'dokan-lite' ) )
                    )
                    ->add(
                        ComponentFactory::field( 'bank-transfer-heading', 'radio' )
                                        ->set_title( __( 'Bank Transfer', 'dokan-lite' ) )
                                        ->set_description( __( 'Enable Bank Transfer for your vendor as a withdraw method', 'dokan-lite' ) )
                    )
                    ->add(
                        ComponentFactory::field( 'skrill-heading', 'radio' )
                                        ->set_title( __( 'Skrill', 'dokan-lite' ) )
                                        ->set_description( __( 'Enable Skrill for your vendor as a withdraw method', 'dokan-lite' ) )
                    )
                    ->add(
                        ComponentFactory::field( 'minimum-withdraw-limits-heading', 'currency_input' )
                                        ->set_title( __( 'Minimum Withdraw Limits', 'dokan-lite' ) )
                                        ->set_description( __( 'Set the minimum balance required before vendors can request withdrawals', 'dokan-lite' ) )
                    )
                    ->add(
                        ComponentFactory::field( 'withdraw-order-status-heading', 'select' )
                                        ->set_options(
                                            [
                                                [
                                                    'value' => 'wc-completed',
                                                    'title' => __( 'Completed', 'dokan-lite' ),
                                                ],
                                                [
                                                    'value' => 'wc-processing',
                                                    'title' => __( 'Processing', 'dokan-lite' ),
                                                ],
                                                [
                                                    'value' => 'wc-on-hold',
                                                    'title' => __( 'On Hold', 'dokan-lite' ),
                                                ],
                                                [
                                                    'value' => 'wc-cancelled',
                                                    'title' => __( 'Cancelled', 'dokan-lite' ),
                                                ],
                                            ]
                                        )
                                        ->set_title( __( 'Order Status for Withdraw', 'dokan-lite' ) )
                                        ->set_description( __( 'Define which order status makes funds eligible for withdrawal', 'dokan-lite' ) )
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
        parent::option_dispatcher( $data );
        // TODO: Implement option_dispatcher() method.
    }
}
