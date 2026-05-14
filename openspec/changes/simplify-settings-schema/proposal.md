## Why

The admin settings redesign (PR #3003 on dokan-lite, PR #4789 on dokan-pro) introduced an over-engineered OOP architecture: 35+ PHP field-type classes each extending an abstract `SettingsElement` with factory pattern and ReflectionClass instantiation, plus 61 custom React field components that duplicate what `@wedevs/plugin-ui`'s Settings component already provides. Adding a simple text field requires understanding class hierarchies, abstract methods, and a factory registry — a steep learning curve for a configuration layer that should be declarative. The `feat/admin-settings` branch contains the correct field metadata (IDs, variants, options, defaults, validations, dependency_keys) but wrapped in unnecessary class hierarchies. This change strips the OOP layer, converts definitions to plain PHP arrays, and reuses the shared Settings component on the frontend.

## What Changes

- **Delete the entire `includes/Admin/Settings/` directory** (~53 PHP files from PR #3003): Elements/ (35 field-type classes, ElementFactory, structural classes), Pages/ (AbstractPage, PageInterface, all page classes), transformers, mapper, and Settings.php orchestrator. Pre-existing files on `develop` — `includes/Admin/Settings.php` (old god class), `includes/Abstracts/SettingsElement.php` (OnboardingSetup), `includes/Admin/OnboardingSetup/` — are NOT touched.
- **Delete custom frontend field components** (~61 files under `src/admin/dashboard/pages/settings/Elements/`): DokanNumber, DokanSelect, DokanSwitcher, CustomizeRadio/, FieldParser, etc. All duplicated by plugin-ui.
- **Replace with plain PHP arrays via single filter**: Lite defines base settings as a flat array matching plugin-ui's `SettingsElement` type and passes through `apply_filters('dokan_get_admin_settings_schema', $elements)`. Pro and extensions append to the same array. Zero class hierarchies.
- **Add SchemaValidator**: Single class validating the flat array — required props per type, parent reference existence, duplicate IDs, known variant check, dependency_key format.
- **Simplify REST controller**: `AdminSettingsController` serves the flat array directly on GET, parses flatValues with variant-based sanitization on PUT. No tree building or element-to-array transformation.
- **Frontend uses `@wedevs/plugin-ui` Settings component**: `<Settings schema={schema} onSave={handleSave} />` — no custom field renderers needed.
- **New per-subpage storage**: `wp_options` keys like `dokan_settings_general_marketplace` with values nested by section, replacing old monolithic keys (`dokan_general`, `dokan_selling`, etc.).
- **MigrationMap + Migrator**: Static bidirectional mapping of every `(old_section, old_field)` → `(new_option_key, new_section, new_field)` with transforms for renames, merges, splits. One-time migration on plugin update.
- **`dokan_get_option()` compatibility shim**: 4-step resolution (migration map → section fallback → legacy fallback → default) preserving all ~557 call sites across Lite and Pro unchanged.
- **LegacyAdapter**: Bridges old Vue Settings.vue UI to new storage — reads new format → reconstructs old section arrays for AJAX get; receives old format saves → decomposes into new option writes.
- **ExtensionAdapter + FieldTypeMapper**: Old `dokan_settings_fields`/`dokan_settings_sections` filters still fire for third-party extensions. Unknown fields are converted to new schema nodes via type mapping (`switcher`→`switch`, `radio_image`→`customize_radio`, etc.) and placed under `_extensions` namespace.

## Capabilities

### New Capabilities

- `flat-array-schema`: Settings defined as plain PHP arrays collected via a single `dokan_get_admin_settings_schema` filter. Registry fires hook_key filters for granular extension, populates values from storage, and a SchemaValidator checks correctness.
- `plugin-ui-integration`: Frontend settings page uses `@wedevs/plugin-ui` Settings component directly, passing the schema array from the REST endpoint. No custom field renderers.
- `settings-migration`: MigrationMap data structure, one-time Migrator, and `dokan_get_option()` compatibility shim that bridges old call sites to new per-subpage storage format.
- `settings-legacy-adapter`: Bidirectional adapter for the legacy Vue UI and old third-party filter compatibility. Converts old format ↔ new format for reads, writes, and field definitions. Includes ExtensionAdapter and FieldTypeMapper for third-party extension support.

### Modified Capabilities

_(none — no existing specs to modify)_

## Impact

- **Deleted PHP files**: ~53 files in `includes/Admin/Settings/` (from PR #3003). Pre-existing `includes/Admin/Settings.php`, `includes/Abstracts/SettingsElement.php`, `includes/Admin/OnboardingSetup/` are preserved.
- **Deleted frontend files**: ~61 files under `src/admin/dashboard/pages/settings/Elements/`
- **Modified PHP files**: `AdminSettingsController.php` (simplified), `AdminSettingsServiceProvider.php` (fewer registrations), `includes/functions.php` (`dokan_get_option` rewritten, `dokan_admin_settings_rearrange_map` removed)
- **New PHP files**: `SchemaValidator.php`, `MigrationMap.php`, `Migrator.php`, `LegacyAdapter.php`, `ExtensionAdapter.php`, `FieldTypeMapper.php`, plus the base schema definition function
- **Storage**: ~33 new `wp_options` rows (`dokan_settings_*`); old keys preserved read-only
- **Dependencies**: `@wedevs/plugin-ui` becomes a direct frontend dependency
- **Pro plugin**: Must replace page classes with plain array definitions (mechanical conversion). hook_key filters continue to work. ~377 `dokan_get_option()` calls work unchanged via shim.
- **Third-party extensions**: Old `dokan_settings_fields`/`dokan_settings_sections` filters still work via ExtensionAdapter. `dokan_get_option()` still works via shim.
- **Database**: One-time migration adds new option rows; old rows kept as safety net
- **REST API**: `GET/PUT /dokan/v1/admin/settings` endpoints simplified but same routes
