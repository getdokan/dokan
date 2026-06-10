<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The withdraw setup step.
 *
 * @since 4.0.0
 */
class WithdrawStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = 'withdraw';

    /**
     * The step priority.
     *
     * @var int
     */
    protected int $priority = 30;

    /**
     * The storage key (namespace for the completion flag).
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_withdraw';

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'Withdraw', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     *
     * Pro-registered withdraw methods (Razorpay, Custom, ...) are intentionally
     * not listed — the wizard exposes the core methods. Any id absent from the
     * active schema is skipped by {@see AbstractStep::populate()}.
     */
    public function get_field_ids(): array {
        return [
            'paypal_withdraw',
            'bank_transfer_withdraw',
            'minimum_withdraw_limit',
            'withdraw_order_status',
        ];
    }

    /**
     * @inheritDoc
     */
    public function register(): void {
        $data = [
            'currency' => dokan_get_container()->get( 'scripts' )->get_localized_price(),
        ];

        wp_localize_script(
            'dokan-admin-dashboard',
            'dokanWithdrawDashboard',
            $data,
        );
    }

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
}
