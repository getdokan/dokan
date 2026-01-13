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
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 300;

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
            ->set_title( esc_html__( 'Content Generation', 'dokan-lite' ) )
            ->set_priority( 100 )
            ->set_description( esc_html__( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ) )
            ->set_doc_link( 'https://dokan.co/docs/wordpress/settings/dokan-ai-assistant/' )
            ->add(
                ElementFactory::section( 'product_image_section' )
                    ->add(
                        ElementFactory::field( 'product_info_generate', 'switch' )
                            ->set_title( esc_html__( 'Product Info Generate', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Let vendors generate product info by AI.', 'dokan-lite' ) )
                            ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( 'off' )
                    )
                    ->add(
                        ElementFactory::field( 'product_info_engine', 'select' )
                            ->set_title( esc_html__( 'Engine', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select which AI provider to use for generating content.', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'OpenAI', 'dokan-lite' ), 'openai' )
                            ->add_option( esc_html__( 'Gemini', 'dokan-lite' ), 'gemini' )
                            ->set_default( 'openai' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                    )
                    ->add(
                        ElementFactory::field_group( 'chatgpt_api_info_group' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_engine', 'openai', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_engine', 'openai', true, 'display', 'hide', '!==' )
                            ->add(
                                ElementFactory::field( 'openai_api_info', 'base_field_label' )
                                    ->set_title( esc_html__( 'OpenAI API', 'dokan-lite' ) )
                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/ai-assist/chat-gpt-open-ai.svg' )
                                    ->set_description(
                                        sprintf(
                                            /* translators: 1. Link start tag, 2. Link end tag */
                                            esc_html__( 'Connect to your OpenAI account with your website. %1$sGet Help%2$s', 'dokan-lite' ),
                                            '<a href="https://wedevs.com/docs/dokan-lite/chatgpt-integration/" target="_blank" rel="noopener noreferrer">',
                                            '</a>'
                                        )
                                    )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'openai_api_notice', 'info' )
                                    ->set_title( esc_html__( 'You can get your API Keys in your OpenAI Account.', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Access your OpenAI dashboard to generate API keys for integration.', 'dokan-lite' ) )
                                    ->set_link_text( esc_html__( 'OpenAI Account', 'dokan-lite' ) )
                                    ->set_link_url( 'https://platform.openai.com/api-keys' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'openai_api_key', 'show_hide' )
                                    ->set_title( esc_html__( 'API Key', 'dokan-lite' ) )
                                    ->set_tooltip( __( 'Enter your OpenAI API key for content generation.', 'dokan-lite' ) )
                                    ->set_placeholder( esc_html__( 'Enter your OpenAI API key', 'dokan-lite' ) )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'openai_model', 'select' )
                                    ->set_title( esc_html__( 'Model', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'OpenAI GPT-3.5 Turbo', 'dokan-lite' ), 'gpt-3.5-turbo' )
                                    ->add_option( esc_html__( 'OpenAI GPT-4o mini', 'dokan-lite' ), 'gpt-4o-mini' )
                                    ->add_option( esc_html__( 'OpenAI GPT-4o', 'dokan-lite' ), 'gpt-4o' )
                                    ->add_option( esc_html__( 'OpenAI ChatGPT-4o', 'dokan-lite' ), 'chatgpt-4o-latest' )
                                    ->set_default( 'gpt-3.5-turbo' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                    )
                    ->add(
                        ElementFactory::field_group( 'gemini_api_info_group' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_engine', 'gemini', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_image_section.product_info_engine', 'gemini', true, 'display', 'hide', '!==' )
                            ->add(
                                ElementFactory::field( 'gemini_api_info', 'base_field_label' )
                                    ->set_title( esc_html__( 'Gemini API', 'dokan-lite' ) )
                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/ai-assist/chat-gpt-open-ai.svg' )
                                    ->set_description(
                                        sprintf(
                                        /* translators: 1. Link start tag, 2. Link end tag */
                                            esc_html__( 'Connect to your Gemini account with your website. %1$sGet Help%2$s', 'dokan-lite' ),
                                            '<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">',
                                            '</a>'
                                        )
                                    )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_api_notice', 'info' )
                                    ->set_title( esc_html__( 'You can get your API Keys in your Gemini Account.', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Access your Gemini dashboard to generate API keys for integration.', 'dokan-lite' ) )
                                    ->set_link_text( esc_html__( 'Gemini Account', 'dokan-lite' ) )
                                    ->set_link_url( 'https://aistudio.google.com/app/apikey' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_api_key', 'show_hide' )
                                    ->set_title( esc_html__( 'API Key', 'dokan-lite' ) )
                                    ->set_tooltip( __( 'Enter your Gemini API key for content generation.', 'dokan-lite' ) )
                                    ->set_placeholder( esc_html__( 'Enter your Gemini API key', 'dokan-lite' ) )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_model', 'select' )
                                    ->set_title( esc_html__( 'Model', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Gemini 2.5 Flash', 'dokan-lite' ), 'gemini-2.5-flash' )
                                    ->add_option( esc_html__( 'Gemini 2.5 Pro', 'dokan-lite' ), 'gemini-2.5-pro' )
                                    ->add_option( esc_html__( 'Gemini 2.5 Flash Lite', 'dokan-lite' ), 'gemini-2.5-flash-lite-preview-06-17' )
                                    ->set_default( 'gemini-2.5-flash' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
                            )
                    )
            )
            ->add(
                ElementFactory::section( 'product_description_section' )
                    ->add(
                        ElementFactory::field( 'product_image_enhancement', 'switch' )
                            ->set_title( esc_html__( 'Product Image Enhancement', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Allow vendors to enhance and generate professional product images using AI.', 'dokan-lite' ) )
                            ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                            ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( 'off' )
                    )
                    ->add(
                        ElementFactory::field( 'product_image_engine', 'select' )
                            ->set_title( esc_html__( 'Engine', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Select your AI provider for image processing and generation.', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Gemini', 'dokan-lite' ), 'gemini' )
                            ->add_option( esc_html__( 'BRIA AI', 'dokan-lite' ), 'bria-ai' )
                            ->set_default( 'gemini' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                    )
                    ->add(
                        ElementFactory::field_group( 'gemini_api_info_group' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_engine', 'gemini', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_engine', 'gemini', true, 'display', 'hide', '!==' )
                            ->add(
                                ElementFactory::field( 'gemini_api_info', 'base_field_label' )
                                    ->set_title( esc_html__( 'Gemini API', 'dokan-lite' ) )
                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/ai-assist/leonardo-ai-thumbnail.svg' )
                                    ->set_description(
                                        sprintf(
                                            /* translators: 1. Link start tag, 2. Link end tag */
                                            esc_html__( 'Connect to your Gemini AI account with your website. %1$sGet Help%2$s', 'dokan-lite' ),
                                            '<a href="https://wedevs.com/docs/dokan-lite/leonardo-integration/" target="_blank" rel="noopener noreferrer">',
                                            '</a>'
                                        )
                                    )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_api_notice', 'info' )
                                    ->set_title( esc_html__( 'You can get your API Keys in your', 'dokan-lite' ) )
                                    ->set_link_text( esc_html__( 'Gemini AI Account', 'dokan-lite' ) )
                                    ->set_link_url( 'https://aistudio.google.com/app/apikey' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_api_key', 'show_hide' )
                                    ->set_title( esc_html__( 'API Key', 'dokan-lite' ) )
                                    ->set_tooltip( __( 'Enter your Gemini API key for image generation.', 'dokan-lite' ) )
                                    ->set_placeholder( esc_html__( 'Enter your Gemini API key', 'dokan-lite' ) )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'gemini_model', 'select' )
                                    ->set_title( esc_html__( 'Model', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Choose the AI model for image enhancement and generation. Different models excel at various image types and styles.', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Gemini 2.5 Flash Image (aka Nano Banana)', 'dokan-lite' ), 'gemini-2.5-flash-image-preview' )
                                    ->set_default( 'gemini-2.5-flash-image-preview' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                    )
                    ->add(
                        ElementFactory::field_group( 'bria_api_info_group' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_engine', 'bria-ai', true, 'display', 'show', '===' )
                            ->add_dependency( 'product_generation.product_description_section.product_image_engine', 'bria-ai', true, 'display', 'hide', '!==' )
                            ->add(
                                ElementFactory::field( 'bria_api_info', 'base_field_label' )
                                    ->set_title( esc_html__( 'BRIA AI API', 'dokan-lite' ) )
                                    ->set_image_url( plugin_dir_url( DOKAN_FILE ) . 'assets/src/images/ai-assist/leonardo-ai-thumbnail.svg' )
                                    ->set_description(
                                        sprintf(
                                            /* translators: 1. Link start tag, 2. Link end tag */
                                            esc_html__( 'Connect to your BRIA AI account with your website. %1$sGet Help%2$s', 'dokan-lite' ),
                                            '<a href="https://wedevs.com/docs/dokan-lite/leonardo-integration/" target="_blank" rel="noopener noreferrer">',
                                            '</a>'
                                        )
                                    )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'bria_api_notice', 'info' )
                                    ->set_title( esc_html__( 'You can get your API Keys in your', 'dokan-lite' ) )
                                    ->set_link_text( esc_html__( 'BRIA AI Account', 'dokan-lite' ) )
                                    ->set_link_url( 'https://platform.bria.ai/console/account/api-keys' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'bria_api_key', 'show_hide' )
                                    ->set_title( esc_html__( 'API Key', 'dokan-lite' ) )
                                    ->set_tooltip( __( 'Enter your BRIA API key for image generation.', 'dokan-lite' ) )
                                    ->set_placeholder( esc_html__( 'Enter your BRIA API key', 'dokan-lite' ) )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                            ->add(
                                ElementFactory::field( 'bria_model', 'select' )
                                    ->set_title( esc_html__( 'Model', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Choose the AI model for image enhancement and generation. Different models excel at various image types and styles.', 'dokan-lite' ) )
                                    ->add_option( esc_html__( 'Generate Background', 'dokan-lite' ), 'bria-generate-background' )
                                    ->set_default( 'bria-generate-background' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'product_generation.product_description_section.product_image_enhancement', 'on', true, 'display', 'hide', '!==' )
                            )
                    )
            );

        $this->add( $product_generation )
            ->set_icon( 'Sparkles' )
            ->set_title( esc_html__( 'AI Assist', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure AI-powered features to enhance your marketplace experience.', 'dokan-lite' ) );
    }
}
