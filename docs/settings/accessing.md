# Accessing settings

> Available since **DOKAN_SINCE**.

Dokan exposes a single, schema-aware, read-only API for reading settings from any PHP code in the plugin or in extensions:

```php
$value = dokan()->settings->get( 'vendor_store_url' );
```

## API

```php
dokan()->settings->get( string $key, $fallback = null );
dokan()->settings->has( string $key ): bool;
dokan()->settings->all(): array;
```

- `$key` is the flat schema id (the `id` field on a `SettingsElement` in `includes/Admin/Settings/Schema/SettingsSchema.php`). It is **not** the legacy section/field name from `dokan_get_option()`.
- `$fallback` is only used when `$key` is not registered in the schema. For registered keys the schema default is authoritative — do not pass a `$fallback` to override it.
- `all()` returns every registered field's effective value (stored value, or schema default when nothing is stored), keyed by id.

## Choosing the right key

For new code: look up the field id in `includes/Admin/Settings/Schema/SettingsSchema.php`. Use the `id` attribute.

For code migrating away from `dokan_get_option( $field, $section )`: find the schema entry whose `legacy_key` matches `($section, $field)`. The flat id you want is on the `id` attribute of that entry. The migration may also need a comparison-logic flip if the field uses a `legacy_transformer` (see the spec).

## Writes

Writes are **not** part of this API. The admin save pipeline continues to go through the REST controller and `SettingsRepository::update()`. Programmatic writes from code are out of scope and tracked in a follow-up design.

## Examples

```php
// Read with the schema default applied.
$slug = dokan()->settings->get( 'vendor_store_url' );

// Existence check.
if ( dokan()->settings->has( 'recaptcha_site_key' ) ) {
    // ...
}

// Snapshot of all settings.
$snapshot = dokan()->settings->all();
```
