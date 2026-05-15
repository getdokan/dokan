# Legacy Settings Bridge — Design

**Date:** 2026-05-15
**Branch:** `refactor/simplify-settings-to-flat-array`
**Status:** Approved (pending spec review)

## Context

Dokan's admin settings are mid-migration from a per-page nested wp_options model (`dokan_general`, `dokan_selling`, `dokan_appearance`, …) to a single flat `dokan_settings` option keyed by field id. The new UI (plugin-ui based, see `2026-05-14-plugin-ui-settings-v1-design.md`) saves only through `AdminSettingsController` to the new option. To smooth rollout, users can toggle back to the **legacy view**, which continues to save via the existing AJAX path to the old per-page options.

This document specifies a bridge class that keeps both stores coherent without violating the constraint that the new option is written only by code paths routed through the new REST controller (or via this bridge, called from the legacy AJAX handler).

## Goals

- New option is the source of truth on reads.
- Legacy AJAX saves write to the old per-page option AND propagate the mapped slice into `dokan_settings`.
- New UI saves remain unaffected — they continue to write only `dokan_settings`.
- 3rd-party addons (Dokan Pro, others) can declare their own legacy mappings without coupling to this class.
- Missing values fall back to schema defaults, not `null`.

## Non-Goals

- One-shot upgrade-time migration. Reconciliation is on-demand at read/save time.
- Cleanup or deletion of legacy `dokan_*` options. They remain for as long as the legacy view ships.
- A combined "reconcile both sides" method. The two directions have different overwrite policies and are intentionally separate methods.
- Telemetry / CLI dump of the mapping. Both deferred until evidence of need.

## Class

