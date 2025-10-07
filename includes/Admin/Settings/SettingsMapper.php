<?php

namespace WeDevs\Dokan\Admin\Settings;

/**
 * Settings key Mapper.
 *
 * Maps legacy settings keys (section.field) to the new settings keys
 * (PageId.SubPageId.SectionId.FieldId) and vice-versa.
 *
 * Example mapping item:
 *   'dokan_general.custom_store_url' => 'general.marketplace.marketplace_settings.vendor_store_url'
 *
 * Notes
 * - We intentionally do not load mappings from CSV or legacy files.
 * - Use the `dokan_settings_mapper_map` filter to inject/extend mappings at runtime.
 */
class SettingsMapper {
    /**
     * Map array [ old_key => new_key ].
     *
     * Old key format:    sectionKey.fieldKey
     * New key format:    PageId.SubPageId.SectionId.FieldId
     *
     * @var array<string,string>
     */
    protected array $map = [
        // =========================
        // General > Marketplace
        // =========================
        'dokan_general.custom_store_url'                     => 'general.marketplace.marketplace_settings.vendor_store_url',
        'dokan_general.enable_single_seller_mode'            => 'general.marketplace.marketplace_settings.enable_single_seller_mode',
        // Legacy "store_category_type" renamed in new UI
        'dokan_general.store_category_type'                  => 'general.marketplace.marketplace_settings.store_category_mode',
        // Inverted meaning: hide -> show
        'dokan_selling.hide_customer_info'                   => 'general.marketplace.marketplace_settings.show_customer_details_to_vendors',
        'dokan_selling.enable_guest_user_enquiry'            => 'general.marketplace.marketplace_settings.guest_product_enquiry',
        // Inverted meaning: hide add to cart -> visibility toggle
        'dokan_selling.catalog_mode_hide_add_to_cart_button' => 'general.marketplace.marketplace_settings.add_to_cart_button_visibility',
        // Live Search
        'dokan_live_search_setting.live_search_option'       => 'general.marketplace.live_search.search_box_radio',

        // =========================
        // General > Page Setup (dokan_pages)
        // =========================
        'dokan_pages.dashboard'     => 'general.dokan_pages.dashboard_section.dashboard',
        'dokan_pages.my_orders'     => 'general.dokan_pages.my_orders_section.my_orders',
        'dokan_pages.store_listing' => 'general.dokan_pages.store_listing_section.store_listing',
        'dokan_pages.reg_tc_page'   => 'general.dokan_pages.reg_tc_page_section.reg_tc_page',

        // =========================
        // General > Location (Geolocation & Map settings)
        // =========================
        'dokan_appearance.map_api_source'                     => 'general.location.map_api_configuration.map_api_source',
        'dokan_appearance.gmap_api_key'                       => 'general.location.map_api_configuration.google_map_api_key.google_map_api_key',
        'dokan_appearance.mapbox_access_token'                => 'general.location.map_api_configuration.mapbox_api_key.mapbox_api_key',
        'dokan_geolocation.show_locations_map'                => 'general.location.map_display_settings.location_map_position',
        'dokan_geolocation.show_filters_before_locations_map' => 'general.location.map_display_settings.show_filters_before_map',
        'dokan_geolocation.distance_unit'                     => 'general.location.map_display_settings.radius_search_unit',
        'dokan_geolocation.distance_min'                      => 'general.location.map_display_settings.radius_search_min_distance',
        'dokan_geolocation.distance_max'                      => 'general.location.map_display_settings.radius_search_max_distance',
        'dokan_geolocation.map_zoom'                          => 'general.location.map_display_settings.map_zoom_level',
        // Note: Old had two separate controls for placement; new consolidates to a single multi-select
        'dokan_geolocation.show_location_map_pages'           => 'general.location.map_placement.map_placement_locations',
        'dokan_geolocation.show_product_location_in_wc_tab'   => 'general.location.map_placement.map_placement_locations',

        // =========================
        // Appearance > Store Page
        // =========================
        'dokan_general.store_products_per_page' => 'appearance.store.products_page.store_product_per_page',
        'dokan_appearance.store_header_template' => 'appearance.store.store_template.store_template',
        // Banner size combined into a double input in new UI
        'dokan_appearance.store_banner_width'  => 'appearance.store.store_banner_dimension_section.store_banner_dimension',
        'dokan_appearance.store_banner_height' => 'appearance.store.store_banner_dimension_section.store_banner_dimension',
        'dokan_appearance.store_open_close'    => 'appearance.store.store_clossing_time_widget_section.store_clossing_time_widget',
        'dokan_appearance.enable_theme_store_sidebar' => 'appearance.store.store_sidebar_section.store_opening_time',
        'dokan_appearance.hide_vendor_info'    => 'appearance.store.vendor_info_visibility_section.vendor_info_visibility',
        'dokan_appearance.disable_dokan_fontawesome' => 'appearance.store.dokan_font_section.dokan_font',
        // reCAPTCHA (split into separate fields in new UI)
        'dokan_appearance.recaptcha_enable_status' => 'appearance.store.google_recaptcha.google_recaptcha_settings.recaptcha',
        'dokan_appearance.recaptcha_site_key'      => 'appearance.store.google_recaptcha.google_recaptcha_settings.recaptcha_site_key',
        'dokan_appearance.recaptcha_secret_key'    => 'appearance.store.google_recaptcha.google_recaptcha_settings.recaptcha_secret_key',

        // =========================
        // Compliance > Privacy
        // =========================
        'dokan_privacy.enable_privacy' => 'compliance.privacy.privacy_settings.privacy_policy_display',
        'dokan_privacy.privacy_page'   => 'compliance.privacy.privacy_settings.privacy_policy_page',
        'dokan_privacy.privacy_policy' => 'compliance.privacy.privacy_policy_content.privacy_policy_content',

        // =========================
        // Compliance > EU Compliance (Germanized)
        // =========================
        'dokan_germanized.vendor_registration'   => 'compliance.eu_compliance.eu_compliance_settings.eu_vendor_registration_display',
        'dokan_germanized.vendor_fields'         => 'compliance.eu_compliance.vendor_extra_fields.vendor_extra_fields',
        'dokan_germanized.customer_fields'       => 'compliance.eu_compliance.customer_extra_fields.customer_extra_fields',
        'dokan_germanized.enabled_germanized'    => 'compliance.eu_compliance.eu_compliance_settings.germanized_support_vendors',
        'dokan_germanized.override_invoice_number' => 'compliance.eu_compliance.eu_compliance_settings.vendor_invoice_number_override',

        // =========================
        // Moderation > RMA
        // =========================
        'dokan_rma.rma_order_status'            => 'moderation.rma.rma_settings.rma_order_status',
        'dokan_rma.rma_enable_refund_request'   => 'moderation.rma.rma_settings.rma_refund_requests',
        'dokan_rma.rma_enable_coupon_request'   => 'moderation.rma.rma_settings.rma_coupon_requests',
        'dokan_rma.rma_reasons'                 => 'moderation.rma.reasons_of_rma_settings.rma_reasons',
        'dokan_rma.rma_policy'                  => 'moderation.rma.refund_policy_settings.rma_refund_policy',

        // Moderation > Live Chat
        'dokan_live_chat.enable'                => 'moderation.livechat.livechat_settings.livechat_enabled',
        'dokan_live_chat.provider'              => 'moderation.livechat.livechat_settings.livechat_provider',
        'dokan_live_chat.app_id'                => 'moderation.livechat.livechat_settings.livechat_app_id',
        'dokan_live_chat.app_secret'            => 'moderation.livechat.livechat_settings.livechat_app_secret',
        'dokan_live_chat.chat_button_seller_page'  => 'moderation.livechat.livechat_settings.livechat_vendor_page_button',
        'dokan_live_chat.chat_button_product_page' => 'moderation.livechat.livechat_settings.livechat_product_page_button',

        // Moderation > Store Support
        'dokan_store_support_setting.enabled_for_customer_order' => 'moderation.store_support.store_support_settings.store_support_order_details',
        'dokan_store_support_setting.support_button_label'       => 'moderation.store_support.store_support_settings.store_support_button_label',
        'dokan_store_support_setting.store_support_product_page' => 'moderation.store_support.store_support_settings.store_support_product_page',

        // Moderation > Report Abuse
        'dokan_report_abuse.reported_by_logged_in_users_only' => 'moderation.report_abuse.report_abuse_settings.report_abuse_reported_by',
        'dokan_report_abuse.abuse_reasons'                    => 'moderation.report_abuse.reasons_for_abuse_reports.report_abuse_reasons',

        // =========================
        // Transaction > Commissions
        // =========================
        'dokan_selling.commission_type'                        => 'transaction.commission.commission.commission_type',
        'dokan_selling.commission_fixed_values'                => 'transaction.commission.commission.admin_commission',
        'dokan_selling.reset_sub_category_when_edit_all_category' => 'transaction.commission.commission.reset_sub_category_when_edit_all_category',
        'dokan_selling.commission_category_based_values'       => 'transaction.commission.commission.commission_category_based_values',

        // Transaction > Fees
        'dokan_selling.shipping_fee_recipient'  => 'transaction.fees.fees.shipping_fee',
        'dokan_selling.tax_fee_recipient'       => 'transaction.fees.fees.product_tax_fee',
        'dokan_selling.shipping_tax_fee_recipient' => 'transaction.fees.fees.shipping_tax_fee',

        // Transaction > Withdraw
        'dokan_withdraw.withdraw_limit'         => 'transaction.withdraw_charge.section_withdraw_charge.minimum_withdraw_limit',
        'dokan_withdraw.withdraw_order_status'  => 'transaction.withdraw_charge.section_withdraw_charge.manual_withdraw',
        'dokan_withdraw.exclude_cod_payment'    => 'transaction.withdraw_charge.section_withdraw_charge.cod_payments',
        'dokan_withdraw.withdraw_date_limit'    => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_threshold',
        'dokan_withdraw.hide_withdraw_option'   => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_option_visibility',

        // Transaction > Reverse Withdrawal
        'dokan_reverse_withdrawal.enabled'                   => 'transaction.reverse_withdrawal.reverse_withdrawal_section.enabled',
        'dokan_reverse_withdrawal.billing_type'              => 'transaction.reverse_withdrawal.reverse_withdrawal_section.billing_type',
        'dokan_reverse_withdrawal.reverse_balance_threshold' => 'transaction.reverse_withdrawal.reverse_withdrawal_section.reverse_balance_threshold',
        'dokan_reverse_withdrawal.monthly_billing_day'       => 'transaction.reverse_withdrawal.reverse_withdrawal_section.monthly_billing_day',
        'dokan_reverse_withdrawal.due_period'                => 'transaction.reverse_withdrawal.reverse_withdrawal_section.due_period',
        'dokan_reverse_withdrawal.failed_actions'            => 'transaction.reverse_withdrawal.reverse_withdrawal_section.failed_actions',
        'dokan_reverse_withdrawal.display_notice'            => 'transaction.reverse_withdrawal.reverse_withdrawal_section.display_notice',
        'dokan_reverse_withdrawal.send_announcement'         => 'transaction.reverse_withdrawal.reverse_withdrawal_section.send_announcement',

        // =========================
        // Vendor > Onboarding
        // =========================
        'dokan_selling.new_seller_enable_selling' => 'vendor.vendor_onboarding.enable_selling',
        'dokan_general.enabled_address_on_reg'    => 'vendor.vendor_onboarding.address_fields',
        'dokan_general.enable_tc_on_reg'          => 'vendor.vendor_onboarding.terms_conditions',
        'dokan_general.disable_welcome_wizard'    => 'vendor.vendor_onboarding.welcome_wizard',
        'dokan_general.setup_wizard_logo_url'     => 'vendor.vendor_onboarding.vendor_setup_wizard_logo',
        'dokan_general.setup_wizard_message'      => 'vendor.vendor_onboarding.vendor_setup_wizard_message',

        // =========================
        // social onboarding
        'dokan_social_api.enabled'          => 'vendor.social_onboarding.social_onboarding.social_login',

        // Facebook
        'dokan_social_api.fb_enable_status' => 'vendor.social_onboarding.social_onboarding.facebook_api_group.facebook_enabled',
        'dokan_social_api.fb_app_id'        => 'vendor.social_onboarding.social_onboarding.facebook_api_group.facebook_app_id',
        'dokan_social_api.fb_app_secret'    => 'vendor.social_onboarding.social_onboarding.facebook_api_group.facebook_app_secret',

        // Twitter/X
        'dokan_social_api.twitter_enable_status' => 'vendor.social_onboarding.social_onboarding.x_api_group.x_enabled',
        'dokan_social_api.twitter_app_id'        => 'vendor.social_onboarding.social_onboarding.x_api_group.x_api_key',
        'dokan_social_api.twitter_app_secret'    => 'vendor.social_onboarding.social_onboarding.x_api_group.x_api_secret',

        // Google
        'dokan_social_api.google_enable_status' => 'vendor.social_onboarding.social_onboarding.google_api_group.google_enabled',
        'dokan_social_api.google_app_id'        => 'vendor.social_onboarding.social_onboarding.google_api_group.google_client_id',
        'dokan_social_api.google_app_secret'    => 'vendor.social_onboarding.social_onboarding.google_api_group.google_client_secret',

        // LinkedIn
        'dokan_social_api.linkedin_enable_status' => 'vendor.social_onboarding.social_onboarding.linkedin_api_group.linkedin_enabled',
        'dokan_social_api.linkedin_app_id'        => 'vendor.social_onboarding.social_onboarding.linkedin_api_group.linkedin_client_id',
        'dokan_social_api.linkedin_app_secret'    => 'vendor.social_onboarding.social_onboarding.linkedin_api_group.linkedin_client_secret',

        // Apple
        'dokan_social_api.apple_enable_status' => 'vendor.social_onboarding.social_onboarding.apple_api_group.apple_enabled',
        'dokan_social_api.apple_service_id'    => 'vendor.social_onboarding.social_onboarding.apple_api_group.apple_service_id',
        'dokan_social_api.apple_team_id'       => 'vendor.social_onboarding.social_onboarding.apple_api_group.apple_team_id',
        'dokan_social_api.apple_key_id'        => 'vendor.social_onboarding.social_onboarding.apple_api_group.apple_key_id',
        'dokan_social_api.apple_key_content'   => 'vendor.social_onboarding.social_onboarding.apple_api_group.apple_key_content',

        // Vendor > Capabilities
        'dokan_selling.product_status'             => 'vendor.vendor_capabilities.vendor_capabilities.product_status',
        'dokan_selling.one_step_product_create'     => 'vendor.vendor_capabilities.vendor_capabilities.one_page_creation',
        'dokan_selling.disable_product_popup'       => 'vendor.vendor_capabilities.vendor_capabilities.product_popup',
        'dokan_selling.order_status_change'         => 'vendor.vendor_capabilities.vendor_capabilities.order_status_change',
        'dokan_selling.dokan_any_category_selection' => 'vendor.vendor_capabilities.vendor_capabilities.select_any_category',
        'dokan_selling.vendor_duplicate_product'    => 'vendor.vendor_capabilities.vendor_capabilities.duplicate_product',
        'dokan_selling.product_category_style'      => 'vendor.vendor_capabilities.vendor_capabilities.category_selection',
        'dokan_selling.product_vendors_can_create_tags' => 'vendor.vendor_capabilities.vendor_capabilities.vendors_create_tags',
        'dokan_selling.add_new_attribute'           => 'vendor.vendor_capabilities.vendor_capabilities.add_new_attribute_values',
        'dokan_selling.seller_review_manage'        => 'vendor.vendor_capabilities.vendor_capabilities.product_review_management',
        'dokan_general.global_digital_mode'         => 'vendor.vendor_capabilities.vendor_capabilities.global_digital_mode',
        'dokan_selling.allow_vendor_create_manual_order' => 'vendor.vendor_capabilities.vendor_capabilities.allow_vendor_create_manual_order',
        'dokan_selling.new_seller_enable_auction'   => 'vendor.vendor_capabilities.vendor_capabilities.auction_functions',

        // Vendor > Discount Settings
        'dokan_selling.discount_edit'              => 'vendor.vendor_capabilities.vendor_capabilities.discount_settings',

        // Vendor > Subscription
        'dokan_product_subscription.enable_pricing'              => 'vendor.vendor_subscription.vendor_subscription.vendor_subscription',
        'dokan_product_subscription.subscription_pack'           => 'vendor.vendor_subscription.vendor_subscription.subscription_view_page',
        'dokan_product_subscription.enable_subscription_pack_in_reg' => 'vendor.vendor_subscription.vendor_subscription.subscription_in_registration',
        'dokan_product_subscription.notify_by_email'             => 'vendor.vendor_subscription.vendor_subscription.email_notification_expiry',
        'dokan_product_subscription.no_of_days_before_mail' => 'vendor.vendor_subscription.vendor_subscription.alert_days_before_expiry',
        'dokan_product_subscription.product_status_after_end' => 'vendor.vendor_subscription.vendor_subscription.products_status_on_expiry',
        'dokan_product_subscription.cancelling_email_subject' => 'vendor.vendor_subscription.vendor_subscription.cancelling_email_subject',
        'dokan_product_subscription.cancelling_email_body'        => 'vendor.vendor_subscription.vendor_subscription.cancelling_email_body',
        'dokan_product_subscription.alert_email_subject'          => 'vendor.vendor_subscription.vendor_subscription.alert_email_subject',
        'dokan_product_subscription.alert_email_body'             => 'vendor.vendor_subscription.vendor_subscription.alert_email_body',

        // Vendor > Single Product Multi Vendor
        'dokan_spmv.enable_pricing'           => 'vendor.single_product_multi_vendor.single_product_multi_vendor.single_product_multiple_vendor',
        'dokan_spmv.sell_item_btn'           => 'vendor.single_product_multi_vendor.single_product_multi_vendor.sell_item_button_text',
        'dokan_spmv.available_vendor_list_title' => 'vendor.single_product_multi_vendor.single_product_multi_vendor.available_vendor_display_area_title',
        'dokan_spmv.available_vendor_list_position' => 'vendor.single_product_multi_vendor.single_product_multi_vendor.available_vendor_section_display_position',
        'dokan_spmv.show_order'              => 'vendor.single_product_multi_vendor.single_product_multi_vendor.spmv_products_display',

        // =========================
        // Product > Product Advertisement
        // =========================
        'dokan_product_advertisement.total_available_slot' => 'product.product_advertisement.advertisement_available_slots',
        'dokan_product_advertisement.expire_after_days'    => 'product.product_advertisement.advertisement_expire_days',
        'dokan_product_advertisement.cost'                 => 'product.product_advertisement.advertisement_cost_usd',
        'dokan_product_advertisement.per_product_enabled'  => 'product.product_advertisement.vendor_can_purchase_advertisement',
        'dokan_product_advertisement.vendor_subscription_enabled' => 'product.product_advertisement.advertisement_in_subscription',
        'dokan_product_advertisement.featured'             => 'product.product_advertisement.mark_advertised_as_featured',
        'dokan_product_advertisement.catalog_priority'     => 'product.product_advertisement.display_advertised_on_top',
        'dokan_product_advertisement.hide_out_of_stock_items' => 'product.product_advertisement.out_of_stock_visibility',

        // Product > Printful (App & Size Guide)
        'dokan_printful.app_id'            => 'product.printful_integration.printful_api_settings.printful_api_settings_group.printful_client_id',
        'dokan_printful.app_secret'        => 'product.printful_integration.printful_api_settings.printful_api_settings_group.printful_secret_key',
        'dokan_printful.app_url'           => 'product.printful_integration.printful_api_settings.printful_api_settings_group.printful_app_url',
        'dokan_printful.app_redirect_domain' => 'product.printful_integration.printful_api_settings.printful_api_settings_group.printful_redirection_domains',
        'dokan_printful.size_guide_sub_section' => 'product.printful_integration.size_guide_settings.size_guide_popup_title',
        'dokan_printful.popup_title'       => 'product.printful_integration.size_guide_settings.size_guide_popup_title',
        'dokan_printful.popup_text_color'  => 'product.printful_integration.size_guide_settings.size_guide_popup_text_color',
        'dokan_printful.popup_bg_color'    => 'product.printful_integration.size_guide_settings.size_guide_popup_background_color',
        'dokan_printful.tab_bg_color'      => 'product.printful_integration.size_guide_settings.size_guide_tab_background_color',
        'dokan_printful.active_tab_bg_color' => 'product.printful_integration.size_guide_settings.size_guide_active_tab_background_color',
        'dokan_printful.size_guide_button_text' => 'product.printful_integration.size_guide_settings.size_guide_button_text',
        'dokan_printful.button_text_color' => 'product.printful_integration.size_guide_settings.size_guide_button_text_color',
        'dokan_printful.primary_measurement_unit' => 'product.printful_integration.size_guide_settings.size_guide_measurement_unit',

        // Product > Request for Quote
        'dokan_quote_settings.enable_out_of_stock'        => 'product.request_for_quote.enable_quote_out_of_stock',
        'dokan_quote_settings.enable_ajax_add_to_quote'   => 'product.request_for_quote.enable_ajax_add_to_quote',
        'dokan_quote_settings.redirect_to_quote_page'     => 'product.request_for_quote.redirect_to_quote_page',
        'dokan_quote_settings.decrease_offered_price'     => 'product.request_for_quote.decrease_offered_price',
        'dokan_quote_settings.enable_convert_to_order'    => 'product.request_for_quote.convert_to_order',
        'dokan_quote_settings.enable_quote_converter_display' => 'product.request_for_quote.quote_converter_display',

        // Product > Wholesale
        'dokan_wholesale.wholesale_price_display'         => 'product.wholesale.display_wholesale_pricing_to',
        'dokan_wholesale.display_price_in_shop_archieve'  => 'product.wholesale.wholesale_price_on_shop_archive',
        'dokan_wholesale.need_approval_for_wholesale_customer' => 'product.wholesale.need_approval_for_customer',

        // =========================
        // AI Assist > Product Generation
        // =========================
        'dokan_ai.dokan_ai_engine'          => 'ai_assist.product_generation.product_image_section.product_info_engine',
        'dokan_ai.dokan_ai_chatgpt_api_key' => 'ai_assist.product_generation.chatgpt_api_info_group.openai_api_key',
        'dokan_ai.dokan_ai_chatgpt_model'   => 'ai_assist.product_generation.product_image_section.openai_model',
    ];

