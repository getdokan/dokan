## Context

This change executes Task §7 of `simplify-settings-schema` — replacing the hand-rolled React settings UI with `@wedevs/plugin-ui`'s `<Settings>` component — which was reverted by `08d60f36b` while waiting on the Tailwind v4 migration (PR getdokan/dokan#3087). That blocker is resolved: Tailwind v4 is on `develop` (`659ff61fa`) and merged into this branch (`d37e1eec4`).

The backend half of `simplify-settings-schema` shipped: the flat-array schema (`includes/Admin/Settings/Schema/`), the `SettingsRegistry`, and `AdminSettingsController` (REST GET/PUT) are all in place. What's missing is the frontend swap. The current settings page is 62 files under `src/admin/dashboard/pages/settings/`: a 372-line `index.tsx` that wires up hand-rolled Menu/Tab/Section/FieldGroup/SettingsParser/PageHeading components, plus a 295-line FieldParser dispatcher and 43 field renderers under `Elements/Fields/`. Most of the field renderers and all of the structural components duplicate what plugin-ui's `<Settings>` provides out of the box.

`@wedevs/plugin-ui` is already a project dependency (added for DataViews integration in PR getdokan/dokan#3133). Its `<Settings>` component exports a complete schema-driven settings page: provider, sidebar nav, content area, skeleton, save button, 22 built-in field variants, and per-variant filter hooks for renderer extensibility via the consumer-supplied `applyFilters` prop.

## Goals / Non-Goals

**Goals:**
- The admin settings page renders entirely through `<Settings>` from `@wedevs/plugin-ui`.
- Strict separation: backend produces schema JSON; frontend renders it. No PHP-to-JS or JS-to-PHP hook coupling.
- One PHP extension hook for schema injection: `dokan_settings_fields`. No competing `dokan_get_admin_settings_schema`. No per-node `hook_key` filter firing.
- Dokan-unique field variants (~18 of them) remain renderable via `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)` — plugin-ui's native extensibility point.
- Dokan-specific page concerns (legacy settings link, AdminNotices, action hooks around save, tab persistence) remain functional, wired around the `<Settings>` component.
- Net deletion: ~37 of 62 files under `src/admin/dashboard/pages/settings/`.

**Non-Goals:**
- **Touching, modifying, moving, or deleting any Vue file under `src/admin/`** (52 files including `pages/Settings.vue` and all supporting components like `Fields.vue`, `CombineInput.vue`, `RefreshSettingOptions.vue`, `Switches.vue`, `Currency.vue`, `SecretInput.vue`, `LazyInput.vue`, `Datepicker.vue`, `PasswordGenerator.vue`, etc.). The Vue UI is a preserved coexistence partner, not a target of any cleanup.
- Pro plugin's JS renderer registration pattern (per-variant vs. single dispatcher). Deferred to a follow-up change once Lite ships.
- Pro plugin's 4 custom field types (`menu_manager`, `verification_methods`, `delivery_days`, `color_customizer`). Tracked separately.
- Refactoring `src/stores/adminSettings/` — kept as-is. Plugin-ui owns runtime values internally; the store still backs schema fetch and save coordination. A future change may slim it.
- Backend storage, REST contract, or migration logic. None of those change.
- Restoring the search-within-settings feature (`SearchBar.tsx`) — plugin-ui doesn't ship a search; deferred.

## Decisions

### 1. Decoupling principle: backend produces JSON, frontend renders JSON

**Decision:** The backend and frontend communicate exclusively through the REST contract. Backend has no awareness of how fields render. Frontend has no awareness of where fields originate. Each Pro/3rd-party contribution splits cleanly:
- **Backend extension** = `add_filter('dokan_settings_fields', fn(array $elements) => [...$elements, ...$new])`
- **Frontend extension** = `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)` (or whatever pattern the future Pro JS change settles on)

The two halves don't share filter names, payloads, or invocation contexts. Backend produces a flat array of element descriptors. Frontend renders that array.

**Rationale:** The previous design intertwined PHP and JS extension. Per-node `hook_key` firing on the PHP side, single `dokan_admin_settings_default_field_parser` on the JS side — neither side had a clean responsibility boundary. Decoupling enables independent evolution: backend can re-shape the storage without touching renderers; frontend can swap the rendering library without touching schema callbacks.

### 2. One PHP hook: `dokan_settings_fields`

**Decision:** Rename `apply_filters('dokan_get_admin_settings_schema', $elements)` to `apply_filters('dokan_settings_fields', $elements)`. Remove all per-node `hook_key` filter firing inside the registry. The registry collapses to: build base elements → fire `dokan_settings_fields` once → populate values → return.

**BC break:** The legacy god class (`includes/Admin/Settings.php:1015`) currently fires `dokan_settings_fields` with the **old sectioned-array shape**: `[ $section_id => [ $field_id => [...] ] ]`. Any existing callback receives the **new flat shape** instead: `[ ['id'=>...,'type'=>...,'variant'=>...], ... ]`. Pro and 3rd-party callbacks must migrate. Documented in CHANGELOG; not silently bridged.

**Alternatives considered:**
- Keep both hooks with shape-detection (`if (isset($elements[0]['type']))`) — rejected as a soft contract that grows confusing.
- Add an `ExtensionAdapter` that translates old → new shape — rejected because it leaks legacy assumptions into the new code path.

**Rationale:** The legacy `dokan_settings_fields` callbacks were tied to a god class that's being removed by `simplify-settings-schema`. They cannot keep working in their current form regardless. Reusing the same name with a new shape is the simplest mental model: "this is THE settings hook." Versioning by filter name (e.g., `dokan_settings_fields_v2`) would mean both names coexist forever.

### 3. Replace structural components, keep custom renderers

**Decision:** Map the existing surface area into three buckets:

| Bucket | Files | Action |
|---|---|---|
| **Duplicated by plugin-ui built-ins** | ~24 (DokanText, Number, Select, Switch, RadioCapsule, CustomizeRadio/*, ColorPicker, MultiCheck, ShowHide, RichText, TextArea, FieldLabel, FileUpload, CombineInput, HtmlField, NoticeField, CopyButton, InfoField, CheckboxGroup) | Delete |
| **Structural, replaced by plugin-ui layout** | 9 (Menu, Tab, Section, SubSection, FieldGroup, SettingsParser, PageHeading, SettingsSkeleton, FieldParser) | Delete |
| **Dokan-unique, no plugin-ui equivalent** | ~18 (CategoryBasedCommission, DokanDoubleInput, DokanRepeater, DokanVendorInfoPreview, DokanSingleProductPreview, DokanRefreshSelectField, DokanCurrency, DokanScheduleTime, WithdrawSchedule, DokanTimePicker, DataClearField, DokanSocialButton, DokanSocialField, DokanWithdrawCharges, DokanList, DokanPassword, DokanRadio, DokanEmail, DokanTel) | Keep, adapt props, register via filter |

Plus: `components/SearchBar.tsx`, `components/icons/*`, `types.ts` — deleted. No remaining consumers.

**Prop signature adaptation** for kept renderers:
```diff
- function DokanRepeater({ element, onValueChange, getSetting }) {
+ function DokanRepeater({ element, onChange }: FieldComponentProps) {
-     const value = getSetting(element);
+     const value = element.value ?? element.default;
-     onValueChange({ ...element, value: newValue });
+     onChange(element.dependency_key!, newValue);
  }
```

**Registration pattern:**
```ts
// Once, at plugin bootstrap (e.g., admin entry):
import DokanRepeater from './fields/DokanRepeater';
wp.hooks.addFilter(
    'dokan_settings_repeater_field',
    'dokan-lite/settings-repeater',
    (_defaultComponent, element) => <DokanRepeater element={element} onChange={...} />
);
```

`<Settings>` is invoked with `hookPrefix="dokan_settings"` so each variant fires `dokan_settings_<variant>_field`.

### 4. Page entry: thin wrapper around `<Settings>`

**Decision:** The new `src/admin/dashboard/pages/settings/index.tsx` is approximately:

```tsx
import { Settings } from '@wedevs/plugin-ui';
import { applyFilters } from '@wordpress/hooks';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import settingsStore from '@dokan/stores/adminSettings';
import AdminNotices from 'admin/dashboard/pages/dashboard/components/AdminNotices';
import DashboardSwitchLink from './DashboardSwitchLink';

const SettingsPage = () => {
    const schema = useSelect(s => s.select(settingsStore).getSettings(), []);
    const loading = useSelect(s => s.select(settingsStore).getLoading(), []);
    const { saveSettings } = useDispatch(settingsStore);

    const initialPage = applyFilters('dokan_admin_settings_active_page_id',
        localStorage.getItem('dokan_active_settings_tab') ?? undefined);

    const onSave = async (scopeId, _treeValues, flatValues) => {
        wp.hooks.doAction('dokan_admin_settings_before_save_settings', schema);
        await apiFetch({ path: `/dokan/v1/admin/settings/${scopeId}`, method: 'PUT', data: flatValues });
        wp.hooks.doAction('dokan_admin_settings_after_save_settings', schema);
    };

    const onNavigate = (pageId) => localStorage.setItem('dokan_active_settings_tab', pageId);

    return (
        <div className="min-h-screen h-full">
            <AdminNotices endpoint="admin" scope="global" />
            <Settings
                schema={schema}
                onSave={onSave}
                onNavigate={onNavigate}
                initialPage={initialPage}
                loading={loading}
                title={__('Dokan Settings', 'dokan-lite')}
                hookPrefix="dokan_settings"
                applyFilters={applyFilters}
            />
            {dokanAdminDashboardSettings?.legacy_settings_url && <DashboardSwitchLink />}
        </div>
    );
};
```

**Rationale:** Plugin-ui's `<Settings>` already provides the page/subpage/tab routing, loading state, save button, sidebar, mobile drawer, and content layout. Everything Dokan-specific that wrapped those (legacy switch link, admin notices, action hooks, tab persistence) sits OUTSIDE `<Settings>` as a thin wrapper. The page goes from 372 lines to ~50.

### 5. Store stays untouched

**Decision:** `src/stores/adminSettings/` remains exactly as it is — 464 LOC, full `@wordpress/data` store with `getSettings`, `getLoading`, `getNeedSaving`, `updateSettingsValue`, `saveSettings`, `resetSettings`. The new page uses only `getSettings` (for schema) and `saveSettings` (or replaces with `apiFetch` directly — TBD during implementation). Plugin-ui manages runtime values, dirty state, and changed-elements internally via its own context.

**Rationale:** The store may have external readers (anywhere in Lite or Pro that does `select(settingsStore)`). Removing or slimming it is a separate audit. This change does the minimum needed to swap the render layer.

### 6. Vue UI is preserved, not touched

**Decision:** All 52 Vue files under `src/admin/` (including `pages/Settings.vue` and every supporting component) remain on disk and operational. This change adds the new plugin-ui React settings page as a **second** admin settings UI alongside Vue. Users can switch between them; both work.

The switch mechanism uses the existing (but currently unpopulated) `dokanAdminDashboardSettings.legacy_settings_url` field. PHP must populate it to point at the Vue UI's URL (`admin.php?page=dokan#/settings` or equivalent). The reverse direction (Vue → React) is via the regular admin menu — no in-Vue UI change is needed, because we're not touching Vue.

**Rationale:** The user-facing guarantee is "the old settings still work if needed." That requires the Vue files, the AJAX handlers they depend on, and any Vue-side localized data to remain intact. Even passive cleanup (e.g., consolidating an unused import) is out of scope.

**Open issue (not blocking this change, but called out):** Vue UI today reads/writes the OLD wp_options keys (`dokan_general`, `dokan_selling`, etc.). The new flat-array schema declares NEW keys (`dokan_settings_general`, etc.). Without `simplify-settings-schema`'s pending Migrator (§9) and LegacyAdapter (§11), saves made in one UI are invisible to the other. This change does NOT solve that. It captures the gap so a follow-up can address it. The acceptable interim behaviors are:
- A user who only uses Vue → unaffected. Vue UI keeps reading/writing its old keys.
- A user who only uses the new React UI → unaffected. React reads/writes new keys.
- A user who switches between them → sees divergent values until storage is unified.

If "true switchability" is required before this change ships, the prerequisite is `simplify-settings-schema` §§9–11, OR a decision to point the new schema's `storage_key` at the old wp_options names. That decision is outside this change's scope.

### 7. Pro renderer pattern deferred

**Decision:** Scope this change to Lite. The 4 Pro custom variants (`menu_manager`, `verification_methods`, `delivery_days`, `color_customizer`) will be addressed by a follow-up change once the Lite swap is proven. The follow-up will decide between (a) per-variant filters mirroring Lite's pattern or (b) a single dispatcher filter mirroring the PHP one-hook principle.

**Rationale:** Forcing Pro into a decision now blocks Lite. Pro's renderers don't crash if their filters aren't registered — plugin-ui's `FallbackField` renders an "unsupported variant" placeholder. Lite can ship without Pro updates; Pro modules just show the fallback until they migrate. This is the smallest unit of value.

## Risks / Trade-offs

**[Risk] BC break on `dokan_settings_fields`** — Any existing 3rd-party plugin that filters this hook receives a new payload shape and likely throws or corrupts the schema.
→ Mitigation: Documented in CHANGELOG. The hook was effectively private (god-class internals); few 3rd parties hook it. SchemaValidator (from `simplify-settings-schema` §4) catches malformed elements at runtime.

**[Risk] Plugin-ui field variant misalignment** — A Dokan field's backend metadata may not match what plugin-ui's built-in renderer expects (e.g., `enable_state` shape, `dependency_key` parsing).
→ Mitigation: Pre-flight task (§1.2) audits live REST output against plugin-ui's `SettingsElement` type. Any mismatches are fixed at the schema-builder layer in PHP, not via JS adapters.

**[Risk] Pro modules show fallback fields** — Without a Pro JS update, `menu_manager`/`verification_methods`/`delivery_days`/`color_customizer` render as plugin-ui's fallback placeholder.
→ Mitigation: Document in release notes. Pro release coordinates with this. The fallback is visually clear and not a crash.

**[Risk] adminSettings store has external readers we don't catch** — Removing fields from the store (e.g., `needSaving`) without auditing every reader could break unrelated UI.
→ Mitigation: This change does NOT remove fields. Store stays whole.

**[Trade-off] Lost search-within-settings** — `SearchBar.tsx` filters fields by label. Plugin-ui has no equivalent.
→ Acceptable: Filtering 100+ settings by typing is a power-user feature; sidebar nav by page/subpage covers 95% of the use case. Restore in a follow-up if requested.

**[Trade-off] 18 Dokan renderers remain in the codebase** — The original `simplify-settings-schema` vision was "delete all custom renderers." Reality is plugin-ui covers 18 of 35 variants; the rest are Dokan-specific.
→ Acceptable: The kept renderers are domain-specific (commission tables, vendor previews, withdraw schedules) and have no library-shaped equivalent. They're registered as filters, not part of the page's structural code.
