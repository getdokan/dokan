<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The appearance setup step.
 *
 * @since 4.0.0
 */
class AppearanceStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = 'appearance';

    /**
     * The step priority.
     *
     * @var int
     */
    protected int $priority = 40;

    /**
     * The storage key (namespace for the completion flag).
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_appearance';

    /**
     * @inheritDoc
     */
    public function get_title(): string {
        return esc_html__( 'Appearance', 'dokan-lite' );
    }

    /**
     * @inheritDoc
     *
     * The legacy per-field "hide vendor info" toggles (email/phone/address)
     * collapse into the single `store_page_vendor_info_visibility` multicheck;
     * the settings legacy bridge maps it back to `dokan_appearance.hide_vendor_info`.
     */
    public function get_field_ids(): array {
        return [
            'store_contact_form_enabled',
            'store_sidebar_from_theme',
            'store_page_vendor_info_visibility',
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
