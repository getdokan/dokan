<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class ModerationPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'moderation';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 250;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_moderation';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() {}

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array {
        return [];
    }

    /**
     * Describe the settings options
     *
     * @throws \Exception
     * @return void
     */
    public function describe_settings(): void {
        // Create RMA subpage
        $rma_page = ElementFactory::sub_page( 'rma' )
            ->set_title( esc_html__( 'RMA', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Allow vendors to offer customize return and warranty facility on their sold products and Configure customer return options.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/moderation/rma/' );

        // Create RMA settings section
        $rma_section = ElementFactory::section( 'rma_settings' )
		->add(
            ElementFactory::field( 'rma_order_status', 'select' )
                ->set_title( esc_html__( 'Order Status', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Choose which order status allows customers to start the return process.', 'dokan-lite' ) )
                ->add_option( esc_html__( 'Completed', 'dokan-lite' ), 'completed' )
                ->add_option( esc_html__( 'Processing', 'dokan-lite' ), 'processing' )
                ->add_option( esc_html__( 'On Hold', 'dokan-lite' ), 'on-hold' )
                ->add_option( esc_html__( 'Shipped', 'dokan-lite' ), 'shipped' )
                ->add_option( esc_html__( 'Delivered', 'dokan-lite' ), 'delivered' )
                ->set_default( 'completed' )
		);

        // Add Refund Requests toggle
        $rma_section->add(
            ElementFactory::field( 'rma_refund_requests', 'switch' )
                ->set_title( esc_html__( 'Refund Requests', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Let customers submit refund requests directly through vendor stores.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Add Coupon Requests toggle
        $rma_section->add(
            ElementFactory::field( 'rma_coupon_requests', 'switch' )
                ->set_title( esc_html__( 'Coupon Requests', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Allow customers to request for coupons as store credit.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Create Refund Policy section
        $refund_policy_section = ElementFactory::section( 'refund_policy_settings' )

        ->add(
            ElementFactory::field( 'rma_refund_policy', 'rich_text' )
                ->set_title( esc_html__( 'Refund Policy', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Create a standard refund policy for all vendors. Vendors can customize this policy for their specific needs.', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Enter your refund policy here...', 'dokan-lite' ) )
        );
        // Reasons of RMA section
        $reasons_of_rma_section = ElementFactory::section( 'reasons_of_rma_settings' )
            ->set_title( esc_html__( 'Reasons for RMA', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Set up return reasons for customers to choose from.', 'dokan-lite' ) );

        // Add Reasons of RMA field (repeater)
        $reasons_of_rma_section->add(
            ElementFactory::field( 'rma_reasons', 'repeater' )
                ->set_title( esc_html__( 'Reasons for RMA', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Set up return reasons for customers to choose from.', 'dokan-lite' ) )
                ->set_new_title( esc_html__( 'Add Reasons for RMA', 'dokan-lite' ) )
                ->set_default(
                    [
						[
							'id'    => 'bad_product',
							'title' => esc_html__( 'Bad Product', 'dokan-lite' ),
							'order' => 1,
						],
						[
							'id'    => 'packing_scratch',
							'title' => esc_html__( 'Packing Scratch', 'dokan-lite' ),
							'order' => 2,
						],
						[
							'id'    => 'as_not_image',
							'title' => esc_html__( 'As not Image', 'dokan-lite' ),
							'order' => 3,
						],
						[
							'id'    => 'missing_parts',
							'title' => esc_html__( 'Missing Parts', 'dokan-lite' ),
							'order' => 4,
						],
						[
							'id'    => 'wrong_products',
							'title' => esc_html__( 'Wrong Products', 'dokan-lite' ),
							'order' => 5,
						],
					]
                )
        );

        // Add the sections to the RMA page
        $rma_page->add( $rma_section );
        $rma_page->add( $refund_policy_section );
        $rma_page->add( $reasons_of_rma_section );

        // Create Livechat subpage
        $livechat_page = ElementFactory::sub_page( 'livechat' )
            ->set_title( esc_html__( 'Livechat', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure live chat settings for vendor-customer communication.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/moderation/livechat/' );

        // Create Livechat settings section
        $livechat_section = ElementFactory::section( 'livechat_settings' )
            ->add(
                ElementFactory::field( 'livechat_enabled', 'switch' )
                ->set_title( esc_html__( 'Live Chat', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Enable live chat between vendor and customer', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
            );

        // Add Chat Provider customize radio
        $livechat_section->add(
            ElementFactory::field( 'livechat_provider', 'customize_radio' )
                ->set_title( esc_html__( 'Chat Provider', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Select which chat platform to use.', 'dokan-lite' ) )
                ->set_variant( 'radio_box' )
                ->add_enhanced_option(
                    [
						'title'       => esc_html__( 'Messenger', 'dokan-lite' ),
						'value'       => 'messenger',
						'description' => esc_html__( 'Connect with customers through Facebook Messenger', 'dokan-lite' ),
						'icon'        => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/messanger-thumb.svg' ,
					]
                )
                ->add_enhanced_option(
                    [
						'title'       => esc_html__( 'Talk JS', 'dokan-lite' ),
						'value'       => 'talkjs',
						'description' => esc_html__( 'Real-time chat with TalkJS integration', 'dokan-lite' ),
						'icon'        => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/talkjs-thumb.svg' ,
					]
                )
                ->add_enhanced_option(
                    [
						'title'       => esc_html__( 'Tawk.to', 'dokan-lite' ),
						'value'       => 'tawkto',
						'description' => esc_html__( 'Live chat support with Tawk.to platform', 'dokan-lite' ),
						'icon'        => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/tawk-thumb.svg' ,
					]
                )
                ->add_enhanced_option(
                    [
						'title'       => esc_html__( 'WhatsApp', 'dokan-lite' ),
						'value'       => 'whatsapp',
						'description' => esc_html__( 'Connect with customers via WhatsApp Business', 'dokan-lite' ),
						'icon'        => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/whatsapp-thumb.svg' ,
					]
                )
                ->set_default( 'talkjs' )
        );

        // Add App ID field (show/hide with password)
        $livechat_section->add(
            ElementFactory::field( 'livechat_app_id', 'show_hide' )
                ->set_title( esc_html__( 'App ID', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Insert App ID here', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Enter your App ID', 'dokan-lite' ) )
                // add dependency of talkjs provider
                ->add_dependency( 'livechat.livechat_settings.livechat_provider', 'talkjs', true, 'display', 'show', '===' )
                ->add_dependency( 'livechat.livechat_settings.livechat_provider', 'talkjs', true, 'display', 'hide', '!==' )
        );

        // Add App Secret field (show/hide with password)
        $livechat_section->add(
            ElementFactory::field( 'livechat_app_secret', 'show_hide' )
                ->set_title( esc_html__( 'App Secret', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Insert App Secret', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Enter your App Secret', 'dokan-lite' ) )
                // add dependency of talkjs provider
                ->add_dependency( 'livechat.livechat_settings.livechat_provider', 'talkjs', true, 'display', 'show', '===' )
                ->add_dependency( 'livechat.livechat_settings.livechat_provider', 'talkjs', true, 'display', 'hide', '!==' )
        );

        // Add Chat Button on Vendor Page toggle
        $livechat_section->add(
            ElementFactory::field( 'livechat_vendor_page_button', 'switch' )
                ->set_title( esc_html__( 'Chat Button on Vendor Page', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Display a chat button on vendor store pages', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Add Chat Button on Product Page customize radio
        $livechat_section->add(
            ElementFactory::field( 'livechat_product_page_button', 'customize_radio' )
                ->set_title( esc_html__( 'Chat Button on Product Page', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Choose where to show the chat button on product pages.', 'dokan-lite' ) )
                ->set_variant( 'template' )
                ->add_enhanced_option(
                    [
                        'title'       => esc_html__( 'Above Product Tab', 'dokan-lite' ),
                        'value'       => 'above_tab',
                        'description' => esc_html__( 'Display chat button above the product tabs section', 'dokan-lite' ),
                        'image' => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/chat-button-above.svg',
                    ]
                )
                ->add_enhanced_option(
                    [
                        'title'       => esc_html__( 'Inside Product Tab', 'dokan-lite' ),
                        'value'       => 'inside_tab',
                        'description' => esc_html__( 'Show chat button within the product tabs content', 'dokan-lite' ),
                        'image' => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/chat-button-inside.svg',
                    ]
                )
                ->add_enhanced_option(
                    [
                        'title'       => esc_html__( 'Don\'t Show', 'dokan-lite' ),
                        'value'       => 'dont_show',
                        'description' => esc_html__( 'Hide chat button on product pages completely', 'dokan-lite' ),
                        'image' => DOKAN_PLUGIN_ASSEST . '/src/images/moderation/live-chat/chat-button-hide.svg',
                    ]
                )
                ->set_default( 'above_tab' )
        );

        // Add the section to the Livechat page
        $livechat_page->add( $livechat_section );

        // Create Store Support subpage
        $store_support_page = ElementFactory::sub_page( 'store_support' )
            ->set_title( esc_html__( 'Store Support', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure store support settings for vendor-customer communication.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/moderation/store-support/' );

        // Create Store Support settings section
        $store_support_section = ElementFactory::section( 'store_support_settings' )
            ->set_title( esc_html__( 'Store Support Settings', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure store support button display and customization.', 'dokan-lite' ) );

        // Add Display on Order Details toggle
        $store_support_section->add(
            ElementFactory::field( 'store_support_order_details', 'switch' )
                ->set_title( esc_html__( 'Display on Order Details', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Add a support button to order details pages for customers to easily contact vendors about their orders.', 'dokan-lite' ) )
                ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                ->set_default( 'on' )
        );

        // Add Support Button Label field
        $store_support_section->add(
            ElementFactory::field( 'store_support_button_label', 'text' )
                ->set_title( esc_html__( 'Support Button Label', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Customize the text that appears on the support button.', 'dokan-lite' ) )
                ->set_placeholder( esc_html__( 'Get Support', 'dokan-lite' ) )
                ->set_default( esc_html__( 'Get Support', 'dokan-lite' ) )
        );

        // Add Display on Single Product Page radio
        $store_support_section->add(
            ElementFactory::field( 'store_support_product_page', 'customize_radio' )
                ->set_title( esc_html__( 'Display on Single Product Page', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Choose where to show the support button on individual product pages for customer support.', 'dokan-lite' ) )
                ->add_option( esc_html__( 'Above Product Tab', 'dokan-lite' ), 'above_tab' )
                ->add_option( esc_html__( 'Inside Product Tab', 'dokan-lite' ), 'inside_tab' )
                ->add_option( esc_html__( 'Don\'t Show', 'dokan-lite' ), 'dont_show' )
                ->set_default( 'above_tab' )
        );

        // Add the section to the Store Support page
        $store_support_page->add( $store_support_section );

        // Create Report Abuse subpage
        $report_abuse_page = ElementFactory::sub_page( 'report_abuse' )
            ->set_title( esc_html__( 'Report Abuse', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure report abuse settings and reasons for product reporting.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/moderation/report-abuse/' );

        // Create Report Abuse settings section
        $report_abuse_section = ElementFactory::section( 'report_abuse_settings' )
            ->set_title( esc_html__( 'Report Abuse Settings', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure who can report products and what reasons they can select.', 'dokan-lite' ) );

        // Add Reported by capsule selection
        $report_abuse_section->add(
            ElementFactory::field( 'report_abuse_reported_by', 'radio_capsule' )
                ->set_title( esc_html__( 'Reported by', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Choose who has permission to report products.', 'dokan-lite' ) )
                ->add_option( esc_html__( 'Logged-in Users', 'dokan-lite' ), 'logged_in_users' )
                ->add_option( esc_html__( 'All Users', 'dokan-lite' ), 'all_users' )
                ->set_default( 'logged_in_users' )
        );

        // Create Reasons for Abuse Reports section
        $reasons_section = ElementFactory::section( 'reasons_for_abuse_reports' )
            ->set_title( esc_html__( 'Reasons for Abuse Reports', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Create a list of reasons users can select when reporting products.', 'dokan-lite' ) );

        // Add Reasons for Abuse Reports field (repeater)
        $reasons_section->add(
            ElementFactory::field( 'report_abuse_reasons', 'repeater' )
                ->set_title( esc_html__( 'Reasons for Abuse Reports', 'dokan-lite' ) )
                ->set_description( esc_html__( 'Create a list of reasons users can select when reporting products.', 'dokan-lite' ) )
                ->set_new_title( esc_html__( 'Add Reasons for Report Abuse', 'dokan-lite' ) )
                ->set_default(
                    [
						[
							'id'    => 'spam_content',
							'title' => esc_html__( 'This content is spam', 'dokan-lite' ),
							'order' => 1,
						],
						[
							'id'    => 'adult_content',
							'title' => esc_html__( 'This content should marked as adult', 'dokan-lite' ),
							'order' => 2,
						],
						[
							'id'    => 'abusive_content',
							'title' => esc_html__( 'This content is abusive', 'dokan-lite' ),
							'order' => 3,
						],
						[
							'id'    => 'violent_content',
							'title' => esc_html__( 'This content is violent', 'dokan-lite' ),
							'order' => 4,
						],
						[
							'id'    => 'nudity_content',
							'title' => esc_html__( 'This content contains nudity', 'dokan-lite' ),
							'order' => 5,
						],
					]
                )
        );

        // Add the sections to the Report Abuse page
        $report_abuse_page->add( $report_abuse_section );
        $report_abuse_page->add( $reasons_section );

        // Set up the main moderation page
        $this
            ->set_title( esc_html__( 'Moderation', 'dokan-lite' ) )
            ->set_icon( 'Shield' )
            ->set_description( esc_html__( 'Configure moderation settings, return policies, and customer request management.', 'dokan-lite' ) )
            ->add( $rma_page )
            ->add( $livechat_page )
            ->add( $store_support_page )
            ->add( $report_abuse_page );
    }
}
