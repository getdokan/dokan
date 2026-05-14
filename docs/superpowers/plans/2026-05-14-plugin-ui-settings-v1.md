# Plugin-UI Settings v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the deleted admin settings page as a minimal React entry that renders `@wedevs/plugin-ui`'s `<Settings>` against the existing `GET/PUT /dokan/v1/admin/settings` REST endpoints.

**Architecture:** One new file (`src/admin/dashboard/pages/settings/index.tsx`) plus two single-line deletions of orphan re-exports. The new page fetches the schema, renders plugin-ui's `<Settings>`, and saves back via `apiFetch`. No legacy store, no custom field renderers, no extension wrappers — minimum viable v1.

**Tech Stack:** React (via `@wordpress/element`), TypeScript, `@wedevs/plugin-ui` (>= the version pinned in `package.json`), `@wordpress/api-fetch`, `@wordpress/hooks`, `@wordpress/i18n`. Build via `@wordpress/scripts`. No new dependencies.

**Linked spec:** `docs/superpowers/specs/2026-05-14-plugin-ui-settings-v1-design.md`

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/admin/dashboard/pages/settings/index.tsx` | **Create** | Default-exports `SettingsPage`. Fetches schema, renders `<Settings>` from plugin-ui, handles save. Single file. |
| `src/components/index.tsx` | **Edit (delete 1 line)** | Remove line 24's orphan re-export of `PageHeading` from the deleted settings tree. |
| `src/components/fields/index.tsx` | **Edit (delete 1 line)** | Remove line 19's orphan re-export of `CustomizeRadio` from the deleted settings tree. |
| `src/admin/dashboard/components/Dashboard.tsx` | **No edit** | Already imports `SettingsPage from '../pages/settings'` at line 12 and renders at line 82. Import resolves the moment the new `index.tsx` exists. |

**Pre-existing state** (do not modify in this plan):
- `src/stores/adminSettings/` — left intact. The new page does NOT import from it.
- `src/admin/dashboard/utils/settings*.ts` — left intact. They import `SettingsElement` type from `src/stores/adminSettings/types`, which is independent of our work.
- `src/admin/pages/Settings.vue` and the rest of the Vue legacy UI — left intact.
- `webpack-entries.js` — no entry changes. The page renders inside the existing dashboard bundle.

**Note on commits:** Each task ends with a commit. Use the project's conventional-commit style (visible in `git log` — `feat:`, `chore:`, `refactor:`, etc.). Do NOT use `git commit --no-verify`. If a pre-commit hook fails, fix the underlying issue and create a NEW commit (never amend).

---

## Task 1: Remove orphan re-exports

**Files:**
- Modify: `src/components/index.tsx` (delete line 24)
- Modify: `src/components/fields/index.tsx` (delete line 19)

These re-exports point at files inside the deleted `src/admin/dashboard/pages/settings/Elements/` tree. They are dead code. Grep across `src/` confirms zero consumers of `PageHeading` or `CustomizeRadio` via the `@dokan/components` barrel.

- [ ] **Step 1: Confirm the exact lines to delete**

Run:
```bash
grep -n "PageHeading" src/components/index.tsx
grep -n "CustomizeRadio" src/components/fields/index.tsx
```

Expected output (line numbers must match before deletion):
```
24:export { default as PageHeading } from '../admin/dashboard/pages/settings/Elements/PageHeading';
19:export { default as CustomizeRadio } from '../../../src/admin/dashboard/pages/settings/Elements/Fields/CustomizeRadio';
```

If the line numbers have shifted, find the matching lines by their content and delete those instead.

- [ ] **Step 2: Delete line 24 of `src/components/index.tsx`**

Remove this exact line (and only this line):
```ts
export { default as PageHeading } from '../admin/dashboard/pages/settings/Elements/PageHeading';
```

- [ ] **Step 3: Delete line 19 of `src/components/fields/index.tsx`**

Remove this exact line (and only this line):
```ts
export { default as CustomizeRadio } from '../../../src/admin/dashboard/pages/settings/Elements/Fields/CustomizeRadio';
```

- [ ] **Step 4: Verify the build now fails on exactly ONE error — the missing `SettingsPage`**

Run:
```bash
npm run build
```

Expected: build fails. The failure should now reference only `src/admin/dashboard/components/Dashboard.tsx` (or equivalent) being unable to resolve `'../pages/settings'`. The two previous errors about `PageHeading` and `CustomizeRadio` should be gone. If you see any other error, stop and investigate before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/components/index.tsx src/components/fields/index.tsx
git commit -m "chore(settings): remove orphan re-exports from deleted settings tree

Both re-exports pointed at files inside src/admin/dashboard/pages/settings/
which was deleted entirely. Grep confirmed zero consumers in src/.
Build still fails on the SettingsPage import in Dashboard.tsx — addressed
in the next commit."
```

