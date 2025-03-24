<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

class BasicStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string The step ID.
     */
    protected $id = 'basic';

    /**
     * The step priority.
     *
     * @var int The step priority.
     */
    protected int $priority = 1;

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_basic';

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
            ->set_title( __( 'Basic', 'dokan-lite' ) )
            ->add(
                Factory::section( 'basic' )
                    ->set_title( __( 'Basic Settings', 'dokan-lite' ) )
                    ->add(
                        Factory::field( 'shipping-fee-recipient' )
                            ->set_title( __( 'Shipping Fee Recipient', 'dokan-lite' ) )
                            ->set_description( __( 'Choose who receives shipping charges - Admin keeps all shipping fees or Vendors receive fees for their products', 'dokan-lite' ) )
                    )->add(
                        Factory::field( 'product-tax-fee' )
                            ->set_title( __( 'Product Tax Fee Recipient', 'dokan-lite' ) )
                            ->set_description( __( 'Determine who collects product taxes - Admin manages all tax collection or Vendors handle their product taxes', 'dokan-lite' ) )
                    )
                    ->add(
                        Factory::field( 'shipping-tax-fee' )
                            ->set_title( __( 'Shipping Tax Fee Recipient', 'dokan-lite' ) )
                            ->set_description( __( 'Select who receives shipping tax - Admin centralizes all shipping tax or Vendors collect shipping tax for their orders', 'dokan-lite' ) )
                    )
                    ->add(
                        Factory::field( 'can-update-status', 'radio' )
                            ->set_title( __( 'Vendors can change order status', 'dokan-lite' ) )
                            ->set_description( __( 'Allow vendors to update order statuses (processing, completed, etc.) for their products', 'dokan-lite' ) )
                    )
                    ->add(
                        Factory::field( 'can-selling-directly', 'radio' )
                            ->set_title( __( 'New Vendor Selling Directly', 'dokan-lite' ) )
                            ->set_description( __( 'Automatically enable selling capabilities for newly registered vendors', 'dokan-lite' ) )
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
