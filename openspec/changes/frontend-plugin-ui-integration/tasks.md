## 1. Pre-flight Verification

- [ ] 1.1 Snapshot the current settings page — capture screenshots of every Lite page (general, transaction, vendor, appearance, compliance) and every subpage as a visual baseline for the regression check in §9.1
- [ ] 1.2 Run `GET /dokan/v1/admin/settings` against a live install — save the JSON output to `.tmp/settings-schema-snapshot.json` for use throughout this change
- [ ] 1.3 Diff the live schema against plugin-ui's `SettingsElement` type — flag any incompatibilities (label vs title, missing layout/radio_variant defaults, value typing, parent pointer references). Fix at PHP schema-builder layer, not in JS adapters.
- [x] 1.4 Verify `@wedevs/plugin-ui` exports `Settings`, `SettingsSkeleton`, `useSettings`, `formatSettingsData`, `SettingsElement` type (already on `package.json:77`) — all confirmed in node_modules/@wedevs/plugin-ui/src/index.ts
- [x] 1.5 Confirm Tailwind v4 is loaded for the admin dashboard bundle (PR #3087 merged, on develop) — package.json has tailwindcss + @tailwindcss/postcss at ^4.1.18
- [x] 1.6 Grep `select( settingsStore )` and `dispatch( settingsStore )` across `src/`, `../dokan-pro/`, `../dokan-*/` — Zero external readers outside `src/admin/dashboard/pages/settings/`. Zero readers in dokan-pro. Safe to refactor page entry; store untouched per the constraint.

## 2. Backend: Rename PHP Hook to `dokan_settings_fields`

- [ ] 2.1 In `includes/Admin/Settings/Schema/SettingsSchema.php:43`, change `apply_filters( 'dokan_get_admin_settings_schema', $elements )` to `apply_filters( 'dokan_settings_fields', $elements )`
- [ ] 2.2 Update the file's docblock (`includes/Admin/Settings/Schema/SettingsSchema.php:11`) to reference the new hook name
- [ ] 2.3 Remove any per-node `hook_key` filter firing inside `SettingsRegistry` (the design.md decision: one global filter, no per-node firing)
- [ ] 2.4 Verify the legacy `includes/Admin/Settings.php:1015` (`apply_filters('dokan_settings_fields', $settings_fields, $this)`) is on its way out via `simplify-settings-schema` — if not already deleted, ensure both invocations don't fire in the same request (the legacy god class is removed by that change's §1)
- [ ] 2.5 Grep `dokan_get_admin_settings_schema` across the repo — replace all references (test files, docs, the reference-pro-schema-example.php in the openspec) with `dokan_settings_fields`
- [ ] 2.6 Add a CHANGELOG entry documenting the BC break for `dokan_settings_fields` callbacks

## 3. Vue UI Coexistence + New Page Entry

- [ ] 3.1 Create `src/admin/dashboard/pages/settings/DashboardSwitchLink.tsx` — extract the existing legacy URL link component from `index.tsx:16-36` into its own file (it survives the rewrite)
- [ ] 3.2 Rewrite `src/admin/dashboard/pages/settings/index.tsx` as a thin wrapper:
  - Reads schema + loading from `select(settingsStore)`
  - Calls `wp.hooks.applyFilters('dokan_admin_settings_active_page_id', ...)` to compute `initialPage`
  - Wires `onSave(scopeId, _treeValues, flatValues)` → `wp.hooks.doAction('dokan_admin_settings_before_save_settings', schema)` → `apiFetch({ path: '/dokan/v1/admin/settings/' + scopeId, method: 'PUT', data: flatValues })` → `wp.hooks.doAction('dokan_admin_settings_after_save_settings', schema)`
  - Wires `onNavigate(pageId)` → `localStorage.setItem('dokan_active_settings_tab', pageId)`
  - Renders `<Settings schema onSave onNavigate initialPage loading title hookPrefix="dokan_settings" applyFilters={applyFilters} />`
  - Wraps with AdminNotices (filter-driven scopes from existing `dokan_admin_dashboard_notices_scopes`) and DashboardSwitchLink
- [ ] 3.3 Verify `Dashboard.tsx` import for SettingsPage still resolves (already restored in the merge)
- [ ] 3.4 Drop any imports that no longer resolve after the rewrite
- [ ] 3.5 Populate `dokanAdminDashboardSettings.legacy_settings_url` in PHP — modify `includes/Admin/Dashboard/Dashboard.php` settings() method to add the legacy Vue settings URL (e.g., `admin_url('admin.php?page=dokan#/settings')`) so DashboardSwitchLink renders and users can switch back to Vue
- [ ] 3.6 Vue file preservation guard — add a verification step (script or manual check) that confirms no file under `src/admin/*.vue` or `src/admin/pages/*.vue` or `src/admin/components/*.vue` is in this change's diff. Touching any Vue file fails the gate.