Run `git status` to confirm a clean working tree (other than the still-deleted settings/ directory which appears in subsequent tasks' diffs).

---

## Task 2: Create `SettingsPage` with fetch + render

**Files:**
- Create: `src/admin/dashboard/pages/settings/index.tsx`

This task creates the file at the path that `Dashboard.tsx:12` is already trying to import from. After this commit, the build is green and the settings admin URL renders plugin-ui's `<Settings>` populated from the REST schema. Save is intentionally NOT wired yet — Task 3 adds it.

The save button visible in plugin-ui's UI will be inert in this intermediate state. That is fine — the verification step explicitly does not test save here.

- [ ] **Step 1: Create the file with fetch + render only (no save handler yet)**

Create `src/admin/dashboard/pages/settings/index.tsx` with EXACTLY this content:

```tsx
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import { Settings, type SettingsElement } from '@wedevs/plugin-ui';

export default function SettingsPage() {
    const [ schema, setSchema ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );

    useEffect( () => {
        apiFetch< SettingsElement[] >( { path: '/dokan/v1/admin/settings' } )
            .then( ( response ) => {
                setSchema( response );
                setLoading( false );
            } )
            .catch( ( error ) => {
                console.error( 'Failed to fetch settings:', error );
                setLoading( false );
            } );
    }, [] );

    return (
        <Settings
            schema={ schema }
            loading={ loading }
            title={ __( 'Dokan Settings', 'dokan-lite' ) }
            hookPrefix="dokan_settings"
            applyFilters={ applyFilters }
        />
    );
}
```

Notes on conventions used (all match this codebase):
- `useEffect` / `useState` from `@wordpress/element` (not `react`) — established pattern across `src/admin/dashboard/`.
- Spacing inside braces (`{ schema }`, `[ ]`) — matches the existing dashboard codebase's WPCS/Prettier style.
- `apiFetch` default import — matches the pattern used in `src/admin/dashboard/pages/vendors.tsx`, `changelog/index.tsx`, etc.
- Hook prefix `'dokan_settings'` — chosen so future custom-variant filters use names like `dokan_settings_repeater_field`.

- [ ] **Step 2: Run the build to verify it succeeds**

Run:
```bash
npm run build
```

Expected: build completes successfully (the SettingsPage import in Dashboard.tsx now resolves). If TypeScript reports any error about the `SettingsElement` type or the `<Settings>` props, fix by reading the type definition at `node_modules/@wedevs/plugin-ui/src/index.ts` (lines 370–380) and adjusting imports — but the props used here (`schema`, `loading`, `title`, `hookPrefix`, `applyFilters`) are all valid per `SettingsProps`.

- [ ] **Step 3: Run lint on the new file**

Run:
```bash
npm run lint:js -- src/admin/dashboard/pages/settings/index.tsx
```

Expected: zero errors. If lint complains about spacing or import ordering, fix locally — do NOT add ESLint disables. The expected style is already shown above.

- [ ] **Step 4: Manual smoke test — page renders**

Make sure the dev environment is running. If not:
```bash
npm run env:start
npm run start
```

In a browser, navigate to WordPress admin → Dokan → Settings (the route that `Dashboard.tsx:82` mounts at). Confirm:
- Plugin-ui's loading skeleton is visible briefly.
- After the fetch resolves, the page shows: a sidebar listing the pages from `GET /dokan/v1/admin/settings`, a content area showing the active page's fields, and a save button (which does nothing yet — Task 3 wires it).
- Dokan-unique variants (e.g., `repeater`, `category_based_commission`) render the FallbackField placeholder reading "Unsupported field type: <variant>". This is the accepted v1 behavior per the spec.
- No JavaScript errors in the browser console.

If the page doesn't render, check the browser Network tab: the `GET /dokan/v1/admin/settings` request should return 200 with a JSON array. If it returns 401 or 403, verify you are logged in as an administrator.

- [ ] **Step 5: Commit**

```bash
git add src/admin/dashboard/pages/settings/index.tsx
git commit -m "feat(settings): render admin settings via @wedevs/plugin-ui

Replaces the deleted hand-rolled React settings UI with a single-file
page entry that fetches the flat-array schema from
GET /dokan/v1/admin/settings and renders it via plugin-ui's <Settings>
component. Save handler is wired in the follow-up commit."
```

---

## Task 3: Wire the save handler

**Files:**
- Modify: `src/admin/dashboard/pages/settings/index.tsx`

After this task, clicking save in the UI persists changed values via `PUT /dokan/v1/admin/settings/{page_id}`.

- [ ] **Step 1: Add the `handleSave` function and pass it to `<Settings>`**

Update `src/admin/dashboard/pages/settings/index.tsx` so its complete contents become:

```tsx
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import { Settings, type SettingsElement } from '@wedevs/plugin-ui';

export default function SettingsPage() {
    const [ schema, setSchema ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );

    useEffect( () => {
        apiFetch< SettingsElement[] >( { path: '/dokan/v1/admin/settings' } )
            .then( ( response ) => {
                setSchema( response );
                setLoading( false );
            } )
            .catch( ( error ) => {
                console.error( 'Failed to fetch settings:', error );
                setLoading( false );
            } );
    }, [] );

    const handleSave = (
        scopeId: string,
        _treeValues: Record< string, unknown >,
        flatValues: Record< string, unknown >
    ): void => {
        apiFetch( {
            path: `/dokan/v1/admin/settings/${ scopeId }`,
            method: 'PUT',
            data: { values: flatValues },
        } ).catch( ( error ) => {
            console.error( 'Failed to save settings:', error );
        } );
    };

    return (
        <Settings
            schema={ schema }
            loading={ loading }
            title={ __( 'Dokan Settings', 'dokan-lite' ) }
            hookPrefix="dokan_settings"
            applyFilters={ applyFilters }
            onSave={ handleSave }
        />
    );
}
```

The `_treeValues` parameter is prefixed with underscore to signal it is intentionally unused — plugin-ui's `onSave` signature provides both nested and flat shapes, and the REST contract takes the flat one (the controller calls it `flat_to_nested` internally). No explicit return value is needed; the .catch is fire-and-forget.

- [ ] **Step 2: Run the build to verify it still succeeds**

Run:
```bash
npm run build
```

Expected: build completes successfully. If TypeScript objects to the `handleSave` parameter types, double-check against the `SettingsProps` type at `node_modules/@wedevs/plugin-ui/src/components/settings/settings-types.ts` — `onSave` is typed `(scopeId: string, treeValues: Record<string, any>, flatValues: Record<string, any>) => void`.

- [ ] **Step 3: Run lint on the file**

Run:
```bash
npm run lint:js -- src/admin/dashboard/pages/settings/index.tsx
```

Expected: zero errors.

- [ ] **Step 4: Manual smoke test — save persists**

In the running dev environment, navigate to WordPress admin → Dokan → Settings. On any page that exposes a plugin-ui built-in variant (a text field, a switch, or a select), do the following:

1. Change one field's value to something distinctive (e.g., set "Vendor Store URL" prefix to `store-test-XYZ`).
2. Click the save button.
3. Observe the browser Network tab: a `PUT /dokan/v1/admin/settings/<page_id>` request fires with body `{ "values": { ... } }` and returns 200.
4. Reload the page.
5. Confirm the changed value is shown — not the previous one.

Optionally verify storage directly:
```bash
wp option get dokan_settings_<page_id> --format=json
```
(adjust `<page_id>` to the page you edited; e.g., `dokan_settings_general`). The new value should appear in the JSON.

If save fails or the value reverts on reload:
- Check `console.error` output for the captured failure.
- Check the `PUT` response body — the REST controller returns `WP_Error` with status 400 and a per-field `errors` object on validation failure. v1 does not surface these in the UI, so you must read the network response manually.

- [ ] **Step 5: Commit**

```bash
git add src/admin/dashboard/pages/settings/index.tsx
git commit -m "feat(settings): wire save handler for plugin-ui settings page

handleSave dispatches PUT /dokan/v1/admin/settings/{scope_id} with the
flat values plugin-ui surfaces. Failures are logged to console only —
per-field validation error UI is deferred."
```

---

## Task 4: Final verification against the spec

**Files:** none (verification only).

This task does not modify code. It walks through the full verification checklist from the spec and documents the outcome.

- [ ] **Step 1: Run the full build one more time**

Run:
```bash
npm run build
```

Expected: build succeeds, no warnings about unresolved imports or unused exports.

- [ ] **Step 2: Confirm each page renders**

Visit WordPress admin → Dokan → Settings. For every page listed in the sidebar (call `GET /dokan/v1/admin/settings` in the browser dev tools console or via `curl` to get the list, then visit each one):

For each page, record:
- Page renders without crashing.
- Built-in variants render correctly.
- Unique variants show the FallbackField placeholder ("Unsupported field type: …"). This is **expected and accepted** per the spec.

- [ ] **Step 3: Confirm one save works end-to-end on each major page**

Pick one built-in field per page (text, switch, or select) and run the save+reload check from Task 3 Step 4. The goal is to confirm the per-page storage routing (`PUT /dokan/v1/admin/settings/{page_id}`) lands the value in the right wp_option for every page.

- [ ] **Step 4: Confirm the regression list matches reality**

Cross-reference the spec's "Known Regressions (Accepted)" table:

| Regression | Verify by |
|---|---|
| Dokan-unique variants render FallbackField | Visit Commission settings page → confirm `category_based_commission` field shows the placeholder. |
| `dokan_admin_settings_before_save_settings` does NOT fire | (Optional) Add a temporary `add_action('dokan_admin_settings_before_save_settings', fn() => error_log('FIRED'))` in a mu-plugin → save → confirm it does NOT appear in `error_log`. |
| `dokan_admin_settings_after_save_settings` does NOT fire | Same as above for the `_after_` action. |
| `dokan_admin_settings_active_page_id` filter does NOT fire | Initial page on a fresh page load is the first page in the schema, not whatever the filter would have returned. |
| No localStorage tab persistence | Navigate to a non-first page, reload → page returns to the first. |
| No `<DashboardSwitchLink>` | No "back to old settings" link visible on the page. |
| No `<AdminNotices>` | The dashboard-scoped admin notices do NOT appear above `<Settings>` on this page. |

These confirmations document that the v1 scope was honored. If any "regression" actually still works (e.g., an action fires somewhere unexpectedly), investigate — it may indicate code that escaped the deletion.

- [ ] **Step 5: Document the outcome in the PR description**

When opening the PR (out of scope for this plan but immediately downstream), include the following summary points:
- Replaces the deleted React settings tree with a ~50-LOC plugin-ui page entry.
- Cleans up two orphan re-exports.
- Accepted regressions: 14 Dokan-unique variants render the FallbackField, four legacy hook integrations are not wired (see spec for the full list).
- Backend untouched, store untouched, Vue UI untouched.

There is no Task-4 commit — this task is verification only. If issues are found, fix them in a new task appended below this one (do NOT amend prior commits).

---

## Out-of-Scope Reminders

Per the spec, the following are **intentionally not in this plan**. Do not add them speculatively:

- Custom field renderers for any Dokan-unique variant. Adding even one is a separate change.
- Wiring `dokan_admin_settings_before_save_settings` / `after_save_settings` actions.
- `dokan_admin_settings_active_page_id` filter integration.
- localStorage tab persistence.
- `<AdminNotices>` wrapper.
- `<DashboardSwitchLink>` back-to-Vue link (or PHP changes to populate `dokanAdminDashboardSettings.legacy_settings_url`).
- Per-field validation error UI.
- Repairing or rewriting Playwright tests under `tests/pw/` that targeted the deleted settings tree.
- Any change to `src/stores/adminSettings/`.
- Any change to `src/admin/pages/Settings.vue` or other Vue files.
- Any change to `webpack-entries.js`.
- Any new dependency in `package.json`.

If any of these become a blocker during implementation, stop and flag — they belong in a follow-up plan (Approach B graduation per the spec), not this one.
