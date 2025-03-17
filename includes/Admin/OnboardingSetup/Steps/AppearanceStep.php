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
                    ->add(
                        ComponentFactory::sub_section( 'store-info' )
                                        ->set_title( __( 'Store Info', 'dokan-lite' ) )
                                        ->add(
                                            ComponentFactory::field( 'store-info', 'radio_button' )
                                                            ->set_title( __( 'Show Store Info', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store information on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'hide' )
                                        )
                                        ->add(
                                            ComponentFactory::field( 'store-info-heading', 'radio_button' )
                                                            ->set_title( __( 'Store Info Heading', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store information heading on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'show' )
                                        )
                                        ->add(
                                            ComponentFactory::field( 'store-info-description', 'radio_button' )
                                                            ->set_title( __( 'Store Info Description', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store information description on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'hide' )
                                        )
                    )
                    ->add(
                        ComponentFactory::sub_section( 'vendor-info' )
                                        ->set_title( __( 'Store Banner', 'dokan-lite' ) )
                                        ->add(
                                            ComponentFactory::field( 'store-banner', 'radio_button' )
                                                            ->set_title( __( 'Show Store Banner', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store banner on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'show' )
                                        )
                                        ->add(
                                            ComponentFactory::field( 'store-banner-heading', 'radio_button' )
                                                            ->set_title( __( 'Store Banner Heading', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store banner heading on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'hide' )
                                        )
                                        ->add(
                                            ComponentFactory::field( 'store-banner-description', 'radio_button' )
                                                            ->set_title( __( 'Store Banner Description', 'dokan-lite' ) )
                                                            ->set_description( __( 'Display store banner description on the vendor\'s store page.', 'dokan-lite' ) )
                                                            ->set_default( 'show' )
                                        )
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
