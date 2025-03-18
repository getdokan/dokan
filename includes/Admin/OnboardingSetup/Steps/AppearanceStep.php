<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

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
        $contact_seller = dokan_get_option( 'contact_seller', 'dokan_appearance', 'on' );
        $theme_sidebar  = dokan_get_option( 'enable_theme_store_sidebar', 'dokan_appearance', 'off' );

        $default_vendor_info = [
            'email'   => '',
            'phone'   => '',
            'address' => '',
        ];

        $vendor_info = dokan_get_option( 'hide_vendor_info', 'dokan_appearance', $default_vendor_info );

        $this->set_title( esc_html__( 'Appearance', 'dokan-lite' ) )
            ->add(
                Factory::section( 'dokan-appearance' )
                    ->set_title( esc_html__( 'Appearance', 'dokan-lite' ) )
                    ->add(
                        Factory::sub_section( 'store-info' )
                            ->set_title( esc_html__( 'Store Info', 'dokan-lite' ) )
                            ->add(
                                Factory::field( 'contact_seller', 'radio' )
                                    ->set_title( esc_html__( 'Contact Form on Store Page', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Display a contact form on vendor store pages for customer inquiries', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Hide', 'dokan-lite' ), 'off' )
                                    ->add_option( esc_html__( 'Show', 'dokan-lite' ), 'on' )
                                    ->set_default( $contact_seller )
                            )
                            ->add(
                                Factory::field( 'enable_theme_store_sidebar', 'radio' )
                                    ->set_title( esc_html__( 'Store Sidebar From Theme', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Show/hide the sidebar on vendor store pages', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Hide', 'dokan-lite' ), 'off' )
                                    ->add_option( esc_html__( 'Show', 'dokan-lite' ), 'on' )
                                    ->set_default( $theme_sidebar )
                            )
                    )
                    ->add(
                        Factory::sub_section( 'vendor-info' )
                            ->set_title( esc_html__( 'Vendor Info on Product Page', 'dokan-lite' ) )
                            ->add(
                                Factory::field( 'email', 'radio' )
                                    ->set_title( esc_html__( 'Email Address', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Hide', 'dokan-lite' ), '' )
                                    ->add_option( esc_html__( 'Show', 'dokan-lite' ), 'email' )
                                    ->set_default( $vendor_info['email'] ?? $default_vendor_info['email'] )
                            )
                            ->add(
                                Factory::field( 'phone', 'radio' )
                                    ->set_title( esc_html__( 'Phone Number', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Hide', 'dokan-lite' ), '' )
                                    ->add_option( esc_html__( 'Show', 'dokan-lite' ), 'phone' )
                                    ->set_default( $vendor_info['phone'] ?? $default_vendor_info['phone'] )
                            )
                            ->add(
                                Factory::field( 'address', 'radio' )
                                    ->set_title( esc_html__( 'Store Address', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Hide', 'dokan-lite' ), '' )
                                    ->add_option( esc_html__( 'Show', 'dokan-lite' ), 'address' )
                                    ->set_default( $vendor_info['address'] ?? $default_vendor_info['address'] )
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
