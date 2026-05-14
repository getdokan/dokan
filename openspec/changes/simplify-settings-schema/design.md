## Context

PR #3003 (dokan-lite `feat/admin-settings`) and PR #4789 (dokan-pro) redesigned admin settings with a deep OOP architecture:

**Backend (PHP):** `SettingsElement` abstract base class (601 lines) → `Field` abstract (203 lines) → 35 field-type classes. `ElementFactory` with class map and ReflectionClass. `ElementTransformer`/`LegacyTransformer` for OOP-to-array conversion. `SettingsMapper` for old↔new key mapping. `AbstractPage`/`PageInterface` hierarchy with page classes (General, Transaction, Vendor, Appearance, Compliance + Pro pages).

**Frontend (React):** 61 custom field component files under `src/admin/dashboard/pages/settings/Elements/` — custom renderers for every field type that duplicate what `@wedevs/plugin-ui`'s Settings component already provides.

**Current state on `develop`:** The old `includes/Admin/Settings.php` god class defines settings via `get_settings_sections()` (7 sections) and `get_settings_fields()` (flat arrays). Storage uses monolithic `wp_options` keys: `dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_pages`, `dokan_appearance`, `dokan_privacy`. The helper `dokan_get_option($option, $section, $default)` is called ~557 times across Lite and Pro. Direct `get_option('dokan_*')` calls exist in ~144 places.

**Constraint:** The `feat/admin-settings` branch contains the correct field metadata — IDs, variants, options, defaults, validations, dependency keys, and the complete old-to-new `SettingsMapper` with ~130 mapping entries. This metadata must be preserved; only the delivery mechanism (OOP vs plain arrays) changes.

## Goals / Non-Goals

**Goals:**
- Remove the OOP class hierarchy (~53 PHP files, ~61 frontend files)
- Settings defined as flat PHP arrays — readable, zero learning curve, matches plugin-ui's `SettingsElement` type 1:1
- Add `SchemaValidator` for schema correctness at registration time
- Frontend uses `@wedevs/plugin-ui` Settings component directly
- Maintain `hook_key` filter extensibility for Pro/third-party
- Keep REST controller functional (GET schema, PUT save)
- Full backward compatibility: `dokan_get_option()` works unchanged, legacy Vue UI works via adapter, old third-party filters still fire

**Non-Goals:**
- Rewriting the legacy Vue `Settings.vue` component (stays, served via LegacyAdapter)
- Changing the vendor settings API (v2 REST, per-store settings)
- Intercepting direct `get_option('dokan_*')` calls via `pre_option_*` hooks
- Supporting plugin downgrade/rollback to old format
- Redesigning the settings page layout or UX

## Decisions

### 1. Single filter for all settings

**Decision:** One WordPress filter `dokan_get_admin_settings_schema` collects the entire flat array. Lite builds its base array and passes it through. Pro hooks in and appends. No per-page functions, no classes, no interfaces.

**After:**
```php
$elements = dokan_get_lite_settings_schema(); // returns flat array
$schema = apply_filters('dokan_get_admin_settings_schema', $elements);
```

**Alternatives considered:**
- Per-page filter functions: rejected because it fragments the collection point, makes discovery harder, and requires callers to know which page filter to use.
- Class-per-page with `describe()` method: rejected because it's exactly the OOP pattern we're removing.

**Rationale:** Any PHP developer can read and append to an array. The format matches plugin-ui's `SettingsElement` type 1:1 — what you write in PHP is what the frontend receives.

### 2. Delete the OOP element hierarchy entirely

**Decision:** Delete the entire `includes/Admin/Settings/` directory from PR #3003 (53 files). Keep pre-existing `develop` files: `includes/Admin/Settings.php` (old god class), `includes/Abstracts/SettingsElement.php` (OnboardingSetup), `includes/Admin/OnboardingSetup/`.

**Rationale:** The classes exist to build array output from OOP objects. If the input is already an array, the hierarchy is unnecessary.

### 3. SchemaValidator — one class replaces 35 per-type validators

**Decision:** A single `SchemaValidator` class validates the flat array:
1. Required properties per type (page: id/type/label; subpage: +page_id; field: +variant+parent pointer)
2. Parent reference existence (every `page_id`/`section_id` references an existing element)
3. No duplicate IDs
4. Known variant check (warning for unknown)
5. `dependency_key` format (dot-path with subpage.section.field segments)

Disabled in production via `DOKAN_DISABLE_SCHEMA_VALIDATION` constant.

**Rationale:** Schema validation is a cross-cutting concern. A single class with clear rules is easier than 35 scattered implementations.

### 4. Frontend: plugin-ui Settings component

**Decision:** Delete all 61 files under `src/admin/dashboard/pages/settings/Elements/`. The page becomes:

```tsx
import { Settings } from '@wedevs/plugin-ui';

function AdminSettings() {
    const { schema, loading } = useSettingsSchema();
    return (
        <Settings
            schema={schema}
            onSave={(scopeId, _tree, flatValues) => saveSettings(scopeId, flatValues)}
            loading={loading}
            title={__('Dokan Settings', 'dokan-lite')}
            applyFilters={applyFilters}
        />
    );
}
```

