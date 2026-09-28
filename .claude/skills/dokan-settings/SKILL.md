---
name: dokan-settings
description: Implementation patterns for the Dokan admin settings system — flat-array schema, single-option storage, and `@wedevs/plugin-ui` rendering. Use when adding settings fields, custom field renderers, pages/subpages, or debugging "Unsupported field type" / dependency / save issues.
---

# Dokan Settings — Implementation Skill

The new admin settings system has three layers. Knowing which layer owns what saves time.

```
┌─────────────────────────────────────────────────────────────┐
│ Backend (PHP, dokan-lite)                                   │
│  • SettingsSchema::get_schema()  → flat array of elements   │
│  • SettingsRegistry              → auto-gen keys, populate  │
│                                    values, run validator    │
│  • SchemaValidator               → check structure + unique │
│                                    field ids                │
│  • AdminSettingsController       → REST GET/PUT             │
│  • Storage: single `dokan_settings` wp_option, keyed by id  │
└─────────────────────────────────────────────────────────────┘
                              ↕  REST: /dokan/v1/admin/settings
┌─────────────────────────────────────────────────────────────┐
│ Frontend (TypeScript, dokan-lite)                           │
│  • src/admin/dashboard/pages/settings/index.tsx             │
│       — fetches schema, renders <Settings>, URL sync        │
│  • register-fields.tsx                                       │
│       — addFilter calls for Dokan-unique variants           │
│  • fields/Dokan*.tsx                                        │
│       — custom variant renderers (plugin-ui prop signature) │
└─────────────────────────────────────────────────────────────┘
                              ↕  filter hooks
┌─────────────────────────────────────────────────────────────┐
│ @wedevs/plugin-ui (npm dep, source in /plugin-ui)           │
│  • <Settings> component — provider + sidebar + content      │
│  • formatSettingsData()  — rebuilds dep_keys as dot-paths   │
│  • evaluateDependencies() — supports id-keyed lookup        │
│  • useSettings()         — exposes updateValue, etc.        │
└─────────────────────────────────────────────────────────────┘
```

## Storage Model

- **One wp_option:** `dokan_settings`, autoloaded.
- **Shape:** `array<string, mixed>` keyed by field `id`. NOT nested. NOT per-page.
- Moving a field between pages/sections requires zero data migration — only a schema edit.
- Field IDs MUST be globally unique. `SchemaValidator::check_unique_field_ids()` enforces this hard.
- A `fieldgroup` element MAY share an `id` with its inner `field` (existing pattern, e.g., `google_map_api_key`). Only `type === 'field'` enters the uniqueness check.

### Legacy Mirror (downgrade safety)

- `dokan_admin_settings` is canonical, but with the **legacy mirror** enabled (default) the legacy `dokan_*` rows keep a physical copy of every mapped value:
  - `LegacyMirror` (Hookable, `includes/Admin/Settings/Migration/LegacyMirror.php`) listens on `dokan_admin_settings_changed` and writes changed values through to the legacy rows via `LegacySettingsBridge::write_new_to_legacy()`.
  - Legacy-section saves (`dokan_save_legacy_settings_section()`) no longer strip mapped keys from the row.
  - On `admin_init`, `LegacyMirror::maybe_reconcile()` compares the raw rows against a baseline snapshot (`dokan_admin_settings_legacy_snapshot`) and adopts keys an OLD plugin version edited while the bridge was absent (downgrade → edit → re-upgrade). Last write wins.
- Single-line switch back to the strict single-source model (strip on, mirror + reconcile off): `add_filter( 'dokan_admin_settings_legacy_mirror', '__return_false' );`
- Pitfall: raw-row writes must run inside `BridgeBootstrap::without_overlay()` — with the overlay active, `update_option()`'s internal old-value read is projected from the flat option, so a physically-stale row looks current and the write silently no-ops.

## Adding a New Setting Field

1. **Declare in `SettingsSchema.php`** under the appropriate page's helper:
   ```php
   [
       'id'         => 'my_unique_field_id',   // MUST be globally unique
       'type'       => 'field',
       'variant'    => 'text',                 // or any plugin-ui built-in
       'section_id' => 'some_existing_section',
       'title'      => esc_html__( 'My Field', 'dokan-lite' ),
       'default'    => '',
   ],
   ```
