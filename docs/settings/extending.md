# Dokan Settings — Extending the Admin Settings

> **Note (DOKAN_NEXT_MAJOR):** The `dependency_key` attribute has been removed
> from the settings schema. Use the field's `id` directly. `show_if` and
> `dependencies` rule keys are now flat field ids — dot-paths are no longer
> supported. See the [dependency_key cleanup plan][cleanup-plan] for migration
> context.
>
> [cleanup-plan]: https://github.com/getdokan/dokan/blob/refactor/simplify-settings-to-flat-array/docs/superpowers/plans/2026-05-18-dependency-key-cleanup.md

> This guide covers the CSV-driven settings migration layer that bridges the legacy
> per-page `dokan_*` wp_options to the new flat `dokan_settings` wp_option.

## Quick reference

- **New flat option:** `dokan_settings`
- **Legacy per-page options:** `dokan_general`, `dokan_selling`, `dokan_withdraw`, etc. (30 sections)
- **Bridge class:** `WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge`
- **Bootstrap listener:** `WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap` (wires `update_option_dokan_settings`)
- **Generated schema:** `includes/Admin/Settings/Schema/Generated/csv_fields.php` (do not edit by hand)
- **Generator:** `tools/migration/generate_schema_fragment.php`
- **Feature flag:** wp_option `dokan_csv_schema_enabled` (default `false`)

## Adding a new field to the migration

The CSV at `tools/migration/Settings.Mapping.-.fields_extracted_fixed.csv` (frozen) is the source of truth for the 225-field migration. To add a NEW field beyond the CSV:

### Option A — register via filter (preferred for addons)

```php
add_filter( 'dokan_legacy_settings_key_mapping', function ( array $map ): array {
    $map['my_addon_new_id'] = [
        'option' => 'my_addon_legacy_option',
        'field'  => 'my_addon_field',
    ];
    return $map;
} );
```

This adds the mapping at runtime without modifying the generated fragment. The bridge picks it up for both directions (legacy save → `dokan_settings`, and `dokan_settings` write → mirrored back to legacy option).

### Option B — extend the schema directly

Hand-author the field in `includes/Admin/Settings/Schema/SettingsSchema.php` with a `legacy_key` attribute:

```php
[
    'type'       => 'field',
    'id'         => 'my_new_field',
    'label'      => 'My new field',
    'legacy_key' => [
        'option' => 'dokan_general',
        'field'  => 'my_field',
    ],
],
```

The bridge harvests this on next `populate_values()` call.

## Legacy address forms

Two legacy_key shapes are supported:

```php
// Struct form (preferred):
'legacy_key' => [ 'option' => 'dokan_general', 'field' => 'site_logo' ]

// Dotted-string form (required for deep paths into nested arrays):
'legacy_key' => 'dokan_geolocation.location.latitude'
```

The dotted string is split on `.`. The first segment is the `wp_option` name; every remaining segment is a path inside the option's array. So `dokan_geolocation.location.latitude` corresponds to `$data['dokan_geolocation']['location']['latitude']`.

`LegacyAddress::parse()` (`includes/Admin/Settings/Migration/LegacyAddress.php`) handles both forms uniformly.

## Bridge-only fields

For fields that should survive at the bridge layer (round-trip between legacy and new option storage) but should NOT appear as visible elements in the new UI:

```php
[
    'bridge_only' => true,
    'id'          => 'bridge_only_my_field',
    'legacy_key'  => [ 'option' => 'dokan_general', 'field' => 'my_field' ],
],
```

Used for legacy fields that haven't been assigned a new home in the UI hierarchy yet. The CSV has 8 such entries (see `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md`).

## Transformers (for shape-changing fields)

If the legacy storage shape differs structurally from the new value shape (e.g. legacy stores a keyed array, new schema wants a flat list), implement `TransformerInterface`:

```php
namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

final class MyTransformer implements TransformerInterface {
    public function to_new( $legacy_value ) {
        // Convert legacy shape → new shape
        return array_keys( $legacy_value );
    }

    public function to_legacy( $new_value ) {
        // Convert new shape → legacy shape
        return array_fill_keys( $new_value, '' );
    }
}
```

Then in the field declaration:

```php
[
    'type'               => 'field',
    'id'                 => 'my_field',
    'legacy_key'         => [ 'option' => 'dokan_general', 'field' => 'my_field' ],
    'legacy_transformer' => MyTransformer::class,
]
```

The bridge resolves the transformer via DI container (falls back to direct instantiation) and applies it in both directions. Default is `PassThroughTransformer`.

## Lite/Pro gating

CSV-derived fields carry an `is_lite` flag (sourced from the CSV's `OtherInfoJSON.is_lite`). When `dokan()->is_pro_exists()` returns `false` (or the `dokan_is_pro_exists` filter does), generated entries with `is_lite: false` are filtered out of `SettingsSchema::get_schema()`.

Hand-authored elements without an `is_lite` key are NOT filtered — backward compatibility preserved.

## Debugging propagation failures

If a field's value doesn't propagate as expected:

1. **Check the bridge mapping.** Call `$bridge->get_mapping()` and look for your new id. If absent, the field wasn't harvested — verify `legacy_key` is present in the schema element.
2. **Check the BridgeBootstrap listener.** The listener fires on `update_option_dokan_settings`. If reverse propagation isn't happening, confirm the bootstrap is registered (it's a `Hookable` in `AdminSettingsServiceProvider`).
3. **Check for reentry-guard suppression.** If you save dokan_settings inside a `write_new_to_legacy` flow, the static guard prevents recursion. That's intentional — but if you accidentally chain save handlers, the guard may swallow the second write.
4. **Check `is_lite` gating.** If your field is invisible, it may be filtered by Pro gating. Verify your field has `is_lite: true` (or no `is_lite` key) when Pro is inactive.

## Testing

Per-tab tests live at `tests/php/src/Admin/Settings/Schema/Tab/*SchemaTest.php`. Each tab test:

- Asserts the expected field count
- Verifies all legacy_keys map to real legacy options
- Round-trips every field (legacy → new and new → legacy)
- Pins cross-section isolation (write to one legacy option, others untouched)
- Adds tab-specific defensive tests (credential opaque round-trip, enum preservation, etc.)

When adding a new tab, mirror the existing pattern. The bridge regression suite (`LegacySettingsBridgeTest`, `LegacyAddressTest`, `GeneratedFragmentTest`) must stay green.

## Known limitations & follow-ups

See `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md` "Migration status" section for the current state of the migration, including the REST PUT parent-chain gap that blocks the production flag flip.