    /**
     * Reverse map array [ new_key => old_key ].
     *
     * @var array<string,string>
     */
    protected array $reverse_map = [];

    public function __construct( array $map = [] ) {
        if ( ! empty( $map ) ) {
            $this->set_map( $map );
        }

        // Allow 3rd parties to override/extend the map.
        $filtered = apply_filters( 'dokan_settings_mapper_map', $this->map );
        if ( is_array( $filtered ) ) {
            $this->map = $filtered;
        }

        $this->build_reverse_map();
    }

    /**
     * Set/replace the mapping array.
     */
    public function set_map( array $map ): self {
        $this->map = $map;
        $this->build_reverse_map();
        return $this;
    }

    /**
     * Get the active mapping array.
     */
    public function get_map(): array {
        return $this->map;
    }

    /**
     * Map a legacy key (section.field) to the new key path.
     *
     * @return string|null The new key or null if not mapped.
     */
    public function to_new_key( string $old_key ): ?string {
        return $this->map[ $old_key ] ?? null;
    }

    /**
     * Map a new key path (Page.SubPage.Section.Field) to a legacy key.
     *
     * @return string|null The legacy key or null if not mapped.
     */
    public function to_old_key( string $new_key ): ?string {
        return $this->reverse_map[ $new_key ] ?? null;
    }

