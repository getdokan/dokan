<?php
/**
 * REFERENCE ONLY — This file shows what Pro's schema filter callbacks should look like.
 * This file is NOT executed. It's a template for the Pro team.
 *
 * Pro hooks into the same filter as Lite:
 *   add_filter( 'dokan_get_admin_settings_schema', [ $this, 'append_pro_schema' ] );
 *
 * Each Pro settings class and module appends its elements with correct parent pointers
 * referencing Lite's page/subpage/section IDs.
 */

// ============================================================
// Pro Core: GeneralSettings (replaces dokan_settings_general_marketplace_*_children hooks)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    // Fields injected into Lite's General > Marketplace > marketplace_settings section
    $elements[] = [
        'id'            => 'enable_single_seller_mode',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'marketplace_settings', // Lite's section ID
        'title'         => __( 'Enable Single Seller Mode', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'         => 'store_category_mode',
        'type'       => 'field',
        'variant'    => 'radio_capsule',
        'section_id' => 'marketplace_settings',
        'title'      => __( 'Store Category', 'dokan' ),
        'default'    => 'single',
        'options'    => [
            [ 'title' => __( 'None', 'dokan' ), 'value' => 'none' ],
            [ 'title' => __( 'Single', 'dokan' ), 'value' => 'single' ],
            [ 'title' => __( 'Multiple', 'dokan' ), 'value' => 'multiple' ],
        ],
    ];
    $elements[] = [
        'id'            => 'show_customer_details_to_vendors',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'marketplace_settings',
        'title'         => __( 'Show Customer Details to Vendors', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'guest_product_enquiry',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'marketplace_settings',
        'title'         => __( 'Guest Product Enquiry', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'add_to_cart_button_visibility',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'marketplace_settings',
        'title'         => __( 'Add to Cart Button Visibility', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];

    // Live search section injected into General > Marketplace subpage
    $elements[] = [
        'id'         => 'live_search',
        'type'       => 'section',
        'subpage_id' => 'marketplace',
    ];
    $elements[] = [
        'id'         => 'live_search_base',
        'type'       => 'field',
        'variant'    => 'base_field_label',
        'section_id' => 'live_search',
        'title'      => __( 'Live Search', 'dokan' ),
    ];
    $elements[] = [
        'id'         => 'search_box_radio',
        'type'       => 'field',
        'variant'    => 'customize_radio',
        'section_id' => 'live_search',
        'title'      => __( 'Search Style', 'dokan' ),
        'default'    => 'enhanced',
        'options'    => [
            [ 'title' => __( 'Classic', 'dokan' ), 'value' => 'classic' ],
            [ 'title' => __( 'Enhanced', 'dokan' ), 'value' => 'enhanced' ],
        ],
    ];

    return $elements;
} );

// ============================================================
// Pro Core: VendorSettings (replaces dokan_settings_vendor_*_children hooks)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    // Fields injected into Lite's Vendor > Onboarding subpage
    $elements[] = [
        'id'            => 'terms_conditions',
        'type'          => 'field',
        'variant'       => 'switch',
        'subpage_id'    => 'vendor_onboarding', // Lite's subpage ID
        'title'         => __( 'Terms & Conditions', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'welcome_wizard',
        'type'          => 'field',
        'variant'       => 'switch',
        'subpage_id'    => 'vendor_onboarding',
        'title'         => __( 'Welcome Wizard', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'vendor_setup_wizard_logo',
        'type'          => 'field',
        'variant'       => 'file_upload',
        'subpage_id'    => 'vendor_onboarding',
        'title'         => __( 'Vendor Setup Wizard Logo', 'dokan' ),
        'allowed_types' => [ 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml' ],
        'max_file_size' => 2097152, // 2MB
    ];
    $elements[] = [
        'id'         => 'vendor_setup_wizard_message',
        'type'       => 'field',
        'variant'    => 'rich_text',
        'subpage_id' => 'vendor_onboarding',
        'title'      => __( 'Vendor Setup Wizard Message', 'dokan' ),
    ];

    // Fields injected into Lite's Vendor > Capabilities > vendor_capabilities section
    $elements[] = [
        'id'         => 'selling_product_type',
        'type'       => 'field',
        'variant'    => 'radio_capsule',
        'section_id' => 'vendor_capabilities', // Lite's section ID
        'title'      => __( 'Selling Product Type', 'dokan' ),
        'default'    => 'physical',
        'options'    => [
            [ 'title' => __( 'Physical', 'dokan' ), 'value' => 'physical' ],
            [ 'title' => __( 'Digital', 'dokan' ), 'value' => 'digital' ],
            [ 'title' => __( 'Both', 'dokan' ), 'value' => 'both' ],
        ],
    ];
    $elements[] = [
        'id'            => 'product_status',
        'type'          => 'field',
        'variant'       => 'radio_capsule',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'New Product Status', 'dokan' ),
        'default'       => 'published',
        'options'       => [
            [ 'title' => __( 'Published', 'dokan' ), 'value' => 'published' ],
            [ 'title' => __( 'Pending', 'dokan' ), 'value' => 'pending' ],
        ],
    ];
    $elements[] = [
        'id'            => 'duplicate_product',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Duplicate Product', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'allow_vendor_create_manual_order',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Allow Vendor to Create Manual Order', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'         => 'category_selection',
        'type'       => 'field',
        'variant'    => 'radio_capsule',
        'section_id' => 'vendor_capabilities',
        'title'      => __( 'Category Selection', 'dokan' ),
        'default'    => 'single',
        'options'    => [
            [ 'title' => __( 'Single', 'dokan' ), 'value' => 'single' ],
            [ 'title' => __( 'Multiple', 'dokan' ), 'value' => 'multiple' ],
        ],
    ];
    $elements[] = [
        'id'            => 'vendors_create_tags',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Vendors Can Create Tags', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'add_new_attribute_values',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Add New Attribute Values', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'product_review_management',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Product Review Management', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'auction_functions',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Auction Functions', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'            => 'discount_order_settings',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'vendor_capabilities',
        'title'         => __( 'Discount Settings', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'         => 'discount_settings',
        'type'       => 'field',
        'variant'    => 'multicheck',
        'section_id' => 'vendor_capabilities',
        'title'      => __( 'Discount Types', 'dokan' ),
        'default'    => [ 'order_discount', 'product_quantity_discount' ],
        'options'    => [
            [ 'title' => __( 'Order Discount', 'dokan' ), 'value' => 'order_discount' ],
            [ 'title' => __( 'Product Quantity Discount', 'dokan' ), 'value' => 'product_quantity_discount' ],
        ],
    ];

    // Social Onboarding subpage added to Vendor page
    $elements[] = [
        'id'          => 'social_onboarding',
        'type'        => 'subpage',
        'page_id'     => 'vendor',
        'title'       => __( 'Social Onboarding', 'dokan' ),
        'priority'    => 200,
    ];
    // ... social provider field groups (facebook, x, google, linkedin, apple)

    return $elements;
} );

// ============================================================
// Pro Core: WithdrawSettings (replaces dokan_settings_transaction_withdraw_charge_*_children hooks)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    // Withdraw threshold section
    $elements[] = [
        'id'         => 'withdraw_threshold_section',
        'type'       => 'section',
        'subpage_id' => 'withdraw_charge', // Lite's subpage ID
    ];
    $elements[] = [
        'id'          => 'withdraw_threshold',
        'type'        => 'field',
        'variant'     => 'number',
        'section_id'  => 'withdraw_threshold_section',
        'title'       => __( 'Withdraw Threshold', 'dokan' ),
        'default'     => '0',
        'postfix'     => __( 'Days', 'dokan' ),
    ];

    // Razorpay withdraw method
    $elements[] = [
        'id'             => 'withdraw_methods_group_razorpay',
        'type'           => 'fieldgroup',
        'section_id'     => 'section_withdraw_charge', // Lite's section ID
    ];
    $elements[] = [
        'id'             => 'razorpay_withdraw',
        'type'           => 'field',
        'variant'        => 'switch',
        'field_group_id' => 'withdraw_methods_group_razorpay',
        'title'          => __( 'Razorpay', 'dokan' ),
        'default'        => 'off',
        'image_url'      => DOKAN_PRO_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/razorpay.svg',
        'enable_state'   => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state'  => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];

    // Custom withdraw method
    $elements[] = [
        'id'         => 'withdraw_methods_group_custom',
        'type'       => 'fieldgroup',
        'section_id' => 'section_withdraw_charge',
    ];
    $elements[] = [
        'id'             => 'custom_withdraw',
        'type'           => 'field',
        'variant'        => 'switch',
        'field_group_id' => 'withdraw_methods_group_custom',
        'title'          => __( 'Custom', 'dokan' ),
        'default'        => 'on',
        'image_url'      => DOKAN_PRO_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/custom.svg',
        'enable_state'   => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state'  => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'             => 'custom_method_name',
        'type'           => 'field',
        'variant'        => 'text',
        'field_group_id' => 'withdraw_methods_group_custom',
        'title'          => __( 'Custom Method Name', 'dokan' ),
        'dependencies'   => [
            [ 'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw', 'value' => 'on', 'to_self' => true, 'attribute' => 'display', 'effect' => 'show', 'comparison' => '===' ],
        ],
    ];
    $elements[] = [
        'id'             => 'custom_method_type',
        'type'           => 'field',
        'variant'        => 'text',
        'field_group_id' => 'withdraw_methods_group_custom',
        'title'          => __( 'Custom Method Type', 'dokan' ),
        'dependencies'   => [
            [ 'key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw', 'value' => 'on', 'to_self' => true, 'attribute' => 'display', 'effect' => 'show', 'comparison' => '===' ],
        ],
    ];

    // ... schedule settings (weekly, monthly, biweekly, quarterly withdraw groups)

    return $elements;
} );

// ============================================================
// Pro Core: SocialSettings (replaces dokan_settings_appearance_children hook)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    // Storefront Social Onboarding subpage added to Appearance page
    $elements[] = [
        'id'       => 'storefont_social_onboarding',
        'type'     => 'subpage',
        'page_id'  => 'appearance', // Lite's page ID
        'title'    => __( 'Storefront Social Login', 'dokan' ),
        'priority' => 400,
    ];
    $elements[] = [
        'id'         => 'storefont_social_onboarding_section',
        'type'       => 'section',
        'subpage_id' => 'storefont_social_onboarding',
    ];
    $elements[] = [
        'id'            => 'social_login',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'storefont_social_onboarding_section',
        'title'         => __( 'Social Login', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];

    // Facebook API group
    $elements[] = [
        'id'           => 'facebook_api_group',
        'type'         => 'fieldgroup',
        'section_id'   => 'storefont_social_onboarding_section',
        'dependencies' => [
            [ 'key' => 'storefont_social_onboarding.storefont_social_onboarding_section.social_login', 'value' => 'on', 'to_self' => true, 'attribute' => 'display', 'effect' => 'show', 'comparison' => '===' ],
        ],
    ];
    $elements[] = [
        'id'             => 'facebook_enabled',
        'type'           => 'field',
        'variant'        => 'switch',
        'field_group_id' => 'facebook_api_group',
        'title'          => __( 'Facebook', 'dokan' ),
        'default'        => 'off',
        'image_url'      => DOKAN_PRO_PLUGIN_ASSEST . '/images/admin-settings-icons/social-onboarding/facebook.svg',
        'enable_state'   => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state'  => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'             => 'facebook_app_id',
        'type'           => 'field',
        'variant'        => 'show_hide',
        'field_group_id' => 'facebook_api_group',
        'title'          => __( 'App ID', 'dokan' ),
        'placeholder'    => __( 'Enter Facebook App ID', 'dokan' ),
    ];
    $elements[] = [
        'id'             => 'facebook_app_secret',
        'type'           => 'field',
        'variant'        => 'copy_field',
        'field_group_id' => 'facebook_api_group',
        'title'          => __( 'App Secret', 'dokan' ),
    ];
    $elements[] = [
        'id'             => 'facebook_redirect_url',
        'type'           => 'field',
        'variant'        => 'copy_field',
        'field_group_id' => 'facebook_api_group',
        'title'          => __( 'Redirect URL', 'dokan' ),
        'readonly'       => true,
    ];

    // ... same pattern for x_api_group, google_api_group, linkedin_api_group, apple_api_group

    return $elements;
} );

// ============================================================
// Pro Page: ShipmentPage (new page, not injected into Lite)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'          => 'shipment',
        'type'        => 'page',
        'title'       => __( 'Shipment', 'dokan' ),
        'icon'        => 'Truck',
        'priority'    => 800,
        'storage_key' => 'dokan_settings_shipment',
    ];
    $elements[] = [
        'id'         => 'shipment-setting-page',
        'type'       => 'subpage',
        'page_id'    => 'shipment',
        'title'      => __( 'Shipment Setting', 'dokan' ),
        'priority'   => 100,
    ];
    $elements[] = [
        'id'         => 'shipment-settings',
        'type'       => 'section',
        'subpage_id' => 'shipment-setting-page',
    ];
    $elements[] = [
        'id'            => 'allows_shipment_tracking',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'shipment-settings',
        'title'         => __( 'Allow Shipment Tracking', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    // ... 18 shipping provider switches, shipment status repeater, etc.

    return $elements;
} );

