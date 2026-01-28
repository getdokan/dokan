<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\FieldFactory\FieldFactory;

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
     * The settings options.
     *
     * @var array The settings options.
     */
    protected $settings_options = [ 'dokan_appearance' ];

    /**
     * The storage key.
     *
     * @var string The storage key.
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_appearance';

    /**
     * Get default appearance settings
     *
     * @since 4.0.0
     *
     * @return array Default appearance settings
     */
    protected function get_default_settings(): array {
        /**
         * Filters the default appearance settings for the setup guide.
         * Allows modification of the default appearance settings including
         * contact seller status, theme store sidebar, and vendor info visibility.
         *
         * @since 4.0.0
         *
         * @param array $defaults Array of default appearance settings with the following structure:
         *
         * @return array Modified default appearance settings.
         */
        return apply_filters(
            'dokan_admin_setup_guides_appearance_step_default_data',
            [
                'contact_seller'             => 'on',
                'enable_theme_store_sidebar' => 'off',
                'hide_vendor_info'           => [
                    'email'   => '',
                    'phone'   => '',
                    'address' => '',
                ],
            ]
        );
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

	/**
	 * @inheritDoc
	 */
	public function describe_settings(): void {
        $default_settings = $this->get_default_settings();
        $dokan_appearance = get_option( 'dokan_appearance', $default_settings );

        $this->set_title( esc_html__( 'Appearance', 'dokan-lite' ) );

        // Store Info subsection fields
        $contact_seller_field = FieldFactory::radio(
            'contact_seller',
            esc_html__( 'Contact Form on Store Page', 'dokan-lite' ),
            [
                [ 'value' => 'off', 'label' => esc_html__( 'Hide', 'dokan-lite' ) ],
                [ 'value' => 'on', 'label' => esc_html__( 'Show', 'dokan-lite' ) ],
            ],
            [
                'description' => esc_html__( 'Display a contact form on vendor store pages for customer inquiries', 'dokan-lite' ),
                'default'     => $default_settings['contact_seller'],
                'value'       => $dokan_appearance['contact_seller'] ?? $default_settings['contact_seller'],
            ]
        );

        $store_sidebar_field = FieldFactory::radio(
            'enable_theme_store_sidebar',
            esc_html__( 'Store Sidebar From Theme', 'dokan-lite' ),
            [
                [ 'value' => 'off', 'label' => esc_html__( 'Hide', 'dokan-lite' ) ],
                [ 'value' => 'on', 'label' => esc_html__( 'Show', 'dokan-lite' ) ],
            ],
            [
                'description' => esc_html__( 'Show/hide the sidebar on vendor store pages', 'dokan-lite' ),
                'default'     => $default_settings['enable_theme_store_sidebar'],
                'value'       => $dokan_appearance['enable_theme_store_sidebar'] ?? $default_settings['enable_theme_store_sidebar'],
            ]
        );

        // Vendor Info subsection fields
        $email_field = FieldFactory::radio(
            'email',
            esc_html__( 'Email Address', 'dokan-lite' ),
            [
                [ 'value' => '', 'label' => esc_html__( 'Hide', 'dokan-lite' ) ],
                [ 'value' => 'email', 'label' => esc_html__( 'Show', 'dokan-lite' ) ],
            ],
            [
                'default' => $default_settings['hide_vendor_info']['email'],
                'value'   => $dokan_appearance['hide_vendor_info']['email'] ?? $default_settings['hide_vendor_info']['email'],
            ]
        );

        $phone_field = FieldFactory::radio(
            'phone',
            esc_html__( 'Phone Number', 'dokan-lite' ),
            [
                [ 'value' => '', 'label' => esc_html__( 'Hide', 'dokan-lite' ) ],
                [ 'value' => 'phone', 'label' => esc_html__( 'Show', 'dokan-lite' ) ],
            ],
            [
                'default' => $default_settings['hide_vendor_info']['phone'],
                'value'   => $dokan_appearance['hide_vendor_info']['phone'] ?? $default_settings['hide_vendor_info']['phone'],
            ]
        );

        $address_field = FieldFactory::radio(
            'address',
            esc_html__( 'Store Address', 'dokan-lite' ),
            [
                [ 'value' => '', 'label' => esc_html__( 'Hide', 'dokan-lite' ) ],
                [ 'value' => 'address', 'label' => esc_html__( 'Show', 'dokan-lite' ) ],
            ],
            [
                'default' => $default_settings['hide_vendor_info']['address'],
                'value'   => $dokan_appearance['hide_vendor_info']['address'] ?? $default_settings['hide_vendor_info']['address'],
            ]
        );

        // Create subsections
        $store_info_subsection = FieldFactory::create( [
            'id'       => 'store-info',
            'type'     => 'subsection',
            'title'    => esc_html__( 'Store Info', 'dokan-lite' ),
            'children' => [
                $contact_seller_field,
                $store_sidebar_field,
            ],
        ] );

        $vendor_info_subsection = FieldFactory::create( [
            'id'       => 'vendor-info',
            'type'     => 'subsection',
            'title'    => esc_html__( 'Vendor Info on Product Page', 'dokan-lite' ),
            'children' => [
                $email_field,
                $phone_field,
                $address_field,
            ],
        ] );

        // Create main section
        $section = FieldFactory::section(
            'appearance',
            esc_html__( 'Appearance', 'dokan-lite' ),
            [
                $store_info_subsection,
                $vendor_info_subsection,
            ]
        );

        $this->add_field_factory_element( $section );
    }

    /**
     * @inheritDoc
     */
	public function settings(): array {
		return [];
	}

    /**
     * @inheritDoc
     */
    public function option_dispatcher( $data ): void {
        $default_settings = $this->get_default_settings();
        $dokan_appearance = get_option( 'dokan_appearance', $default_settings );

        $dokan_appearance['contact_seller']              = $data['appearance']['store-info']['contact_seller'] ?? $default_settings['contact_seller'];
        $dokan_appearance['enable_theme_store_sidebar']  = $data['appearance']['store-info']['enable_theme_store_sidebar'] ?? $default_settings['enable_theme_store_sidebar'];
        $dokan_appearance['hide_vendor_info']['email']   = $data['appearance']['vendor-info']['email'] ?? $default_settings['hide_vendor_info']['email'];
        $dokan_appearance['hide_vendor_info']['phone']   = $data['appearance']['vendor-info']['phone'] ?? $default_settings['hide_vendor_info']['phone'];
        $dokan_appearance['hide_vendor_info']['address'] = $data['appearance']['vendor-info']['address'] ?? $default_settings['hide_vendor_info']['address'];

        update_option( 'dokan_appearance', $dokan_appearance );
    }
}
