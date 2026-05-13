<?php
namespace WeDevs\Dokan\Captcha;

/**
 * Captcha provider contract.
 */
interface ProviderInterface {
    /** Unique slug for this provider, e.g. 'google_recaptcha_v3' */
    public function get_slug(): string;

    /** Human readable provider name */
    public function get_label(): string;

    /** Whether this provider is ready to be used (enabled + has credentials) */
    public function is_ready(): bool;

    /**
     * Register any needed assets (scripts/styles) and do any localization.
     * It should be safe to call multiple times.
     */
    public function register_assets(): void;

    /**
     * Render the captcha field/widget markup for a given context.
     * Should return HTML string to be printed into forms.
     *
     * @param string $context  Action/context key for the form, e.g. 'dokan_contact_seller_recaptcha'
     * @param array  $args     Extra arguments if needed.
     */
    public function render_field_html( string $context, array $args = [] ): string;

    /**
     * Validate user response/token.
     *
     * @param string $context Action/context key used when rendering/executing the captcha
     * @param string $token   Token or response from front-end
     *
     * @return bool True if valid, false otherwise
     */
    public function validate( string $context, string $token ): bool;

    /**
     * Provider-specific admin settings fields to be merged into the Appearance section.
     * Return an associative array of fields similar to Admin\Settings get_settings_fields structure.
     *
     * @return array Associative array keyed by setting field keys.
     */
    public function get_admin_settings_fields(): array;
}
