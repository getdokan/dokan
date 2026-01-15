<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\Model;

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
        // Get text providers dynamically
        $text_providers = dokan()->get_container()->get( Manager::class )->get_text_supported_providers();

        $product_generation = ElementFactory::sub_page( 'product_generation' )
            ->set_title( esc_html__( 'Content Generation', 'dokan-lite' ) )
            ->set_priority( 100 )
            ->set_description( esc_html__( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ) )
            ->set_doc_link( 'https://dokan.co/docs/wordpress/settings/dokan-ai-assistant/' );

        // Product Info Generation Section
        $product_image_section = ElementFactory::section( 'product_image_section' )
            ->add(
                ElementFactory::field( 'product_info_generate', 'switch' )
                    ->set_title( esc_html__( 'Product Info Generate', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Let vendors generate product info by AI.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            );

        // Engine select for text providers
        $engine_select = ElementFactory::field( 'product_info_engine', 'select' )
            ->set_title( esc_html__( 'Engine', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Select which AI provider to use for generating content.', 'dokan-lite' ) )
            ->set_default( 'openai' )
            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' );

        // Add provider options dynamically
        foreach ( $text_providers as $provider_id => $provider ) {
            $engine_select->add_option( $provider->get_title(), $provider_id );
        }

        $product_image_section->add( $engine_select );

        // Add provider-specific fields dynamically
        foreach ( $text_providers as $provider_id => $provider ) {
            $this->add_text_provider_fields( $product_image_section, $provider_id, $provider );
        }

        $product_generation->add( $product_image_section );

        $this->add( $product_generation )
            ->set_icon( 'Sparkles' )
            ->set_title( esc_html__( 'AI Assist', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure AI-powered features to enhance your marketplace experience.', 'dokan-lite' ) );
    }

    /**
     * Add text provider fields dynamically
     *
     * @param object $section Section object
     * @param string $provider_id Provider ID
     * @param object $provider Provider object
     * @return void
     */
    private function add_text_provider_fields( $section, $provider_id, $provider ) {
        $field_group = ElementFactory::field_group( $provider_id . '_api_info_group' )
            ->add_dependency( 'product_generation.product_image_section.product_info_engine', $provider_id, true, 'display', 'show', '===' )
            ->add_dependency( 'product_generation.product_image_section.product_info_engine', $provider_id, true, 'display', 'hide', '!==' );

        // API Info Label
        $field_group->add(
            ElementFactory::field( $provider_id . '_api_info', 'base_field_label' )
                ->set_title( sprintf( esc_html__( '%s API', 'dokan-lite' ), $provider->get_title() ) )
                ->set_image_url( $provider->get_image_url() )
                ->set_description(
                    sprintf(
                        /* translators: 1. Link start tag, 2. Link end tag, 3. Provider title */
                        esc_html__( 'Connect to your %3$s account with your website. %1$sGet Help%2$s', 'dokan-lite' ),
                        '<a href="' . esc_url( $provider->get_api_key_url() ) . '" target="_blank" rel="noopener noreferrer">',
                        '</a>',
                        $provider->get_title()
                    )
                )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
        );

        // API Notice
        $field_group->add(
            ElementFactory::field( $provider_id . '_api_notice', 'info' )
                ->set_title( sprintf( esc_html__( 'You can get your API Keys in your %s Account.', 'dokan-lite' ), $provider->get_title() ) )
                ->set_description( sprintf( esc_html__( 'Access your %s dashboard to generate API keys for integration.', 'dokan-lite' ), $provider->get_title() ) )
                ->set_link_text( sprintf( esc_html__( '%s Account', 'dokan-lite' ), $provider->get_title() ) )
                ->set_link_url( $provider->get_api_key_url() )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
        );

        // API Key
        $field_group->add(
            ElementFactory::field( $provider_id . '_api_key', 'show_hide' )
                ->set_title( esc_html__( 'API Key', 'dokan-lite' ) )
                ->set_tooltip( sprintf( __( 'Enter your %s API key for content generation.', 'dokan-lite' ), $provider->get_title() ) )
                ->set_placeholder( sprintf( esc_html__( 'Enter your %s API key', 'dokan-lite' ), $provider->get_title() ) )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
                ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' )
        );

        // Model Select
        $model_select = ElementFactory::field( $provider_id . '_model', 'select' )
            ->set_title( esc_html__( 'Model', 'dokan-lite' ) )
            ->set_description( esc_html__( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ) )
            ->set_default( $provider->get_default_model_id() )
            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'show', '===' )
            ->add_dependency( 'product_generation.product_image_section.product_info_generate', 'on', true, 'display', 'hide', '!==' );

        // Add model options dynamically
        $models = $provider->get_models_by_type( Model::SUPPORTS_TEXT );
        foreach ( $models as $model_id => $model ) {
            $model_select->add_option( $model->get_title(), $model_id );
        }

        $field_group->add( $model_select );

        $section->add( $field_group );
    }
}
