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
        $this->set_title( __( 'Appearance', 'dokan-lite' ) )
            ->add(
                ComponentFactory::section( 'appearance' )
                    ->set_title( __( 'Appearance', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'contact-form-heading' )
                    ->set_title( __( 'Contact Form on Store Page', 'dokan-lite' ) )
                    ->set_description( __( 'Display a contact form on vendor store pages for customer inquiries', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'store-sidebar-heading' )
                    ->set_title( __( 'Store Sidebar From Theme', 'dokan-lite' ) )
                    ->set_description( __( 'Show/hide the sidebar on vendor store pages', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'email-address-heading' )
                    ->set_title( __( 'Email Address', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'Phone Number-heading' )
                    ->set_title( __( 'Phone Number', 'dokan-lite' ) )
            )
            ->add(
                ComponentFactory::sub_section( 'store-address-heading' )
                    ->set_title( __( 'Store Address', 'dokan-lite' ) )
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
