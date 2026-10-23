<?php

namespace WeDevs\Dokan\Intelligence\Admin;

use WeDevs\Dokan\Abilities\Mcp\Status;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\ChatgptResponseService;
use WeDevs\Dokan\Intelligence\Services\GeminiResponseService;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\Intelligence\Services\Provider;

class Settings implements Hookable {
    public function register_hooks(): void {
        add_filter( 'dokan_settings_sections', [ $this, 'render_appearance_section' ] );
        add_filter( 'dokan_settings_fields', [ $this, 'render_ai_settings' ] );
        add_filter( 'dokan_rest_api_class_map', [ $this, 'rest_api_class_map' ] );
        add_filter( 'dokan_get_settings_values', [ $this, 'remap_retired_model_values' ], 10, 2 );
        // After Pro's image fields (priority 10), so the MCP block closes the section.
        add_filter( 'dokan_ai_settings_fields', [ $this, 'render_mcp_settings' ], 20 );
    }

    /**
     * AI Assistants (MCP) fields for the legacy settings screen.
     *
     * Same option keys as the new settings UI (`dokan_ai.dokan_mcp_*`), so either screen flips
     * the same switch. The connection is described with `html` fields filled in when the screen
     * loads; their values are dropped on save by
     * {@see \WeDevs\Dokan\Abilities\Mcp\DisplayFields::strip_legacy_display_values()}.
     *
     * @since DOKAN_SINCE
     *
     * @param array $settings_fields Settings fields keyed by section.
     *
     * @return array
     */
    public function render_mcp_settings( array $settings_fields ): array {
        $when_enabled = [
            'dokan_mcp_enabled' => [
                'equal' => 'on',
            ],
        ];

        $settings_fields['dokan_ai']['dokan_mcp'] = [
            'name'          => 'dokan_mcp',
            'type'          => 'sub_section',
            'label'         => __( 'AI Assistants (MCP)', 'dokan-lite' ),
            'description'   => __( 'Connect assistants such as Claude Code, Claude Desktop or Cursor to your marketplace through the Model Context Protocol.', 'dokan-lite' ),
            'content_class' => 'sub-section-styles',
        ];

        $settings_fields['dokan_ai']['dokan_mcp_enabled'] = [
            'name'    => 'dokan_mcp_enabled',
            'label'   => __( 'Enable AI Assistant Access', 'dokan-lite' ),
            'desc'    => __( 'Run the Dokan MCP server so connected assistants can read and manage products and orders.', 'dokan-lite' ),
            'type'    => 'switcher',
            'default' => 'off',
            'is_lite' => true,
        ];

        $settings_fields['dokan_ai']['dokan_mcp_vendor_access'] = [
            'name'    => 'dokan_mcp_vendor_access',
            'label'   => __( 'Allow Vendors to Connect', 'dokan-lite' ),
            'desc'    => __( 'Vendors and their staff can connect an assistant with an application password of their own. Each connection only reaches that vendor\'s own store.', 'dokan-lite' ),
            'type'    => 'switcher',
            'default' => 'off',
            'is_lite' => true,
            'show_if' => $when_enabled,
        ];

        foreach ( $this->mcp_connection_fields() as $name => $field ) {
            $settings_fields['dokan_ai'][ $name ] = array_merge(
                $field,
                [
                    'name'    => $name,
                    'type'    => 'html',
                    'show_if' => $when_enabled,
                ]
            );
        }

        return $settings_fields;
    }

    /**
     * The connection as legacy `html` fields: status, connector URL and how an assistant signs in.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, array{label:string, desc:string}>
     */
    private function mcp_connection_fields(): array {
        $status   = Status::summary();
        $warnings = '';

        if ( ! $status['adapter_available'] ) {
            $warnings .= '<br><strong>' . esc_html__( 'The MCP adapter is not available on this site. It ships with WooCommerce 10.9 or newer; update WooCommerce to run the server.', 'dokan-lite' ) . '</strong>';
        }

        if ( ! $status['https'] ) {
            $warnings .= '<br><strong>' . esc_html__( 'This site is not served over HTTPS. WordPress only accepts application passwords over HTTPS, and most AI assistants refuse a plain-http connector.', 'dokan-lite' ) . '</strong>';
        }

        return [
            'dokan_mcp_status'               => [
                'label' => __( 'Server Status', 'dokan-lite' ),
                'desc'  => '<strong>' . ( $status['live'] ? esc_html__( 'Active', 'dokan-lite' ) : esc_html__( 'Off', 'dokan-lite' ) ) . '</strong> · ' . esc_html( Status::activity_line( $status ) ) . $warnings,
            ],
            'dokan_mcp_connector_url'        => [
                'label' => __( 'Connector URL', 'dokan-lite' ),
                'desc'  => '<code>' . esc_html( $status['endpoint'] ) . '</code><br>'
                    . esc_html__( 'Add this to the assistant as an HTTP MCP server, signed in with HTTP Basic authentication.', 'dokan-lite' )
                    . ' '
                    . ( $status['vendor_access']
                        ? esc_html__( 'Vendors use the same URL with their own login.', 'dokan-lite' )
                        : esc_html__( 'Only store admins can connect while vendor access is off.', 'dokan-lite' ) ),
            ],
            'dokan_mcp_application_password' => [
                'label' => __( 'Application Password', 'dokan-lite' ),
                'desc'  => Status::application_password_html( $status ),
            ],
            'dokan_mcp_api_key'              => [
                'label' => __( 'WooCommerce API Key', 'dokan-lite' ),
                'desc'  => Status::api_key_html( $status ),
            ],
        ];
    }

