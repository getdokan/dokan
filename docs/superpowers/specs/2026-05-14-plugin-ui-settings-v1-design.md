# Plugin-UI Settings v1 — Design

**Date:** 2026-05-14
**Branch:** `refactor/simplify-settings-to-flat-array`
**Status:** Approved

## Context

The backend half of the settings refactor has shipped on this branch: the flat-array schema (`includes/Admin/Settings/Schema/`), the `SettingsRegistry`, and the `AdminSettingsController` exposing `GET /dokan/v1/admin/settings` and `PUT /dokan/v1/admin/settings/{page_id}` are in place.

The frontend half has been removed entirely: 62 files under `src/admin/dashboard/pages/settings/` are deleted from the working tree (see `git status`). The directory is empty. The router at `src/admin/dashboard/components/Dashboard.tsx:12` still imports `SettingsPage` from `../pages/settings` and renders it at the `/settings` route (line 82), so the build is currently broken at that import.

The Vue legacy admin settings UI at `src/admin/pages/Settings.vue` and its 52 supporting files remain on disk and operational. They are reached through their own admin URL. The `@wordpress/data` store at `src/stores/adminSettings/` also remains on disk; five util files under `src/admin/dashboard/utils/settings*` import its `SettingsElement` type, so it is not orphaned.

`@wedevs/plugin-ui` is already a project dependency. Its `<Settings>` component ships 22 built-in field variants, sidebar navigation, content layout, save button, loading skeleton, mobile responsiveness, and a per-variant filter hook mechanism (`<hookPrefix>_settings_<variant>_field`) that fires for every variant including built-ins, with `FallbackField` rendered for unregistered unknown variants.

## Goal

Rebuild the admin settings page using plugin-ui's `<Settings>` component with the **smallest possible amount of code** that:

1. Resolves the three currently-broken imports.
2. Renders the schema returned by `GET /dokan/v1/admin/settings`.
3. Persists saves via `PUT /dokan/v1/admin/settings/{page_id}`.

The driver is maintenance reduction. v1 trades feature completeness for code economy. Whether this implementation eventually replaces the Vue legacy UI is deliberately deferred.

## Scope

### In Scope

- Create `src/admin/dashboard/pages/settings/index.tsx` — a single React file, default-exporting `SettingsPage`, rendering plugin-ui's `<Settings>`.
- Wire fetch + save against the existing REST endpoints.
- Delete the two orphaned re-export lines that point at deleted files.

### Out of Scope (for v1)

- Custom field renderers for Dokan-unique variants. All 14 unique variants render `FallbackField`.
- The four legacy extension points: `dokan_admin_settings_before_save_settings`, `dokan_admin_settings_after_save_settings`, `dokan_admin_settings_active_page_id`, and localStorage tab persistence.
- `<AdminNotices>` wrapper.
- `<DashboardSwitchLink>` back-to-Vue link.
- Any modification to `src/stores/adminSettings/`, Vue files, or `webpack-entries.js`.
- Per-field validation error UI surfacing (backend may return per-field errors; v1 logs them and lets the user retry).
- Repair of any pre-existing settings E2E tests under `tests/pw/` that broke when the settings directory was deleted.

## Architecture

### Single-file page entry

`src/admin/dashboard/pages/settings/index.tsx` is the only new code file. It default-exports a `SettingsPage` React component. The existing Dashboard router (`src/admin/dashboard/components/Dashboard.tsx:12,82`) auto-resolves the import the moment this file exists with a default export.

The component imports `Settings` from `@wedevs/plugin-ui`, `apiFetch` from `@wordpress/api-fetch`, `applyFilters` from `@wordpress/hooks`, `__` from `@wordpress/i18n`, and `useState` / `useEffect` from `@wordpress/element` (the established convention across `src/admin/dashboard/`). It imports nothing from `src/stores/adminSettings/`, nothing from `src/admin/dashboard/utils/`, and nothing from the deleted `Elements/` tree.

The render output is just `<Settings>` — no surrounding `<div>` with custom layout, no AdminNotices, no DashboardSwitchLink, no page header. Plugin-ui's `<Settings>` provides its own title row, sidebar, content area, save button, skeleton, and mobile drawer.

### Data flow

Component state held in two `useState` hooks:

- `schema: SettingsElement[]` — initialized to `[]`.
- `loading: boolean` — initialized to `true`.

**Mount:**
- `useEffect` issues `apiFetch({ path: '/dokan/v1/admin/settings' })`.
- On success: `setSchema(response)`, `setLoading(false)`.
- On rejection: `setLoading(false)`, `console.error(error)`. No UI error surface in v1.

**Render:**
- `<Settings schema={schema} loading={loading} title={__('Dokan Settings', 'dokan-lite')} hookPrefix="dokan_settings" applyFilters={applyFilters} onSave={handleSave} />`.
- Plugin-ui owns runtime field values, dirty state, and save-button enabled/disabled internally via its `SettingsProvider` context.