// ============================================================
// Pro Page: EmailVerificationPage
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'          => 'verification',
        'type'        => 'page',
        'title'       => __( 'Vendor Verification', 'dokan' ),
        'icon'        => 'Shield',
        'priority'    => 500,
        'storage_key' => 'dokan_verification',
    ];
    $elements[] = [
        'id'         => 'email-verification-page',
        'type'       => 'subpage',
        'page_id'    => 'verification',
        'title'      => __( 'Email Verification', 'dokan' ),
        'priority'   => 200,
    ];
    $elements[] = [
        'id'         => 'email-verification',
        'type'       => 'section',
        'subpage_id' => 'email-verification-page',
    ];
    $elements[] = [
        'id'            => 'enabled',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'email-verification',
        'title'         => __( 'Email Verification', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'         => 'registration-notice',
        'type'       => 'section',
        'subpage_id' => 'email-verification-page',
    ];
    $elements[] = [
        'id'         => 'registration_notice',
        'type'       => 'field',
        'variant'    => 'textarea',
        'section_id' => 'registration-notice',
        'title'      => __( 'Registration Notice', 'dokan' ),
        'default'    => __( 'Please check your email and complete email verification to login.', 'dokan' ),
    ];
    $elements[] = [
        'id'         => 'login-notice',
        'type'       => 'section',
        'subpage_id' => 'email-verification-page',
    ];
    $elements[] = [
        'id'         => 'login_notice',
        'type'       => 'field',
        'variant'    => 'textarea',
        'section_id' => 'login-notice',
        'title'      => __( 'Login Notice', 'dokan' ),
        'default'    => __( 'Please check your email and complete email verification to login.', 'dokan' ),
    ];

    return $elements;
} );