    /**
     * Replace saved model ids that a provider has since retired.
     *
     * @since 5.1.2
     *
     * @param array  $values     Section setting values.
     * @param string $section_id Section id.
     *
     * @return mixed Untouched when the section is not the AI section.
     */
    public function remap_retired_model_values( $values, $section_id ) {
        if ( 'dokan_ai' !== $section_id || ! is_array( $values ) ) {
            return $values;
        }

        $manager = dokan_get_container()->get( Manager::class );

        foreach ( [ Model::SUPPORTS_TEXT, Model::SUPPORTS_IMAGE ] as $type ) {
            $prefix = $manager->get_type_prefix( $type );

            foreach ( $manager->get_engines( $type ) as $provider_id => $provider ) {
                $key = 'dokan_ai_' . $prefix . $provider_id . '_model';

                if ( ! $provider instanceof Provider || empty( $values[ $key ] ) || ! is_scalar( $values[ $key ] ) ) {
                    continue;
                }

                // A retired model id is not among the select options, so it would render blank.
                if ( ! $provider->has_model_id( $type, (string) $values[ $key ] ) ) {
                    $values[ $key ] = $provider->get_default_model_id_by_type( $type );
                }
            }
        }

        return $values;
    }

    /**
     * Render AI section in Dokan settings
     *
     * @param array $sections
     * @return array
     */
    public function render_appearance_section( array $sections ): array {
        $sections[] = [
            'id'                   => 'dokan_ai',
            'title'                => __( 'AI Assist', 'dokan-lite' ),
            'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/dokan-ai.svg',
            'description'          => __( 'Dokan AI Assist', 'dokan-lite' ),
            'document_link'        => 'https://dokan.co/docs/wordpress/settings/dokan-ai-assistant/',
            'settings_title'       => __( 'AI Assist Settings', 'dokan-lite' ),
            'settings_description' => __( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ),
        ];

        return $sections;
    }

    /**
     * Render AI settings fields
     *
     * @param array $settings_fields
     * @return array
     */
    public function render_ai_settings( array $settings_fields ): array {
        $text_providers = dokan()->get_container()->get( Manager::class )->get_text_supported_providers();

        $settings_fields['dokan_ai'] = [
            'dokan_ai_product_info'               => [
                'name'          => 'dokan_ai_product_info',
                'type'          => 'sub_section',
                'label'         => __( 'AI Product Info Generator', 'dokan-lite' ),
                'description'   => __( 'Let vendors generate product info by AI', 'dokan-lite' ),
                'content_class' => 'sub-section-styles',
            ],
            'dokan_ai_engine' => [
                'name'    => 'dokan_ai_engine',
                'label'   => __( 'Engine', 'dokan-lite' ),
                'type'    => 'select',
                'options' => array_map(
                    fn( $provider ) => $provider->get_title(),
                    $text_providers
                ),
                'desc'    => __( 'Select which AI provider to use for generating content.', 'dokan-lite' ),
                'default' => 'openai',
                'is_lite' => true,
            ],
        ];

        foreach ( $text_providers as $provider_id => $provider ) {
            $settings_fields['dokan_ai'][ 'dokan_ai_' . $provider_id . '_api_key' ] = [
                'name'    => 'dokan_ai_' . $provider_id . '_api_key',
                // translators: %s is the provider name, e.g., OpenAI
                'label'   => sprintf( __( '%s API Key', 'dokan-lite' ), $provider->get_title() ),
                'type'    => 'text',
                /* translators: 1: OpenAi Link */
                'desc'    => sprintf( __( 'You can get your API Keys in your <a href="%1$s" target="_blank">%2$s Account.</a>', 'dokan-lite' ), $provider->get_api_key_url(), $provider->get_title() ),
                'default' => '',
                'secret_text' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => $provider_id,
                    ],
                ],
                'tooltip' => __( 'Your API key provides secure access to the AI service. Usage costs will be charged to the connected account.', 'dokan-lite' ),
            ];

            $settings_fields['dokan_ai'][ 'dokan_ai_' . $provider_id . '_model' ] = [
                'name'    => 'dokan_ai_' . $provider_id . '_model',
                'label'   => __( 'Model', 'dokan-lite' ),
                'type'    => 'select',
                'options' => array_map( fn( $model ) => $model->get_title(), $provider->get_models_by_type( Model::SUPPORTS_TEXT ) ),
                'desc'    => __( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ),
                'default' => $provider instanceof Provider ? $provider->get_default_model_id_by_type( Model::SUPPORTS_TEXT ) : '',
                'is_lite' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => $provider_id,
                    ],
                ],
            ];
        }

        return apply_filters( 'dokan_ai_settings_fields', $settings_fields );
    }

    /**
     * Map REST API classes
     *
     * @param array $class_map
     * @return array
     */
    public function rest_api_class_map( array $class_map ): array {

        $class_map[ DOKAN_DIR . '/includes/Intelligence/REST/AIRequestController.php' ] = 'WeDevs\Dokan\Intelligence\REST\AIRequestController';

        return $class_map;
    }
}