## 4. Keep + Adapt Dokan-unique Field Renderers

- [ ] 4.1 Identify the kept renderers (~18 files), move them out of `Elements/Fields/` into a new sibling directory `src/admin/dashboard/pages/settings/fields/` (flatter, no nested Commission/CustomizeRadio dirs)
- [ ] 4.2 Adapt each renderer's prop signature from `{element, onValueChange, getSetting, ...}` to plugin-ui's `FieldComponentProps`: `{element, onChange, isNested?, isGroupParent?}`. Replace `getSetting(element)` reads with `element.value ?? element.default`. Replace `onValueChange({...element, value})` with `onChange(element.dependency_key!, value)`.
- [ ] 4.3 Create `src/admin/dashboard/pages/settings/register-fields.ts` — a single module that imports each kept renderer and calls `wp.hooks.addFilter('dokan_settings_<variant>_field', 'dokan-lite/<variant>', (_, el) => <Renderer element={el} onChange={...} />)`. Variants registered:
  - `category_based_commission` → CategoryBasedCommission
  - `double_input` → DokanDoubleInput
  - `repeater` → DokanRepeater
  - `vendor_info_preview` → DokanVendorInfoPreview
  - `single_product_preview` → DokanSingleProductPreview
  - `refresh_select` → DokanRefreshSelectField
  - `currency` → DokanCurrency
  - `withdraw_schedule` → WithdrawSchedule
  - `schedule_time` → DokanScheduleTime
  - `time_picker` → DokanTimePicker
  - `data_clear` → DataClearField
  - `social_button` → DokanSocialButton
  - `social_field` → DokanSocialField
  - `withdraw_charges` → DokanWithdrawCharges
  - `list` → DokanList
  - `password` → DokanPassword (if not subsumed by plugin-ui's `show_hide`)
  - `radio` → DokanRadio (if not subsumed by plugin-ui's `radio_capsule`)
  - `email` → DokanEmail (if not subsumed by plugin-ui's `text` with type override)
  - `tel` → DokanTel (if not subsumed by plugin-ui's `text` with type override)
- [ ] 4.4 Import `register-fields.ts` from the admin entry (likely `src/admin/index.tsx` or the dashboard entry) so registration runs once at bundle load, before any settings page mount
- [ ] 4.5 Decide per-renderer: password, radio, email, tel — keep only if the existing component adds value beyond what plugin-ui's `text`/`show_hide`/`radio_capsule` already render. Delete if redundant.

## 5. Delete Redundant Files

- [ ] 5.1 Delete the ~24 renderers covered by plugin-ui built-ins:
  - `Elements/Fields/DokanTextField.tsx`
  - `Elements/Fields/DokanNumber.tsx`
  - `Elements/Fields/DokanTextArea.tsx`
  - `Elements/Fields/DokanRichText.tsx`
  - `Elements/Fields/DokanSelect.tsx`
  - `Elements/Fields/DokanSwitch.tsx`
  - `Elements/Fields/DokanRadioCapsule.tsx`
  - `Elements/Fields/CustomizeRadio.tsx` and the entire `Elements/Fields/CustomizeRadio/` directory (7 files)
  - `Elements/Fields/DokanColorPicker.tsx`
  - `Elements/Fields/DokanShowHideField.tsx`
  - `Elements/Fields/DokanMultiCheck.tsx`
  - `Elements/Fields/DokanCheckboxGroup.tsx`
  - `Elements/Fields/DokanFieldLabel.tsx`
  - `Elements/Fields/DokanFileUpload.tsx`
  - `Elements/Fields/Commission/CombineInput.tsx`
  - `Elements/Fields/DokanHtmlField.tsx`
  - `Elements/Fields/DokanNoticeField.tsx`
  - `Elements/Fields/DokanCopyButtonField.tsx`
  - `Elements/Fields/DokanInfoField.tsx`
- [ ] 5.2 Delete the structural components (replaced by plugin-ui internal layout):
  - `Elements/Menu.tsx`
  - `Elements/Tab.tsx`
  - `Elements/Section.tsx`
  - `Elements/SubSection.tsx`
  - `Elements/FieldGroup.tsx`
  - `Elements/SettingsParser.tsx`
  - `Elements/PageHeading.tsx`
- [ ] 5.3 Delete the dispatcher `Elements/Fields/FieldParser.tsx`
- [ ] 5.4 Delete skeleton + types:
  - `components/SettingsSkeleton.tsx`
  - `types.ts`
- [ ] 5.5 Delete unused support files (verify no external imports first):
  - `components/SearchBar.tsx`
  - `components/icons/AdminIcon.tsx`
  - `components/icons/MarkedChecked.tsx`
  - `components/icons/UnMarkedChecked.tsx`
  - `components/icons/VendorIcon.tsx`
- [ ] 5.6 Delete the now-empty `Elements/` directory (and `Elements/Fields/Commission/`, `Elements/Fields/CustomizeRadio/`)
- [ ] 5.7 Verify final file count under `src/admin/dashboard/pages/settings/`: page entry + DashboardSwitchLink + ~18 kept renderers + register-fields module

## 6. Store + Build Wiring

- [ ] 6.1 Keep `src/stores/adminSettings/` exactly as it is — no changes to the store, reducer, actions, selectors, types
- [ ] 6.2 Verify the `admin-settings-store` webpack entry (`webpack-entries.js:88-95`) still builds
- [ ] 6.3 Remove webpack entries for any deleted files (none expected since deletes are under the dashboard bundle, not separate entries — verify)
- [ ] 6.4 Run `npm run build` — resolve any TypeScript or webpack errors from dropped imports
- [ ] 6.5 Run `npm run lint` for the modified files

## 7. PHP Hook Audit

- [ ] 7.1 Grep `dokan_settings_fields` across `includes/` and confirm only `SettingsSchema.php` fires it after this change (and the legacy god class if not yet removed by `simplify-settings-schema`)
- [ ] 7.2 Grep `dokan_get_admin_settings_schema` across the repo — should return zero matches after task §2.5
- [ ] 7.3 Run existing PHP unit/integration tests — fix any references to renamed hooks

## 8. Documentation Updates

- [ ] 8.1 Update `openspec/changes/class-to-array-detection/reference-pro-schema-example.php` to use `dokan_settings_fields` in its inline comments and code samples
- [ ] 8.2 Update `openspec/changes/simplify-settings-schema/design.md` Decision §1 — the hook name is `dokan_settings_fields` (was `dokan_get_admin_settings_schema`)
- [ ] 8.3 Update `openspec/changes/simplify-settings-schema/tasks.md` — uncheck §2 and §7, note "superseded by frontend-plugin-ui-integration"
- [ ] 8.4 Update `openspec/changes/simplify-settings-schema/specs/flat-array-schema/spec.md` Requirement "Settings defined as plain PHP arrays via a single filter" — hook name and the no-per-node-firing decision

## 9. Verification

- [ ] 9.1 Visual diff: render every Lite settings page (general, transaction, vendor, appearance, compliance, ai_assist, moderation, product) and compare against §1.1 snapshots — confirm field parity and no missing widgets
- [ ] 9.2 Functional: on each page, change a representative field, click save, reload — confirm the value persists by reading from the corresponding `dokan_settings_*` wp_option
- [ ] 9.3 Functional: the 18 Dokan-unique variants render correctly via their registered filters — at minimum verify category_based_commission, repeater (shipment if Pro is installed), and refresh_select
- [ ] 9.4 Pro fallback: with dokan-pro installed but no Pro JS update, the 4 Pro variants (menu_manager, verification_methods, delivery_days, color_customizer) render plugin-ui's fallback placeholder without crashing. Documented but expected.
- [ ] 9.5 `dokan_admin_settings_active_page_id` filter still controls the initially-active page. Verify with a temporary filter callback returning a specific page ID.
- [ ] 9.6 `dokan_admin_settings_before_save_settings` and `dokan_admin_settings_after_save_settings` actions still fire on save. Verify with `error_log` in a temporary callback.
- [ ] 9.7 localStorage tab persistence: navigate to a subpage, reload, confirm the same subpage activates
- [ ] 9.8 AdminNotices still render on the settings page
- [ ] 9.9 Legacy settings URL link still renders when `dokanAdminDashboardSettings.legacy_settings_url` is set
- [ ] 9.10 Run the existing settings E2E test suite — fix any selectors that targeted the old structural components (Menu, Tab) and now need to target plugin-ui's equivalents
- [ ] 9.11 Vue UI smoke test — navigate to the legacy Vue settings (admin.php?page=dokan#/settings or equivalent), confirm it renders, change a value, save, reload, confirm persistence. The Vue UI MUST work unchanged.
- [ ] 9.12 Vue file diff check — `git diff --name-only` should not list any file matching `src/admin/**/*.vue`. Any match fails the gate.
- [ ] 9.13 Round-trip switch test — start in the new React UI, click the legacy switch link, land on Vue UI; navigate back via admin menu, land on React UI. Verify both routes are reachable in either order.

## 10. Cleanup

- [ ] 10.1 Mark this change as ready for archive via `openspec validate frontend-plugin-ui-integration`
- [ ] 10.2 Update CHANGELOG with: backend hook rename, frontend rewrite via plugin-ui, BC notes for Pro/3rd-party
