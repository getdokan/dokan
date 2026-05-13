# Dokan Captcha System: Migration Guide & Roadmap

This single document explains how to migrate from the legacy Google reCAPTCHA v3 implementation to the new provider-based Captcha system in Dokan 4.0.8 and outlines future improvements.

- Target audience: Theme/plugin developers and site maintainers
- Applies to: Dokan Lite ≥ DOKAN_SINCE


## TL;DR

- Resolve the Captcha Manager from the container: `dokan_get_container()->get(\WeDevs\Dokan\Captcha\Manager::class)`
- Do not use removed helper functions.
- Keep the hidden input named `dokan_recaptcha_token` in forms.
- The provider injects any extra form markup via the `dokan_contact_form` action.
- Let the Manager handle scripts via `->register_assets()`.
- Choose a provider and set credentials in Admin → Dokan → Settings → Appearance.


## What Changed

Previously, reCAPTCHA v3 support was procedural and Google-only. The new system:

- Introduces a provider-based architecture
  - `WeDevs\Dokan\Captcha\ProviderInterface`
  - `WeDevs\Dokan\Captcha\AbstractProvider` (optional base)
  - `WeDevs\Dokan\Captcha\Manager` (service facade)
  - Built-in providers:
    - `WeDevs\Dokan\Captcha\Providers\GoogleRecaptchaV3Provider`
    - `WeDevs\Dokan\Captcha\Providers\CloudflareTurnstileProvider`
- Is resolved from Dokan’s DI container (no singletons)
- Registers providers via the `dokan_captcha_providers` filter so third parties can add providers
- Delegates assets, markup, and validation to the active provider
- Adds general Captcha settings plus provider-specific settings in the Appearance section


## Removed/Deprecated Helpers

The following legacy functions were removed and should not be used anymore:

- `dokan_get_recaptcha_site_and_secret_keys()`
- `dokan_handle_recaptcha_validation()`
- `dokan_captcha()`

Replace these with the Manager service (see examples below).


## Admin Settings Overview

Navigate to: WP Admin → Dokan → Settings → Appearance

- Enable Captcha Service: `captcha_enable_status` (on/off)
- Captcha Provider: `captcha_provider`
  - `google_recaptcha_v3`
  - `cloudflare_turnstile`
- Google reCAPTCHA v3 fields (legacy-compatible)
  - `recaptcha_enable_status`
  - `recaptcha_site_key`
  - `recaptcha_secret_key`
- Cloudflare Turnstile fields
  - `turnstile_enable_status`
  - `turnstile_site_key`
  - `turnstile_secret_key`

Providers can contribute fields via `Manager::filter_settings_fields()` and `ProviderInterface::get_admin_settings_fields()`.


## Frontend Integration

- The Store Contact Form (templates/widgets/store-contact-form.php) contains:
  - Hidden input: `<input type="hidden" name="dokan_recaptcha_token" class="dokan_recaptcha_token">`
  - Action hook: `do_action( 'dokan_contact_form', $seller_id );`
- The Manager echoes provider markup into the form via the `dokan_contact_form` hook.
- `Assets::enqueue_front_scripts()` asks the Manager to register/enqueue provider assets for store/product pages.
- For Google reCAPTCHA v3, token generation is handled by `window.dokan_execute_recaptcha()` (already included in Dokan helper JS). For Cloudflare Turnstile, the visible widget writes the token into the same hidden field.


## Server-side Validation

The AJAX handler validates the token via the Manager:

```php
$captcha_manager = dokan_get_container()->get( \WeDevs\Dokan\Captcha\Manager::class );
$is_valid = $captcha_manager && $captcha_manager->get_active_provider()
    ? $captcha_manager->validate( 'dokan_contact_seller_recaptcha', $recaptcha_token )
    : false;
```


## Minimal Migration Steps

1) Remove legacy helper function calls
- Stop calling `dokan_get_recaptcha_site_and_secret_keys()`, `dokan_handle_recaptcha_validation()`, `dokan_captcha()`.