2. No `storage_key` on pages. No `dependency_key` on fields — `SettingsRegistry::generate_keys()` sets `dependency_key = id` automatically for new fields.
3. **Plugin-ui built-in variants** (no custom renderer needed): `text`, `number`, `textarea`, `rich_text`, `select`, `switch`, `radio_capsule`, `customize_radio`, `multicheck` (alias `checkbox_group`), `checkbox_group_preview`, `color_picker`, `base_field_label`, `show_hide`, `html`, `notice`, `info`, `copy_field`, `combine_input`, `switch_group`, `wp_media_upload`, `wp_media_upload_multiple`, `google_analytics`.

## Adding a Custom Field Variant (Lite)

1. **Component** at `src/admin/dashboard/pages/settings/fields/DokanMyVariant.tsx`:
   ```tsx
   import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';

   export default function DokanMyVariant({ element }: { element: SettingsElement }) {
       const { updateValue } = useSettings();
       const value = element.value ?? element.default ?? '';

       return (
           <input
               value={ value as string }
               onChange={ ( e ) =>
                   updateValue( element.dependency_key!, e.target.value )
               }
           />
       );
   }
   ```
2. **Registration** in `src/admin/dashboard/pages/settings/register-fields.tsx`, inside `registerSettingsFields()`:
   ```tsx
   addFilter(
       'dokan_settings_my_variant_field',
       'dokan-lite/my-variant',
       ( _defaultComponent, element ) => (
           <DokanMyVariant element={ element } />
       )
   );
   ```
3. **Filter name format:** `dokan_settings_<variant>_field`. The `<Settings>` component is invoked with `hookPrefix="dokan"`, and plugin-ui internally fires `${hookPrefix}_settings_${variant}_field`.

## Adding a Custom Field Variant in Pro

Pro is in a separate webpack bundle with its OWN copy of `@wedevs/plugin-ui`. The two bundles have different React contexts, so `useSettings()` from Pro CANNOT see Lite's `<Settings>` provider — calling it throws "useSettings must be used within a `<Settings>` component."

**Fix:** receive `onChange` as a prop instead of using the hook.

1. **Registration** in Pro's live bundle entry (find it via `dokan-pro/webpack-entries.js` — NOT the legacy `assets/src/js/...` tree which is dead code):
   ```tsx
   import { addFilter } from '@wordpress/hooks';
   import MyProField from './path/to/MyProField';

   addFilter(
       'dokan_settings_my_pro_variant_field',
       'dokan-pro/my-pro-variant',
       ( defaultComponent: any, element: any ) => (
           <MyProField
               element={ element }
               onChange={ defaultComponent?.props?.onChange }
           />
       )
   );
   ```
   `defaultComponent` is plugin-ui's `<FallbackField {...fieldProps} />`. The `onChange` prop on `fieldProps` is `updateValue` — pluck it from the React element's `.props` and forward.

2. **Component** uses `onChange` as a prop:
   ```tsx
   export default function MyProField({ element, onChange }: {
       element: any;
       onChange?: (key: string, value: any) => void;
   }) {
       const handle = (newValue: any) => {
           if ( ! element.dependency_key || ! onChange ) return;
           onChange( element.dependency_key, newValue );
       };
       // ...
   }
   ```

## Dependencies (visibility / conditional fields)

Plugin-ui's `formatSettingsData()` rebuilds `dependency_key` as a **parent-path dot-path** (e.g., `commission.commission.commission_type`). It overrides the backend's `dependency_key`.

Plugin-ui's `evaluateDependencies()` (patched) accepts BOTH formats:
1. Dot-path: `'key' => 'commission.commission.commission_type'`
2. Plain field id: `'key' => 'commission_type'` (resolved via the schema-derived id index)

**Recommend plain ids for new declarations.** They're shorter, stable across structural moves, and resolve to the same field via plugin-ui's id index.

## URL-Driven Navigation

The SettingsPage syncs `page_id`, `subpage_id`, `tab_id` query params to/from plugin-ui's active-scope state. Implementation in `index.tsx`:

