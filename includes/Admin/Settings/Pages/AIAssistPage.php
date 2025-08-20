<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;

class AIAssistPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'ai_assist';

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_ai_assist';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() { }

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

    public function describe_settings(): void {
        $product_generation = ElementFactory::sub_page(
            'product_generation'
        )
            ->set_title( __( 'Product Generation', 'dokan-lite' ) )
            ->set_description( __( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/ai-assist/' )
            ->add(
                ElementFactory::field( 'product_info_generate', 'switch' )
                    ->set_title( __( 'Product Info Generate', 'dokan-lite' ) )
                    ->set_description( __( 'Let vendors generate product info by AI.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_info_engine', 'select' )
                    ->set_title( __( 'Engine', 'dokan-lite' ) )
                    ->set_description( __( 'Select which AI provider to use for generating content.', 'dokan-lite' ) )
                    ->add_option( __( 'ChatGPT', 'dokan-lite' ), 'chatgpt' )
                    ->add_option( __( 'Claude AI', 'dokan-lite' ), 'claude' )
                    ->add_option( __( 'Gemini', 'dokan-lite' ), 'gemini' )
                    ->set_default( 'chatgpt' )
                    ->add_dependency( 'product_info_generate', 'on', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'openai_api_info', 'base_field_label' )
                    ->set_title( __( 'OpenAI API', 'dokan-lite' ) )
                    ->set_description( __( 'Connect to your OpenAI account with your website.', 'dokan-lite' ) )
                    // ->set_link_text( __( 'Get Help', 'dokan-lite' ) )
                    // ->set_link_url( 'https://wedevs.com/docs/dokan-lite/openai-integration/' )
                    ->add_dependency( 'product_info_engine', 'chatgpt', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'openai_api_notice', 'info' )
                    ->set_title( __( 'You can get your API Keys in your OpenAI Account.', 'dokan-lite' ) )
                    ->set_description( __( 'Access your OpenAI dashboard to generate API keys for integration.', 'dokan-lite' ) )
                    ->set_link_text( __( 'OpenAI Account', 'dokan-lite' ) )
                    ->set_link_url( 'https://platform.openai.com/api-keys' )
                    ->add_dependency( 'product_info_engine', 'chatgpt', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'openai_api_key', 'show_hide' )
                    ->set_title( __( 'API Key', 'dokan-lite' ) )
                    ->set_description( __( 'Enter your OpenAI API key for content generation.', 'dokan-lite' ) )
                    ->set_placeholder( __( 'Enter your OpenAI API key', 'dokan-lite' ) )
                    ->add_dependency( 'product_info_engine', 'chatgpt', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'openai_model', 'select' )
                    ->set_title( __( 'Model', 'dokan-lite' ) )
                    ->set_description( __( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ) )
                    ->add_option( __( 'ChatGPT 4o Latest', 'dokan-lite' ), 'gpt-4o' )
                    ->add_option( __( 'ChatGPT 4o Mini', 'dokan-lite' ), 'gpt-4o-mini' )
                    ->add_option( __( 'ChatGPT 4 Turbo', 'dokan-lite' ), 'gpt-4-turbo' )
                    ->add_option( __( 'ChatGPT 3.5 Turbo', 'dokan-lite' ), 'gpt-3.5-turbo' )
                    ->set_default( 'gpt-4o' )
                    ->add_dependency( 'product_info_engine', 'chatgpt', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'product_image_enhancement', 'switch' )
                    ->set_title( __( 'Product Image Enhancement', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to enhance and generate professional product images using AI.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_image_engine', 'select' )
                    ->set_title( __( 'Engine', 'dokan-lite' ) )
                    ->set_description( __( 'Select your AI provider for image processing and generation.', 'dokan-lite' ) )
                    ->add_option( __( 'Leonardo AI', 'dokan-lite' ), 'leonardo' )
                    ->add_option( __( 'DALL-E', 'dokan-lite' ), 'dalle' )
                    ->add_option( __( 'Midjourney', 'dokan-lite' ), 'midjourney' )
                    ->set_default( 'leonardo' )
                    ->add_dependency( 'product_image_enhancement', 'on', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'leonardo_api_info', 'base_field_label' )
                    ->set_title( __( 'Leonardo AI API', 'dokan-lite' ) )
                    ->set_description( __( 'Connect to your Leonardo AI account with your website.', 'dokan-lite' ) )
                    // ->set_link_text( __( 'Get Help', 'dokan-lite' ) )
                    // ->set_link_url( 'https://wedevs.com/docs/dokan-lite/leonardo-integration/' )
                    ->add_dependency( 'product_image_engine', 'leonardo', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'leonardo_api_notice', 'info' )
                    ->set_title( __( 'You can get your API Keys in your Leonardo AI account', 'dokan-lite' ) )
                    ->set_description( __( 'Access your Leonardo AI dashboard to generate API keys for integration.', 'dokan-lite' ) )
                    // ->set_link_text( __( 'Leonardo AI Account', 'dokan-lite' ) )
                    // ->set_link_url( 'https://app.leonardo.ai/auth/login?callbackUrl=%2F' )
                    ->add_dependency( 'product_image_engine', 'leonardo', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'leonardo_api_key', 'show_hide' )
                    ->set_title( __( 'API Key', 'dokan-lite' ) )
                    ->set_description( __( 'Enter your Leonardo AI API key for image generation.', 'dokan-lite' ) )
                    ->set_placeholder( __( 'Enter your Leonardo AI API key', 'dokan-lite' ) )
                    ->add_dependency( 'product_image_engine', 'leonardo', true, 'display', 'show', '===' )
            )
            ->add(
                ElementFactory::field( 'leonardo_model', 'select' )
                    ->set_title( __( 'Model', 'dokan-lite' ) )
                    ->set_description( __( 'Choose the AI model for image enhancement and generation. Different models excel at various image types and styles.', 'dokan-lite' ) )
                    // ->add_option( __( 'Select Model', 'dokan-lite' ), '' )
                    ->add_option( __( 'Leonardo Phoenix', 'dokan-lite' ), 'leonardo-phoenix' )
                    ->add_option( __( 'Leonardo Vision XL', 'dokan-lite' ), 'leonardo-vision-xl' )
                    ->add_option( __( 'Leonardo Diffusion XL', 'dokan-lite' ), 'leonardo-diffusion-xl' )
                    ->set_default( 'leonardo-phoenix' )
                    ->add_dependency( 'product_image_engine', 'leonardo', true, 'display', 'show', '===' )
            );

        $vendor_onboarding = ElementFactory::sub_page(
            'vendor_onboarding'
        )
            ->set_title( __( 'Vendor Onboarding', 'dokan-lite' ) )
            ->set_description( __( 'Control the onboarding experience for vendors joining your marketplace.', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan-lite/vendor-onboarding/' )
            ->add(
                ElementFactory::field( 'enable_selling', 'radio_capsule' )
                    ->set_title( __( 'Enable Selling', 'dokan-lite' ) )
                    ->set_description( __( 'Immediately enable selling for newly registered vendors.', 'dokan-lite' ) )
                    ->add_option( __( 'Automatically', 'dokan-lite' ), 'automatically' )
                    ->add_option( __( 'Manually', 'dokan-lite' ), 'manually' )
                    ->set_default( 'automatically' )
            )
            ->add(
                ElementFactory::field( 'address_fields', 'switch' )
                    ->set_title( __( 'Address Fields', 'dokan-lite' ) )
                    ->set_description( __( 'Add Address Fields on the Vendor Registration form.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'terms_conditions', 'switch' )
                    ->set_title( __( 'Terms and Conditions', 'dokan-lite' ) )
                    ->set_description( __( 'Enable the terms & conditions checkbox on vendor registration form.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'welcome_wizard', 'switch' )
                    ->set_title( __( 'Welcome Wizard', 'dokan-lite' ) )
                    ->set_description( __( 'Welcome wizard for newly registered vendors.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'vendor_setup_wizard_logo', 'file_upload' )
                    ->set_title( __( 'Vendor Setup Wizard Logo', 'dokan-lite' ) )
                    ->set_description( __( 'Recommended logo size (270px X 90px). If no logo is uploaded, site title is shown by default.', 'dokan-lite' ) )
                    ->set_placeholder( __( '+ Choose File', 'dokan-lite' ) )
                    ->set_allowed_types( array( 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml' ) )
                    ->set_max_file_size( 2 * 1024 * 1024 ) // 2MB
            )
            ->add(
                ElementFactory::field( 'vendor_setup_wizard_message', 'rich_text' )
                    ->set_title( __( 'Vendor Setup Wizard Message', 'dokan-lite' ) )
                    ->set_description( __( 'Enter a welcome message for new vendors.', 'dokan-lite' ) )
                    ->set_placeholder( __( 'Enter your welcome message here...', 'dokan-lite' ) )
            );

        $this->add( $product_generation )
            ->add( $vendor_onboarding )
            ->set_icon( 'Brain' )
            ->set_title( __( 'AI Assist', 'dokan-lite' ) )
            ->set_description( __( 'Configure AI-powered features to enhance your marketplace experience.', 'dokan-lite' ) );
    }
}
