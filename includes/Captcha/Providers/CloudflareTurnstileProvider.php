<?php
namespace WeDevs\Dokan\Captcha\Providers;

use WeDevs\Dokan\Captcha\AbstractProvider;

/**
 * Cloudflare Turnstile provider implementation.
 *
 * Handles readiness, asset injection, field rendering, and server-side
 * verification against Cloudflare's Turnstile API.
 *
 * @since 4.3.0
 */
class CloudflareTurnstileProvider extends AbstractProvider {
    /**
     * Get the unique provider slug.
     *
     * @return string
     */
	public function get_slug(): string {
        return 'cloudflare_turnstile';
    }

    /**
     * Get the human-readable provider name.
     *
     * @return string
     */
	public function get_label(): string {
        return __( 'Cloudflare Turnstile', 'dokan-lite' );
    }

    /**
     * Compute readiness based on enable flag and presence of credentials.
     *
     * @return bool
     */
	protected function compute_readiness(): bool {
        $site    = $this->get_option( 'turnstile_site_key', '' );
        $secret  = $this->get_option( 'turnstile_secret_key', '' );
        if ( empty( $site ) || empty( $secret ) ) {
            return false;
        }
        return true;
    }

    /**
     * Register and enqueue Turnstile API and helper script.
     *
     * @return void
     */
	public function register_assets(): void {
        if ( ! $this->is_ready() ) {
            return;
        }
        $site = $this->get_option( 'turnstile_site_key', '' );
        // Register & enqueue Turnstile API
        $handle = 'dokan-turnstile-api';
        if ( ! wp_script_is( $handle, 'registered' ) ) {
            // @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#1-add-the-turnstile-script
            // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- Version handled by Cloudflare CDN.
            wp_register_script( $handle, 'https://challenges.cloudflare.com/turnstile/v0/api.js', [], null, true );
        }
        wp_enqueue_script( $handle );

        // Add a tiny inline helper to set token into the hidden input when solved (for contact form)
        $inline = "window.dokanTurnstileSetToken = function(token){ try{ var el = document.querySelector('form .dokan_recaptcha_token'); if(el){ el.value = token; } }catch(e){} }";
        wp_add_inline_script( $handle, $inline, 'after' );
    }

    /**
     * Render the Turnstile widget markup for a given context.
     *
     * @param string $context Action/context key.
     * @param array  $args    Optional arguments.
     *
     * @return string HTML markup to output in the form.
     */
	public function render_field_html( string $context, array $args = [] ): string {
        if ( ! $this->is_ready() ) {
            return '';
        }
        $site = esc_attr( (string) $this->get_option( 'turnstile_site_key', '' ) );
        // Visible widget keeps things simple and avoids extra JS. Token will be set via callback above when solved
        $html = '<div class="cf-turnstile" data-sitekey="' . $site . '" data-callback="dokanTurnstileSetToken"></div>';
        $html .= '<input type="hidden" name="dokan_recaptcha_token" class="dokan_recaptcha_token">';
        return $html;
    }

    /**
     * Validate a Turnstile response token via Cloudflare verification API.
     *
     * @param string $context Context key (not used by Turnstile but kept for interface parity).
     * @param string $token   Token returned by Turnstile widget.
     *
     * @return bool True if verification is successful, false otherwise.
     */
	public function validate( string $context, string $token ): bool {
        $secret = $this->get_option( 'turnstile_secret_key', '' );
        if ( empty( $token ) || empty( $secret ) ) {
            return false;
        }
        $response = wp_remote_post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify', [
				'body' => [
					'secret' => $secret,
					'response' => $token,
				],
			]
        );
        if ( is_wp_error( $response ) ) {
            return false;
        }
        $response_body = wp_remote_retrieve_body( $response );
        $data = json_decode( $response_body, true );
        return ! empty( $data['success'] );
    }

    /**
     * Provide Turnstile-related admin settings fields for Dokan Appearance.
     *
     * @return array
     */
	public function get_admin_settings_fields(): array {
        return [
			'turnstile_validation_label' => [
				'name'          => 'turnstile_validation_label',
				'type'          => 'social',
				'label'         => __( 'Cloudflare Turnstile Validation', 'dokan-lite' ),
				'desc'          => sprintf(
					/* translators: 1) Opening anchor tag, 2) Closing anchor tag */
					__( '%1$sTurnstile%2$s credentials required to enable captcha for contact forms.', 'dokan-lite' ),
					'<a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noopener noreferrer">',
					'</a>'
				),
				'icon_url'      => DOKAN_PLUGIN_ASSEST . '/images/cloudflare.png',
				'social_desc'   => __( 'Connect your Cloudflare Turnstile credentials here.', 'dokan-lite' ),
				'turnstile_site_key' => [
					'name'         => 'turnstile_site_key',
					'type'         => 'text',
					'label'        => __( 'Site Key', 'dokan-lite' ),
					'tooltip'      => __( 'Insert Cloudflare Turnstile site key.', 'dokan-lite' ),
					'social_field' => true,
					'is_lite'      => true,
				],
				'turnstile_secret_key' => [
					'name'         => 'turnstile_secret_key',
					'type'         => 'text',
					'label'        => __( 'Secret Key', 'dokan-lite' ),
					'tooltip'      => __( 'Insert Cloudflare Turnstile secret key.', 'dokan-lite' ),
					'social_field' => true,
					'is_lite'      => true,
				],
				'is_lite' => true,
			],
        ];
    }
}