- `initialPage` prop from `?page_id=` on mount (plugin-ui's native prop).
- `onNavigate` callback writes `page_id` on top-level navigation.
- A `<UrlSync />` companion component (mounted INSIDE the provider via `renderSaveButton`) uses `useSettings()` to drive subpage/tab state from/to `subpage_id` / `tab_id` params. Plugin-ui doesn't expose `initialSubpage` / `onSubpageNavigate` directly, so this round-trip is the workaround.

## Hook Lifecycle on Save

`AdminSettingsController::update_item()` fires two actions for backwards compatibility with Pro listeners that registered `accepted_args=3` (before) and `accepted_args=4` (after):

```php
do_action( 'dokan_before_saving_settings', $page_id, $sanitized, 'dokan_settings' );
// ... update_option( 'dokan_settings', $merged, true ) ...
do_action( 'dokan_after_saving_settings', $page_id, $sanitized, 'dokan_settings', $merged );
```

`'dokan_settings'` is the literal storage key (preserves the old `$storage_key` slot). Listeners that gate on `$option_name === 'dokan_general'` (or similar legacy keys) silently no-op — they only ever fired for the old Vue/AJAX save path.

## Pitfalls (Don't Repeat These)

| Symptom | Cause | Fix |
|---|---|---|
| "Unsupported field type: X" fallback shows despite registration | `hookPrefix` produces wrong filter name. With `hookPrefix="dokan_settings"` plugin-ui fires `dokan_settings_settings_X_field` (note doubled `_settings_`). | Use `hookPrefix="dokan"` on `<Settings>`. |
| "useSettings must be used within a `<Settings>` component" error | Pro's bundle has its own plugin-ui instance and React context. | Pass `onChange` from `defaultComponent.props.onChange` as a prop instead of calling `useSettings()` in Pro. |
| PUT save returns 500 with `ArgumentCountError` | Action hook signature changed from 3/4 args to 2/3 args. Pro listeners with `accepted_args=3` fatal. | Keep `dokan_before/after_saving_settings` at 3/4 args. Pass `'dokan_settings'` as the storage-key arg. |
| Save payload sends dot-path keys (`marketplace.foo.bar`), controller can't find field | Plugin-ui's `formatSettingsData` rebuilds `dependency_key` as a dot-path, ignoring what backend sent. | Controller falls back to last-segment of dot-path when direct lookup misses. Done in `AdminSettingsController::update_item()`. |
| Field id collision silently overwrites another field | Two `type === 'field'` elements with the same `id` in the merged schema. | `SchemaValidator::check_unique_field_ids()` hard-fails the build with a clear error message. Rename one. |
| Schema build returns errors after `dokan_settings_fields` filter | A Pro/3rd-party callback returned a malformed shape. | Validator runs after the filter; it surfaces the malformed element. Fix the callback. |
| Stale Pro bundle loaded in browser despite `npm run build` | WordPress enqueue uses the `version` from `*.asset.php`. New bundle = new version = new `?ver=` query → forces cache bust. | If the URL still shows the old `?ver=`, hard-refresh (Cmd-Shift-R) or check that PHP enqueue reads the latest `.asset.php`. |
| Edits to plugin-ui source don't show up | Pro/Lite consume `dist/index.js`. Source changes need `cd /plugin-ui && npm run build` to refresh dist, then `rsync` to consumer's `node_modules/@wedevs/plugin-ui/dist/`. | Use `rsync -a --delete /plugin-ui/dist/ <consumer>/node_modules/@wedevs/plugin-ui/dist/` after each plugin-ui rebuild. `npm link` is uncooperative because the package was installed from GitHub. |

## Reference Specs

Detailed design + plan docs (when present):
- `docs/superpowers/specs/2026-05-14-plugin-ui-settings-v1-design.md` — frontend rebuild.
- `docs/superpowers/specs/2026-05-14-flat-single-option-storage-design.md` — backend storage refactor.
- `docs/superpowers/plans/2026-05-14-flat-single-option-storage.md` — implementation plan.

## Pre-Commit Checks

```bash
# PHP
composer phpcs              # in dokan-lite (or dokan-pro)

# JS/TS (project excludes tests/ from PHPCS via phpcs.xml.dist)
npm run lint:js -- <changed files>

# Build before testing in browser
npm run build               # in dokan-lite OR dokan-pro depending on which side changed
# If plugin-ui source changed, also:
cd .../plugin-ui && npm run build
rsync -a --delete .../plugin-ui/dist/ .../dokan-lite/node_modules/@wedevs/plugin-ui/dist/
```

## When to Invoke This Skill

- Adding any new settings field (Lite or Pro).
- "Unsupported field type" or other rendering issues in the new admin settings UI.
- Save/dependency/visibility bugs in the settings page.
- Onboarding to the settings-rebuild branch.
- Before editing any of: `SettingsSchema.php`, `SettingsRegistry.php`, `SchemaValidator.php`, `AdminSettingsController.php`, `src/admin/dashboard/pages/settings/**`, or any Pro `addFilter('dokan_settings_*_field', ...)` block.
