<?php
namespace WeDevs\Dokan\Captcha;

use WeDevs\Dokan\Admin\Settings;
use WeDevs\Dokan\Captcha\Providers\GoogleRecaptchaV3Provider;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Captcha service manager.
 *
 * Central registry and facade for captcha providers. Handles provider selection,
 * asset registration, field rendering and server-side validation. Resolved via
 * Dokan DI container.
 *
 * @since 4.3.0
 */
class Manager implements Hookable {

    /** @var ProviderInterface[] */
    protected array $providers = [];

    /**
     * Register WordPress hooks used by the captcha system.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'register_providers_from_filter' ] );
        // Hook to render extra form fields if needed
        add_action( 'dokan_contact_form', [ $this, 'maybe_render_contact_form_field' ], 20 );

        // Allow providers to inject their settings fields into admin settings
        add_filter( 'dokan_settings_fields', [ $this, 'filter_settings_fields' ], 10, 2 );
    }

    /**
     * Resolve providers via filter and register them.
     *
     * @return void
     */
    public function register_providers_from_filter(): void {
        $default = [];
        $providers = apply_filters( 'dokan_captcha_providers', $default );
        if ( ! is_array( $providers ) ) {
            $providers = (array) $providers;
        }
        foreach ( $providers as $provider ) {
            if ( is_string( $provider ) && class_exists( $provider ) ) {
                $provider = new $provider();
            }
            if ( $provider instanceof ProviderInterface ) {
                $this->register_provider( $provider );
            }
        }
    }

    /**
     * Register a captcha provider instance.
     *
     * @param ProviderInterface $provider Provider instance implementing the contract.
     *
     * @return void
     */
    public function register_provider( ProviderInterface $provider ): void {
        $this->providers[ $provider->get_slug() ] = $provider;
    }

    /** Get active provider slug selected from settings */
    public function get_active_provider_slug(): string {
        $slug = function_exists( 'dokan_get_option' ) ? dokan_get_option( 'captcha_provider', 'dokan_appearance', 'google_recaptcha_v3' ) : 'google_recaptcha_v3';
        if ( empty( $slug ) || ! isset( $this->providers[ $slug ] ) ) {
            // Backward compatibility: default to google if provider not chosen
            $slug = 'google_recaptcha_v3';
        }
        return $slug;
    }

    /** Is captcha globally enabled? Falls back to provider-specific flag if global flag missing. */
    public function is_enabled(): bool {
        // Global flag
        $global = function_exists( 'dokan_get_option' ) ? dokan_get_option( 'captcha_enable_status', 'dokan_appearance', '' ) : '';
        if ( '' !== $global ) {
            return $this->to_bool( $global );
        }
        // Fallback: Google legacy flag
        $google_enabled = function_exists( 'dokan_get_option' ) ? dokan_get_option( 'recaptcha_enable_status', 'dokan_appearance', 'on' ) : 'on';
        return $this->to_bool( $google_enabled );
    }

    /** Return active provider instance, or null if not ready */
    public function get_active_provider(): ?ProviderInterface {
        $slug = $this->get_active_provider_slug();
        $provider = $this->providers[ $slug ] ?? null;
        if ( ! $provider ) {
            return null;
        }
        if ( ! $this->is_enabled() ) {
            return null;
        }
        if ( ! $provider->is_ready() ) {
            return null;
        }
        return $provider;
    }

    /** Enqueue/register assets for the active provider */
    public function register_assets(): void {
        $provider = $this->get_active_provider();
        if ( $provider ) {
            $provider->register_assets();
        }
    }

    /** Validate token for a context. */
    public function validate( string $context, string $token ): bool {
        $provider = $this->get_active_provider();
        if ( ! $provider ) {
            return false;
        }
        return $provider->validate( $context, $token );
    }

    /** Render hidden/widget field for forms if needed */
    public function render_field_html( string $context, array $args = [] ): string {
        $provider = $this->get_active_provider();
        if ( ! $provider ) {
            return '';
        }
        return $provider->render_field_html( $context, $args );
    }

    /** Echoes provider fields into contact form, keeping backward compatibility */
    public function maybe_render_contact_form_field( $seller_id ): void { // phpcs:ignore WordPress.NamingConventions.ValidVariableName
        echo $this->render_field_html( 'dokan_contact_seller_recaptcha', [ 'seller_id' => $seller_id ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    /**
     * Filter admin settings fields to append provider-specific settings under dokan_appearance.
     *
     * @param array $settings_fields Fields to be rendered in admin settings.
     * @param Settings $settings_instance Settings instance.
     *
     * @return array
     */
    public function filter_settings_fields( array $settings_fields, $settings_instance ): array {
        if ( ! isset( $settings_fields['dokan_appearance'] ) || ! is_array( $settings_fields['dokan_appearance'] ) ) {
            return $settings_fields;
        }
        $settings_fields['dokan_appearance']['captcha_enable_status'] = [
            'name'    => 'captcha_enable_status',
            'label'   => __( 'Enable Captcha Service', 'dokan-lite' ),
            'desc'    => __( 'Enable or disable captcha across forms that support it.', 'dokan-lite' ),
            'type'    => 'switcher',
            'default' => 'on',
        ];
        // Build provider options as slug => label
        $options = [];
        foreach ( $this->providers as $p ) {
            $options[ $p->get_slug() ] = $p->get_label();
        }

        $settings_fields['dokan_appearance']['captcha_provider'] = [
            'name'    => 'captcha_provider',
            'label' => __( 'Captcha Provider', 'dokan-lite' ),
            'type'  => 'select',
            'desc'  => __( 'Select the captcha provider to use for this store.', 'dokan-lite' ),
            'options' => $options,
            'default' => dokan_get_container()->get( GoogleRecaptchaV3Provider::class )->get_slug(),
            'show_if' => [
                'captcha_enable_status' => [
                    'equal' => 'on',
                ],
            ],
        ];

        foreach ( $this->providers as $provider ) {
            $fields = $provider->get_admin_settings_fields();
            foreach ( $fields as $key => $config ) {
                if ( ! isset( $settings_fields['dokan_appearance'][ $key ] ) ) {
                    // Show when global captcha enabled AND selected provider matches
                    $config['show_if'] = [
                        'captcha_enable_status' => [
                            'equal' => 'on',
                        ],
                        'captcha_provider' => [
                            'equal' => $provider->get_slug(),
                        ],
                    ];
                    $settings_fields['dokan_appearance'][ $key ] = $config;
                }
            }
        }

        return $settings_fields;
    }

    /** Utility */
    protected function to_bool( $value ): bool {
        $truthy = [ 'yes', 1, '1', 'true', 'on' ];
        if ( is_bool( $value ) ) {
            return $value;
        }
        $value = strtolower( (string) $value );
        return in_array( $value, $truthy, true );
    }
}
