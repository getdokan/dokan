<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The commission setup step.
 *
 * @since 4.0.0
 */
class CommissionStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = 'commission';

    /**
     * The step priority.
     *
     * @var int
     */
	protected int $priority = 20;

    /**
     * The storage key (namespace for the completion flag).
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_commission';

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'Commission', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_field_ids(): array {
        return [
            'commission_type',
            'admin_commission',
            'reset_sub_category_when_edit_all_category',
            'commission_category_based_values',
        ];
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
}
