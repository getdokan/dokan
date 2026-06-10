<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The basic setup step.
 *
 * @since 4.0.0
 */
class BasicStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = 'basic';

    /**
     * The step priority.
     *
     * @var int
     */
	protected int $priority = 10;

    /**
     * The step skippable or not.
     *
     * @var bool
     */
    protected bool $skippable = false;

    /**
     * The storage key (namespace for the completion flag).
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_basic';

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'Basic', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     */
    public function get_field_ids(): array {
        return [
            'shipping_fee_recipient',
            'product_tax_fee_recipient',
            'shipping_tax_fee_recipient',
            'vendor_can_change_order_status',
            'vendor_auto_enable_selling',
        ];
    }

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
}