2) Resolve the Manager from the container
```php
$manager = dokan_get_container()->get( \WeDevs\Dokan\Captcha\Manager::class );
```

3) Register/enqueue assets through the Manager
```php
$manager->register_assets();
```

4) Render fields/markup via hooks or helper method
- Prefer letting the Manager print provider HTML via `dokan_contact_form`.
- If you need manual rendering:
```php
echo $manager->render_field_html( 'your_context_key' );
```

5) Validate tokens server-side through the Manager
```php
$is_valid = $manager->validate( 'your_context_key', $token );
```

6) Ensure your forms have the hidden token input
- Keep `<input type="hidden" name="dokan_recaptcha_token" class="dokan_recaptcha_token">` or adapt your own input name and pass the value to `$manager->validate()`.

7) Configure the provider in Admin settings
- Choose a provider and supply credentials. Ensure `captcha_enable_status` is on.


## Example: Custom Form Integration

Server-side controller:
```php
$manager = dokan_get_container()->get( \WeDevs\Dokan\Captcha\Manager::class );
if ( $manager && $manager->get_active_provider() ) {
    $token = isset( $_POST['dokan_recaptcha_token'] ) ? wp_unslash( $_POST['dokan_recaptcha_token'] ) : '';
    if ( ! $manager->validate( 'my_custom_form', $token ) ) {
        wp_send_json_error( 'Captcha validation failed' );
    }
}
```

View (form):
```php
<?php do_action( 'dokan_contact_form', 0 ); // reuses provider injection ?>
<input type="hidden" name="dokan_recaptcha_token" class="dokan_recaptcha_token">
```

Assets (when rendering the page):
```php
$manager->register_assets();
```


## Extending: Add a New Provider

1) Implement `ProviderInterface` (or extend `AbstractProvider`)
- `get_slug()`: unique slug
- `get_label()`: human-readable name
- `is_ready()`: handled by `AbstractProvider` via `compute_readiness()`
- `register_assets()`: enqueue/register scripts
- `render_field_html()`: output visible widget markup if needed
- `validate( $context, $token )`: return true/false after remote verification
- `get_admin_settings_fields()`: settings array merged into Appearance

2) Register the provider via filter
```php
add_filter( 'dokan_captcha_providers', function( $providers ) {
    $providers[] = \Vendor\Package\MyProvider::class; // or new instance
    return $providers;
});
```

3) Optional: implement `WeDevs\Dokan\Contracts\Hookable` and register hooks if needed.


## Backward Compatibility Notes

- Default provider falls back to Google reCAPTCHA v3 if none is selected.
- Existing hidden field name `dokan_recaptcha_token` is retained.
- The JS helper `window.dokan_execute_recaptcha()` still exists and is used for the v3 flow.


## Troubleshooting

- Provider not working
  - Verify `captcha_enable_status` is on and credentials are present.
  - Check that your active provider is selected.
  - Ensure the form contains the hidden token field and that `Manager->register_assets()` has been called on that page.

- Token missing/empty
  - For reCAPTCHA v3, confirm `dokan-google-recaptcha` is enqueued and `grecaptcha.execute` runs before submit.
  - For Turnstile, confirm the widget renders and the callback fills the hidden field.

- Validation fails repeatedly
  - For reCAPTCHA v3, ensure the action/context key used in `validate()` matches the action used in `grecaptcha.execute()`.
  - Ensure the server has outbound connectivity to Google/Cloudflare APIs.


## References

- Providers
  - `includes/Captcha/ProviderInterface.php`
  - `includes/Captcha/AbstractProvider.php`
  - `includes/Captcha/Providers/GoogleRecaptchaV3Provider.php`
  - `includes/Captcha/Providers/CloudflareTurnstileProvider.php`
- Manager and integration points
  - `includes/Captcha/Manager.php`
  - `includes/Assets.php` (calls `Manager->register_assets()`)
  - `includes/Ajax.php` (validates tokens via Manager)
- Container/Service Providers
  - `includes/DependencyManagement/Providers/CaptchaServiceProvider.php`
  - `includes/DependencyManagement/Providers/ServiceProvider.php`


---