// ============================================================
// Pro Module: Germanized (replaces dokan_settings_compliance_children hook)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'       => 'eu_compliance',
        'type'     => 'subpage',
        'page_id'  => 'compliance', // Lite's page ID
        'title'    => __( 'EU Compliance', 'dokan' ),
        'priority' => 200,
    ];
    $elements[] = [
        'id'         => 'eu_compliance_settings',
        'type'       => 'section',
        'subpage_id' => 'eu_compliance',
    ];
    $elements[] = [
        'id'            => 'eu_vendor_registration_display',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'eu_compliance_settings',
        'title'         => __( 'EU Vendor Registration', 'dokan' ),
        'default'       => 'off',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    $elements[] = [
        'id'         => 'vendor_extra_fields',
        'type'       => 'field',
        'variant'    => 'multicheck',
        'section_id' => 'eu_compliance_settings',
        'title'      => __( 'Vendor Extra Fields', 'dokan' ),
        'default'    => [ 'company_name' ],
        'options'    => [
            [ 'title' => __( 'Company Name', 'dokan' ), 'value' => 'company_name' ],
            [ 'title' => __( 'VAT Number', 'dokan' ), 'value' => 'vat_number' ],
            [ 'title' => __( 'Business Registration Number', 'dokan' ), 'value' => 'business_registration_number' ],
            [ 'title' => __( 'Tax ID', 'dokan' ), 'value' => 'tax_id' ],
            [ 'title' => __( 'EU Business Address', 'dokan' ), 'value' => 'eu_business_address' ],
        ],
    ];
    // ... customer_extra_fields, germanized_support_vendors, vendor_invoice_number_override

    return $elements;
} );

