## Why

The `simplify-settings-schema` change shipped the backend flat-array schema (REST controller, registry, `SettingsSchema`) but the frontend swap to `@wedevs/plugin-ui`'s `<Settings>` component was reverted by commit `08d60f36b` because the Tailwind v4 migration (PR getdokan/dokan#3087) hadn't landed yet. Tailwind v4 is now on `develop` (`659ff61fa`), unblocking the integration.

The current settings page at `src/admin/dashboard/pages/settings/` is 62 files (~5,800 LOC) of hand-rolled structural components (Menu, Tab, Section, SubSection, FieldGroup, SettingsParser, PageHeading), a 295-line FieldParser dispatcher, and 43 field renderers — most of which duplicate what plugin-ui's `<Settings>` already provides out of the box. The `simplify-settings-schema` tasks §2 (delete frontend Elements) and §7 (integrate plugin-ui) were marked complete in `tasks.md` but the actual state on disk is the hand-rolled implementation. This change supersedes those sections with the real work needed.

This change adopts a strict **decoupling principle**: backend's only responsibility is producing the schema JSON via `apply_filters('dokan_settings_fields', $elements)`; frontend's only responsibility is rendering that JSON. The two halves communicate exclusively through REST. No PHP hooks fire from JS context, no JS knows about backend filter names, no backend knows about render mechanics.

## What Changes

- **Replace `src/admin/dashboard/pages/settings/index.tsx`** with a thin page entry that fetches the schema from `GET /dokan/v1/admin/settings`, renders `<Settings schema onSave loading title applyFilters />` from `@wedevs/plugin-ui`, and posts saves back via `PUT /dokan/v1/admin/settings/{scopeId}`.
- **Delete ~24 redundant Dokan field renderers** that duplicate plugin-ui's built-in variants: DokanTextField, DokanNumber, DokanTextArea, DokanRichText, DokanSelect, DokanSwitch, DokanRadioCapsule, CustomizeRadio (and its 6 sub-files), DokanColorPicker, DokanShowHideField, DokanMultiCheck, DokanCheckboxGroup, DokanFieldLabel, DokanFileUpload, Commission/CombineInput, DokanHtmlField, DokanNoticeField, DokanCopyButtonField, DokanInfoField.
- **Delete structural components** replaced by plugin-ui's internal layout: Menu.tsx, Tab.tsx, Section.tsx, SubSection.tsx, FieldGroup.tsx, SettingsParser.tsx, PageHeading.tsx, SettingsSkeleton.tsx, FieldParser.tsx.
- **Delete supporting files** with no remaining consumers: `components/SearchBar.tsx`, `components/icons/*`, `types.ts` (use plugin-ui's `SettingsElement` type).
- **Keep and adapt ~18 Dokan-unique field renderers** that plugin-ui doesn't cover: CategoryBasedCommission, DokanDoubleInput, DokanRepeater, DokanVendorInfoPreview, DokanSingleProductPreview, DokanRefreshSelectField, DokanCurrency, DokanScheduleTime, WithdrawSchedule, DokanTimePicker, DataClearField, DokanSocialButton, DokanSocialField, DokanWithdrawCharges, DokanList, DokanPassword, DokanRadio, DokanEmail, DokanTel. Adapt their prop signature from `{element, onValueChange, getSetting}` to plugin-ui's `{element, onChange}`, then register via `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)`.
- **Preserve Dokan-specific wrappers** around `<Settings>`: legacy settings URL link (DashboardSwitchLink), AdminNotices integration, `wp.hooks.applyFilters('dokan_admin_settings_active_page_id', ...)` for initialPage override, `wp.hooks.doAction('dokan_admin_settings_before_save_settings'/'after_save_settings', ...)` around the save handler, localStorage tab persistence via plugin-ui's `onNavigate` prop.
- **Backend PHP hook rename**: `apply_filters('dokan_get_admin_settings_schema', $elements)` becomes `apply_filters('dokan_settings_fields', $elements)`. No per-node `hook_key` filter firing — one global hook, one shape (flat array). This is a BC break for any existing callbacks on `dokan_settings_fields` (which currently receive the old sectioned-array shape from the legacy god class) — they must migrate to the new flat shape.
- **Defer**: The pattern Pro JS modules use to register their custom field renderers (per-variant filter vs. single dispatcher filter) is left undecided in this change and scoped to Lite only. Pro's 4 custom variants (`menu_manager`, `verification_methods`, `delivery_days`, `color_customizer`) will be handled in a follow-up change once the Lite integration is proven.
- **Untouched**: `src/stores/adminSettings/` (the 464 LOC `@wordpress/data` store stays as-is). Plugin-ui owns runtime values internally; the store still backs schema fetch and save coordination. A future change may slim it.

## Capabilities

### New Capabilities

- `frontend-plugin-ui-rendering`: Admin settings page renders via `@wedevs/plugin-ui`'s `<Settings>` component. Schema is fetched from REST, values are managed internally by plugin-ui, save goes back through REST. Dokan-specific field variants render via `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)`. Dokan-specific page wrappers (legacy link, notices, action hooks, tab persistence) remain outside the `<Settings>` component.

### Modified Capabilities

- `plugin-ui-integration` (from `simplify-settings-schema`): superseded by `frontend-plugin-ui-rendering`. The previous capability's Requirements assumed all custom field renderers would be removed entirely; the new capability accepts that ~18 Dokan-unique renderers must remain and registers them via filter hooks.
- `flat-array-schema` (from `simplify-settings-schema`): the PHP extension filter renames from `dokan_get_admin_settings_schema` to `dokan_settings_fields`, and per-node `hook_key` filter firing is removed. Backend invokes one filter, returning one flat array.

## Impact

- **Deleted frontend files**: ~37 of 62 files under `src/admin/dashboard/pages/settings/`
- **Kept frontend files (adapted)**: ~18 Dokan-unique field renderers, registered via filter
- **Modified frontend files**: `src/admin/dashboard/pages/settings/index.tsx` (rewritten as thin <Settings> wrapper)
- **Modified PHP**: `SettingsSchema.php` (filter name rename), `SettingsRegistry.php` if it fires per-node filters (remove)
- **BC break**: Any existing `dokan_settings_fields` callback on `develop` (legacy god-class hook) receives a new shape. Documented in CHANGELOG. Pro and 3rd-party Pro modules need updates — out of scope for this change but flagged.
- **No DB changes**: Storage layout from `simplify-settings-schema` unchanged. Migration tasks (§8–§11 of that change) remain in scope of that change, not this one.
- **No REST contract changes**: `GET/PUT /dokan/v1/admin/settings` endpoints unchanged.
- **Dependencies**: `@wedevs/plugin-ui` already in `package.json` (added via PR #3133 for DataViews).
- **Untouched (hard constraint)**: the legacy Vue settings UI. All 52 Vue files under `src/admin/` — including `src/admin/pages/Settings.vue` and every supporting component (`src/admin/components/Fields.vue`, `CombineInput.vue`, `RefreshSettingOptions.vue`, `Switches.vue`, etc.) — SHALL NOT be modified, moved, or deleted by this change. The Vue UI continues to operate as today.
- **Coexistence**: This change adds a second admin settings UI (plugin-ui React) alongside the existing Vue UI. Users can switch between them via the existing `legacy_settings_url` mechanism (extended in §3.5 of tasks.md to populate the PHP-side key). Both UIs remain functional.
- **Also untouched**: `src/stores/adminSettings/`, all Pro modules, the `dokan_get_option()` shim.
