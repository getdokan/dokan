<?php
namespace WeDevs\Dokan\Captcha\Providers;

use WeDevs\Dokan\Captcha\AbstractProvider;

/**
 * Google reCAPTCHA v3 provider implementation.
 *
 * Handles readiness, asset registration, field rendering, and server-side
 * verification against Google's reCAPTCHA v3 API.
 *
 * @since 4.3.0
 */
class GoogleRecaptchaV3Provider extends AbstractProvider {
    /**
     * Get the unique provider slug.
     *
     * @return string
     */
    public function get_slug(): string {
        return 'google_recaptcha_v3';
    }

    /**
     * Get the human-readable provider name.
     *
     * @return string
     */
    public function get_label(): string {
        return __( 'Google reCAPTCHA v3', 'dokan-lite' );
    }

    /**
     * Compute readiness based on enable flag and presence of credentials.
     *
     * @return bool
     */
    protected function compute_readiness(): bool {
        $site    = $this->get_option( 'recaptcha_site_key', '' );
        $secret  = $this->get_option( 'recaptcha_secret_key', '' );
        if ( empty( $site ) || empty( $secret ) ) {
            return false;
        }
        return true;
    }

    /**
     * Register and enqueue front-end assets needed for reCAPTCHA execution.
     *
     * @return void
     */
    public function register_assets(): void {
        // The handle is already registered in Assets::get_scripts() as 'dokan-google-recaptcha'.
        if ( ! $this->is_ready() ) {
            return;
        }
        $site = $this->get_option( 'recaptcha_site_key', '' );
        if ( empty( $site ) ) {
            return;
        }
        // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion,WordPress.WP.EnqueuedResourceParameters.NotInFooter
        wp_enqueue_script( 'dokan-google-recaptcha', 'https://www.google.com/recaptcha/api.js?render=' . $site, [ 'dokan-util-helper' ] );
        wp_localize_script( 'dokan-google-recaptcha', 'dokan_google_recaptcha', [ 'recaptcha_sitekey' => $site ] );
    }

    /**
     * Render field HTML for a given context.
     *
     * For reCAPTCHA v3, no visible widget is required, so this returns an
     * empty string. The token is injected into an existing hidden field.
     *
     * @param string $context Action/context key.
     * @param array  $args    Optional arguments.
     *
     * @return string HTML markup.
     */
    public function render_field_html( string $context, array $args = [] ): string {
        return "<input type='hidden' name='dokan_recaptcha_token' class='dokan_recaptcha_token'>";
    }

    /**
     * Validate a front-end token against Google's siteverify API.
     *
     * @param string $context Expected action name used during execute().
     * @param string $token   Token returned by reCAPTCHA.
     *
     * @return bool True on valid verification; false otherwise.
     */
	public function validate( string $context, string $token ): bool {
        $secret = $this->get_option( 'recaptcha_secret_key', '' );
        if ( empty( $context ) || empty( $token ) || empty( $secret ) ) {
            return false;
        }
        $siteverify    = 'https://www.google.com/recaptcha/api/siteverify';
        $response      = wp_remote_get( $siteverify . '?secret=' . $secret . '&response=' . $token );
        $response_body = wp_remote_retrieve_body( $response );
        $response_data = json_decode( $response_body, true );

        if ( empty( $response_data['success'] ) ) {
            return false;
        }
        if ( empty( $response_data['action'] ) || $context !== $response_data['action'] ) {
            return false;
        }
        $min_eligible_score = apply_filters( 'dokan_recaptcha_minimum_eligible_score', 0.5, $context );
        if ( empty( $response_data['score'] ) || $response_data['score'] < $min_eligible_score ) {
            return false;
        }
        return (bool) $response_data['success'];
    }

    /**
     * Convert a truthy-ish value to boolean.
     *
     * @param mixed $value Value to evaluate.
     *
     * @return bool
     */
	protected function to_bool( $value ): bool {
        $truthy = [ 'yes', 1, '1', 'true', 'on' ];
        if ( is_bool( $value ) ) {
            return $value;
        }
        $value = strtolower( (string) $value );
        return in_array( $value, $truthy, true );
    }

    /**
     * Provider-specific admin settings fields to be merged into the Appearance section.
     * Return an associative array of fields similar to Admin\Settings get_settings_fields structure.
     *
     * @return array Associative array keyed by setting field keys.
     */
    public function get_admin_settings_fields(): array {
        return [
            'google_recaptcha_v3_validation_label' => [
                'name'          => 'google_recaptcha_v3_validation_label',
                'type'          => 'social',
                'label'         => __( 'Google reCAPTCHA v3 Validation', 'dokan-lite' ),
                'desc'          => sprintf(
                    /* translators: 1) Opening anchor tag, 2) Closing anchor tag */
                    __( '%1$sGoogle reCAPTCHA v3%2$s credentials required to enable captcha for contact forms.', 'dokan-lite' ),
                    '<a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer">',
                    '</a>'
                ),
                'icon_url'      => DOKAN_PLUGIN_ASSEST . '/images/google.svg',
                'social_desc'   => __( 'Connect your Google reCAPTCHA v3 credentials here.', 'dokan-lite' ),
                'recaptcha_site_key' => [
                    'name'         => 'recaptcha_site_key',
                    'type'         => 'text',
                    'label'        => __( 'Site Key', 'dokan-lite' ),
                    'tooltip'      => __( 'Insert Google reCAPTCHA v3 site key.', 'dokan-lite' ),
                    'social_field' => true,
                    'is_lite'      => true,
                ],
                'recaptcha_secret_key' => [
                    'name'         => 'recaptcha_secret_key',
                    'type'         => 'text',
                    'label'        => __( 'Secret Key', 'dokan-lite' ),
                    'tooltip'      => __( 'Insert Google reCAPTCHA v3 secret key.', 'dokan-lite' ),
                    'social_field' => true,
                    'is_lite'      => true,
                ],
                'is_lite' => true,
            ],
        ];
    }
}