// ============================================================
// Pro Module: Product Advertisement (replaces dokan_settings_product_children hook)
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'       => 'product_advertisement',
        'type'     => 'subpage',
        'page_id'  => 'product', // Lite's shell page
        'title'    => __( 'Product Advertisement', 'dokan' ),
        'priority' => 100,
    ];
    $elements[] = [
        'id'         => 'product_advertisement_section',
        'type'       => 'section',
        'subpage_id' => 'product_advertisement',
    ];
    $elements[] = [
        'id'          => 'advertisement_available_slots',
        'type'        => 'field',
        'variant'     => 'number',
        'section_id'  => 'product_advertisement_section',
        'title'       => __( 'Available Slots', 'dokan' ),
        'default'     => -1,
    ];
    $elements[] = [
        'id'          => 'advertisement_expire_days',
        'type'        => 'field',
        'variant'     => 'number',
        'section_id'  => 'product_advertisement_section',
        'title'       => __( 'Expire After Days', 'dokan' ),
        'default'     => -1,
    ];
    $elements[] = [
        'id'          => 'advertisement_cost_usd',
        'type'        => 'field',
        'variant'     => 'number',
        'section_id'  => 'product_advertisement_section',
        'title'       => __( 'Advertisement Cost', 'dokan' ),
        'default'     => 0,
    ];
    $elements[] = [
        'id'            => 'vendor_can_purchase_advertisement',
        'type'          => 'field',
        'variant'       => 'switch',
        'section_id'    => 'product_advertisement_section',
        'title'         => __( 'Vendor Can Purchase Advertisement', 'dokan' ),
        'default'       => 'on',
        'enable_state'  => [ 'label' => __( 'Enabled', 'dokan' ), 'value' => 'on' ],
        'disable_state' => [ 'label' => __( 'Disabled', 'dokan' ), 'value' => 'off' ],
    ];
    // ... advertisement_in_subscription, mark_advertised_as_featured, display_advertised_on_top, out_of_stock_visibility

    return $elements;
} );