**Name:** `WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge`
**File:** `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
**Dependency:** `WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry` (constructor-injected).
**Container binding:** registered in `AdminSettingsServiceProvider` as a shared service so reads and writes within a single request share the lazy mapping cache.

## Key Mapping

### Representation

The bridge maintains a single internal map keyed by new flat field id:

```php
[
    'banner_width' => [
        'option' => 'dokan_appearance',
        'field'  => 'store_banner_width',
    ],
    'commission_type' => [
        'option' => 'dokan_selling',
        'field'  => 'commission_type',
    ],
    // ...
]
```

Plus a reverse index built in the same pass:

```php
// $by_option['dokan_appearance'] => [ new_key => old_field, ... ]
```

Plus a defaults index:

```php
// $defaults['banner_width'] => 400
```

### Sources (hybrid, per Q4-C)

1. **Per-field `legacy_key` attribute on the new schema.** Authoring path for every "normal" mapping. Attribute accepts the dotted-string convenience form (`'dokan_appearance.store_banner_width'`); the bridge splits on the first `.` into the internal struct.
2. **`dokan_legacy_settings_key_mapping` filter** on the assembled map. Escape hatch for legacy-only fields, bulk additions, non-`dokan_*` source options, or any case the attribute can't express.

### Addon extensibility

Pro and 3rd-party addons inject fields via the existing `dokan_settings_fields` filter. The bridge harvests `legacy_key` from the **post-filter** schema (same point `SchemaValidator` runs), so addons participate by simply adding the attribute to their field declarations. No knowledge of the bridge required.

### Construction

```php
private function build_map(): array {
    if ( $this->map !== null ) {
        return $this->map;
    }
    $map = $this->harvest_from_schema();
    $map = apply_filters( 'dokan_legacy_settings_key_mapping', $map );
    $this->map = $this->normalize( $map );
    return $this->map;
}
```

Lazy, built once per request, no transient or object-cache persistence.

### Validation logging

During normalization, the bridge logs via `dokan_log` when:
- A `legacy_key` is malformed (no `.` separator, empty parts) — the entry is dropped.
- Two new keys map to the same legacy address — both kept, but flagged as a likely rename mismatch.

The bridge does not fail-hard on mapping issues. A broken mapping degrades that field to "schema default" behavior, not site breakage.

## Public API

### 1. `transform_legacy_payload_to_new( string $option_name, array $legacy_payload ): array`

Called by the **legacy AJAX save handler** after sanitization. Returns the slice of new-flat keys to merge into `dokan_settings`.

```php
public function transform_legacy_payload_to_new( string $option_name, array $legacy_payload ): array {
    $slice = [];
    foreach ( $this->get_new_keys_for_option( $option_name ) as $new_key => $old_field ) {
        if ( array_key_exists( $old_field, $legacy_payload ) ) {
            $slice[ $new_key ] = $legacy_payload[ $old_field ];
        }
    }
    return $slice;
}
```

Uses `array_key_exists`, not `isset`, so explicit `null` / `false` values from unchecked switches are preserved.

The caller performs the `update_option( 'dokan_settings', array_merge( $existing, $slice ), true )`. The bridge never writes.

### 2. `hydrate_new_from_legacy( array $new_option ): array`

Called by the **new read path** (REST GET / wherever the new option is loaded). Fills missing new keys from mapped legacy options, then falls back to schema default. **Never overwrites** existing new-option values.

```php
public function hydrate_new_from_legacy( array $new_option ): array {
    $missing_by_option = [];
    foreach ( $this->build_map() as $new_key => $addr ) {
        if ( array_key_exists( $new_key, $new_option ) ) {
            continue;
        }
        $missing_by_option[ $addr['option'] ][ $new_key ] = $addr['field'];
    }
    foreach ( $missing_by_option as $option_name => $pairs ) {
        $legacy = get_option( $option_name, [] );
        $legacy = is_array( $legacy ) ? $legacy : [];
        foreach ( $pairs as $new_key => $old_field ) {
            $new_option[ $new_key ] = array_key_exists( $old_field, $legacy )
                ? $legacy[ $old_field ]
                : $this->get_schema_default( $new_key );
        }
    }
    return $new_option;
}
```

Legacy `get_option` calls are batched by option name — one read per distinct legacy option, regardless of how many mapped fields it sources.

### 3. `hydrate_legacy_from_new( string $option_name, array $legacy_option ): array`

Called by the **legacy view's read path** when the user toggles to legacy. Pulls current new-option values into the legacy-shaped array so the legacy UI reflects saves made via the new UI. Asymmetric: **does** overwrite legacy values when the new option has them, because the new option is source of truth.

```php
public function hydrate_legacy_from_new( string $option_name, array $legacy_option ): array {
    $new_option = get_option( 'dokan_settings', [] );
    $new_option = is_array( $new_option ) ? $new_option : [];
    foreach ( $this->get_new_keys_for_option( $option_name ) as $new_key => $old_field ) {
        if ( array_key_exists( $new_key, $new_option ) ) {
            $legacy_option[ $old_field ] = $new_option[ $new_key ];
        }
    }
    return $legacy_option;
}
```

### 4. `get_mapping(): array`

Introspection only. Returns the normalized map. Used by tests and the existing settings-trace tooling.

### Intentionally absent

- No combined `map_data($old, $new)` method (the third function in the original pseudocode). Conflates two different overwrite policies; replaced by the two `hydrate_*` methods.
- No `migrate_all()` / one-shot pass. Bidirectional sync replaces it.
- No filter hooks fired by the bridge itself on read/write. Extension is via the schema filter and the mapping filter only.

## Schema-Default Lookup

A `[field_id => default]` index is built in the same pass that harvests `legacy_key`, populated from each `type === 'field'` element's `default` attribute (or `null` if absent). O(1) lookup at hydrate time. No second schema walk.

```php
private function get_schema_default( string $new_key ) {
    return $this->defaults[ $new_key ] ?? null;
}
```

This replaces the buggy `$new_settings[$new_key]['default'] ?? null` in the original pseudocode, which read `['default']` off a value that doesn't exist yet at that point.

## Call Sites

| Call site | Method | Notes |
|---|---|---|
| `AdminSettingsController::get_item()` | `hydrate_new_from_legacy()` | Wrap the existing `get_option('dokan_settings')` result before returning to the React app. |
| Legacy AJAX save handler (Dokan_Settings or sibling — exact location confirmed in the implementation plan) | `transform_legacy_payload_to_new()` + caller-side merge into `dokan_settings` | Runs after the existing per-page `update_option`. |
| Legacy view read path / `dokan_get_option()` helper | `hydrate_legacy_from_new()` | Wraps the result of `get_option('dokan_appearance', [])` (etc.) before legacy render. |
| `AdminSettingsController::update_item()` | none | New writes touch only `dokan_settings`. Bridge intentionally not involved. |

## Failure Modes

| Scenario | Behavior |
|---|---|
| `SettingsRegistry::get_schema()` fails validation | Bridge cannot build its map. Same failure mode as the new UI — surfaced by the existing schema validator. No silent degradation. |
| `legacy_key` references a typo'd option name | The `get_option` call returns `[]`, hydrate falls through to schema default. Logged via `dokan_log` during normalization. |
| Two new keys map to the same legacy address | Both kept in the map; logged as a warning. Last write to legacy still propagates to both new keys on legacy-save (different new keys, same source field — intentional fan-out). |
| `legacy_key` malformed (no `.`, empty parts) | Entry dropped during normalization, logged. That field hydrates to its schema default and ignores legacy on save. |
| `dokan_settings` not yet seeded (fresh install / post-rollback) | `hydrate_new_from_legacy` fills entirely from legacy + defaults. First REST GET returns a complete new-shape array; first REST PUT seeds the new option. |

## Testing

Unit tests against the bridge in isolation, using Brain Monkey to stub `get_option` and a minimal fixture schema injected via a mock `SettingsRegistry`.

Coverage matrix:
- `hydrate_new_from_legacy`: new-present (no overwrite), new-absent + legacy-present (adopt legacy), new-absent + legacy-absent (schema default).
- `hydrate_legacy_from_new`: new-present (overwrites legacy), new-absent (legacy untouched).
- `transform_legacy_payload_to_new`: present fields propagate, absent fields drop, explicit `null` / `false` / `''` propagate.
- Mapping construction: `legacy_key` attribute harvested, `dokan_legacy_settings_key_mapping` filter additions present, malformed entries dropped + logged.
- Reverse index: `get_new_keys_for_option` returns only entries for the requested option.

No new Playwright specs. Existing settings save/load specs exercise the integrated read/write paths once wiring lands.

## Out of Scope

- WP-CLI command to dump the mapping (defer until needed by support).
- Telemetry counting legacy-fallback hits per field (could live in `intelligence` later).
- Eventual removal of legacy `dokan_*` options after legacy view is retired.