Dokan-specific field types (e.g., `category_based_commission`) register via plugin-ui's `applyFilters` prop.

### 5. Per-subpage storage with dot-path dependency_key

**Decision:** Store as one `wp_options` row per subpage: `dokan_settings_{page}_{subpage}`. Values nested by section:
```php
// Option key: dokan_settings_general_marketplace
[
    'marketplace_settings' => [
        'vendor_store_url' => 'store',
    ],
]
```

The `dependency_key` encodes the storage path: `marketplace.marketplace_settings.vendor_store_url`. First segment = subpage (determines option key), remaining segments = nested path within the option value.

**Rationale:** Each subpage = one save operation in UI. Per-subpage granularity avoids writing the entire blob on every save. Field names can't collide across subpages.

### 6. Static MigrationMap with bidirectional lookup

**Decision:** A `MigrationMap` class with a static array mapping every old field to its new location. The map is derived from the existing `SettingsMapper::$map` on `feat/admin-settings` (~130 entries). Format:
```php
'dokan_general.custom_store_url' => [
    'option' => 'dokan_settings_general_marketplace',
    'section' => 'marketplace_settings',
    'field' => 'vendor_store_url',
    'transform' => null, // or 'merge_commission', 'split_banner', etc.
]
```

Plus `SECTION_FALLBACK` mapping old section IDs → default new option keys for unknown third-party fields.

Used by: one-time migration, `dokan_get_option()` shim, LegacyAdapter, ExtensionAdapter.

### 7. `dokan_get_option()` 4-step resolution

**Decision:** Rewrite `dokan_get_option($option, $section, $default)`:
1. **Migration map**: `MigrationMap::resolve($option, $section)` → read from new storage
2. **Section fallback**: `MigrationMap::get_section_fallback($section)` → check `_extensions` namespace
3. **Legacy fallback**: if `dokan_settings_schema_version` not set, read from `get_option($section)`
4. **Default**: return `$default`

Remove `dokan_admin_settings_rearrange_map()` — its logic is subsumed by MigrationMap.

Static caching (`$cache` array) avoids repeated `get_option()` within a single request.

### 8. LegacyAdapter for old Vue UI

**Decision:** A `LegacyAdapter` that bridges old Vue `Settings.vue` to new storage:
- `get_old_format_values()`: reads new storage, applies reverse migration (un-rename, un-merge, un-split), returns `{ dokan_general: {...}, dokan_selling: {...} }` arrays
- `save_from_old_format($section, $values)`: receives old-format payload, applies forward migration, writes new option keys
- `get_old_field_definitions()`: converts new schema back to old field definitions for Vue UI

Hooks into existing AJAX handlers (`dokan_get_setting_values`, `dokan_save_settings`).

### 9. ExtensionAdapter for third-party filters

**Decision:** Fires `dokan_settings_fields` and `dokan_settings_sections` during schema build. Diffs against known Lite/Pro fields. Unknown additions are converted via `FieldTypeMapper` (`switcher`→`switch`, `radio_image`→`customize_radio`, etc.) and placed under `_extensions` section in the mapped subpage.

### 10. One-time Migrator

**Decision:** Runs on plugin activation/upgrade when `dokan_settings_schema_version` is not `2.0`:
1. Acquire transient lock
2. Read all 7 old option keys
3. Iterate migration map, apply forward transforms (rename, merge, split)
4. Write new per-subpage option keys
5. Unknown fields → `_extensions` namespace
6. Set `dokan_settings_schema_version = 2.0`
7. Old option keys preserved (NOT deleted)

Idempotent: skips if version already set.

## Risks / Trade-offs

**[Risk] Pro plugin depends on OOP API** — Pro's settings pages use `ElementFactory`, field-type classes, and `AbstractPage`.
→ Mitigation: Pro must be updated in lockstep. The change is mechanical — convert OOP field creation to flat arrays. hook_keys stay the same.

**[Risk] Custom field types from Pro** — Pro may have custom field types registered via the factory's field mapper filter.
→ Mitigation: Handle via plugin-ui's `applyFilters` prop for field extensibility. Audit Pro for custom types before proceeding.

**[Risk] Migration map completeness** — Missing entries mean `dokan_get_option()` returns defaults instead of actual values.
→ Mitigation: Integration test verifies every old field has a mapping. Generate map from both old `get_settings_fields()` output and `SettingsMapper::$map`.

**[Risk] Direct `get_option('dokan_*')` callers get stale data** — ~144 call sites bypass the helper. After migration, old option keys are frozen snapshots.
→ Mitigation: Audit and update all direct calls in Lite and Pro. Old options preserved so they return pre-migration values rather than breaking.

**[Risk] Save race during migration** — If legacy UI saves while migration is in progress, data written to old keys.
→ Mitigation: Transient lock during migration. LegacyAdapter checks lock before saving.

**[Trade-off] No type safety for settings arrays** — Plain arrays have no IDE autocompletion.
→ Acceptable: WordPress developers are accustomed to array-based APIs. SchemaValidator catches errors at runtime. plugin-ui TypeScript types provide safety on the frontend.