// ============================================================
// Pro Module: Delivery Time (replaces dokan_settings_shipment_children hook)
// Uses custom field type: delivery_days
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'       => 'dashboard-delivery-days-page',
        'type'     => 'subpage',
        'page_id'  => 'shipment', // Pro's shipment page
        'title'    => __( 'Delivery Time', 'dokan' ),
        'priority' => 200,
    ];
    // ... delivery time settings + delivery_days_schedule (custom field type)

    return $elements;
} );

// ============================================================
// Pro Module: Color Scheme Customizer (replaces dokan_settings_appearance_children hook)
// Uses custom field type: color_customizer
// ============================================================
add_filter( 'dokan_get_admin_settings_schema', function ( array $elements ): array {
    $elements[] = [
        'id'       => 'dashboard-color-customizer-page',
        'type'     => 'subpage',
        'page_id'  => 'appearance', // Lite's page
        'title'    => __( 'Dashboard Color Customizer', 'dokan' ),
        'priority' => 200,
    ];
    $elements[] = [
        'id'         => 'dokan-store-colors',
        'type'       => 'section',
        'subpage_id' => 'dashboard-color-customizer-page',
    ];
    $elements[] = [
        'id'         => 'dashboard_color_customizer',
        'type'       => 'field',
        'variant'    => 'color_customizer', // Pro custom field type
        'section_id' => 'dokan-store-colors',
        'title'      => __( 'Dashboard Colors', 'dokan' ),
    ];

    return $elements;
} );