**Save:**
- Plugin-ui invokes `handleSave(scopeId, _treeValues, flatValues)` when the user clicks save.
- Handler calls `apiFetch({ path: '/dokan/v1/admin/settings/' + scopeId, method: 'PUT', data: { values: flatValues } })`.
- On success: no-op. Plugin-ui retains its current internal state; the response (full updated schema) is discarded for v1.
- On rejection: `console.error(error)`. No per-field error wiring — the backend returns validation errors via a 400 response with `errors` map, but v1 does not feed those back into the schema's `validationError` fields.

**Filter prefix:** `hookPrefix="dokan_settings"`. No filters are registered by this module. The prefix exists purely for forward-compatibility: Pro modules can later add `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)` without changes to this page entry.

## Cleanup of pre-existing broken JS

The deletion of `src/admin/dashboard/pages/settings/` left three broken references in the working tree. All three are addressed:

1. **Auto-resolves on creation of `index.tsx`:** `src/admin/dashboard/components/Dashboard.tsx:12` (import of `SettingsPage`). No file edit needed — the import succeeds the moment the new `index.tsx` exists with a default export.

2. **Delete line 24 of `src/components/index.tsx`:** the re-export `export { default as PageHeading } from '../admin/dashboard/pages/settings/Elements/PageHeading';`. Grep confirms zero consumers in `src/`. The re-export points at a deleted file.

3. **Delete line 19 of `src/components/fields/index.tsx`:** the re-export `export { default as CustomizeRadio } from '../../../src/admin/dashboard/pages/settings/Elements/Fields/CustomizeRadio';`. Grep confirms zero consumers in `src/`. The re-export points at a deleted directory.

These two deletions are the only edits to "existing JS code" outside the empty settings directory. Both lines are dead code referencing deleted paths; removing them is non-functional from a runtime perspective and necessary to make `npm run build` pass.

## Verification

- `npm run build` succeeds — confirms TypeScript compiles, no unresolved imports, no dangling references.
- `npm run lint:js` passes on the new file.
- Manual smoke test:
  - Load WP admin → Dokan → Settings. Page renders without console errors.
  - Sidebar shows all pages returned by `GET /dokan/v1/admin/settings`.
  - For each page, navigate to it and confirm fields render (or show `FallbackField` for Dokan-unique variants — that is the expected and accepted state in v1).
  - Pick a built-in variant on any page (e.g., a `text` field on General, or a `switch` on Vendor). Change its value. Click save. Reload. Confirm the new value is shown.
  - Verify the change persisted by reading the corresponding `dokan_settings_<page>` value from `wp_options` directly.
- No automated tests are added in v1. Existing `tests/pw/` settings E2E tests likely broke when the directory was deleted; their repair is tracked separately.

## Known Regressions (Accepted)

These are intentional consequences of the minimum-viable scope. Each is a candidate for a graduation PR if it becomes a real problem:

| Capability lost | Impact |
|---|---|
| 14 Dokan-unique field variants render `FallbackField` | Commission, Withdraw, and any page using `repeater` / `data_clear` / social fields / time pickers are partially functional. |
| `dokan_admin_settings_before_save_settings` action does not fire | Pro/3rd-party callbacks that registered for pre-save side effects (e.g., audit logging) silently no-op. |
| `dokan_admin_settings_after_save_settings` action does not fire | Same as above for post-save callbacks (e.g., cache flushes triggered by 3rd-party listeners). |
| `dokan_admin_settings_active_page_id` filter does not fire | Initial page on mount is plugin-ui's default (first page in schema). No way for callers to deep-link a specific page server-side. |
| No localStorage tab persistence | Reloading the page returns to the first page rather than the last-viewed page. |
| No `<DashboardSwitchLink>` | The Vue legacy UI remains reachable via its own admin URL but is not linked from the new page. |
| No `<AdminNotices>` integration | The admin notices scope used by other dashboard pages does not render above this page. |
| No per-field validation error UI | Backend's 400 + `errors` map is logged to the console; the user retries blindly. |

## Future Graduation Path

If any regression above becomes a blocker, the upgrade is **Approach B** (~70 additional LOC):

- Add `wp.hooks.applyFilters('dokan_admin_settings_active_page_id', initialPage)` and pass result as `<Settings initialPage>`.
- Add `wp.hooks.doAction('dokan_admin_settings_before_save_settings', schema)` and `..._after_save_settings` calls inside `handleSave`.
- Add `onNavigate={(pageId) => localStorage.setItem('dokan_active_settings_tab', pageId)}` and read it on mount for `initialPage`.
- Render `<AdminNotices>` above `<Settings>`.
- Add a `DashboardSwitchLink` component reading `dokanAdminDashboardSettings.legacy_settings_url` (the field exists; PHP just needs one line to populate it).

Custom field renderers (Approach C territory) would be added per-variant via `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)` calls in a separate `register-fields.ts` module imported from this `index.tsx`. The `hookPrefix="dokan_settings"` wiring is already in place to support that without further changes to the page entry.

## Files Changed Summary

| Path | Change | Approx. LOC |
|---|---|---|
| `src/admin/dashboard/pages/settings/index.tsx` | **New file** | ~80 |
| `src/components/index.tsx` | Delete line 24 (orphan re-export) | -1 |
| `src/components/fields/index.tsx` | Delete line 19 (orphan re-export) | -1 |

Total: one new file, two single-line deletions, ~80 net LOC added.