    /**
     * Build reverse map from the forward map.
     */
    protected function build_reverse_map(): void {
        $this->reverse_map = [];
        foreach ( $this->map as $old => $new ) {
            if ( isset( $this->reverse_map[ $new ] ) && $this->reverse_map[ $new ] !== $old ) {
                $report = function_exists( 'apply_filters' ) ? (bool) apply_filters( 'dokan_settings_mapper_report_duplicate_new_keys', false, $new, $old, $this->reverse_map[ $new ] ) : false;
                if ( $report && function_exists( '_doing_it_wrong' ) ) {
                    $message = sprintf(
                        'Duplicate new-key mapping detected for "%s" ("%s" vs "%s").',
                        $new,
                        $this->reverse_map[ $new ],
                        $old
                    );
                    _doing_it_wrong( __METHOD__, $message, '3.13.0' );
                }
            }
            $this->reverse_map[ $new ] = $old;
        }
    }

    /**
     * Helper: set a value into a nested array using dot notation.
     *
     * @param array  $array The array to modify (passed by reference).
     * @param string $path  Dot-notated path (e.g. foo.bar.baz).
     * @param mixed  $value Value to set.
     */
    public static function set_value_by_path( array &$array, string $path, $value ): void {
        if ( '' === $path ) {
            return;
        }
        $keys = explode( '.', $path );
        $ref  = &$array;
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) ) {
                $ref = [];
            }
            if ( ! array_key_exists( $key, $ref ) || ! is_array( $ref[ $key ] ) ) {
                $ref[ $key ] = [];
            }
            $ref = &$ref[ $key ];
        }
        $ref = $value;
    }

    /**
     * Helper: get a value from a nested array using dot notation.
     * Returns $default if any key is missing.
     */
    public static function get_value_by_path( array $array, string $path, $default = null ) {
        if ( '' === $path ) {
            return $default;
        }
        $keys = explode( '.', $path );
        $ref  = $array;
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) || ! array_key_exists( $key, $ref ) ) {
                return $default;
            }
            $ref = $ref[ $key ];
        }
        return $ref;
    }

    /**
     * Helper: check if a dot-notated path exists in an array.
     *
     * @param array  $array
     * @param string $path
     *
     * @return bool
     */
    public static function has_path( array $array, string $path ): bool {
        if ( '' === $path ) {
            return false;
        }
        $keys = explode( '.', $path );
        $ref  = $array;
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) || ! array_key_exists( $key, $ref ) ) {
                return false;
            }
            $ref = $ref[ $key ];
        }
        return true;
    }

    /**
     * Helper: unset a value in a nested array using dot notation.
     * No-op if path does not exist.
     *
     * @param array  $array Array to modify (passed by reference).
     * @param string $path  Dot-notated path.
     */
    public static function unset_by_path( array &$array, string $path ): void {
        if ( '' === $path ) {
            return;
        }
        $keys = explode( '.', $path );
        $ref  = &$array;
        $last = array_pop( $keys );
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) || ! array_key_exists( $key, $ref ) ) {
                return;
            }
            $ref = &$ref[ $key ];
        }
        if ( is_array( $ref ) && array_key_exists( $last, $ref ) ) {
            unset( $ref[ $last ] );
        }
    }
}
