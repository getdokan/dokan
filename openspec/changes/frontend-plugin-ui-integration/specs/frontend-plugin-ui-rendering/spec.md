## ADDED Requirements

### Requirement: Backend and frontend are decoupled through a JSON contract

The backend SHALL be solely responsible for producing the settings schema as JSON. The frontend SHALL be solely responsible for rendering that JSON. The two halves SHALL NOT share filter names, callback signatures, or invocation contexts. Communication SHALL happen exclusively through the REST contract (`GET /dokan/v1/admin/settings` and `PUT /dokan/v1/admin/settings/{scope}`).

#### Scenario: Backend has no JS-side awareness
- **WHEN** the backend builds the settings schema
- **THEN** it invokes only PHP filters (`dokan_settings_fields`) and produces a flat array of element descriptors
- **AND** no part of the schema build process references JavaScript hook names, render component names, or frontend filter prefixes

#### Scenario: Frontend has no backend-extension awareness
- **WHEN** the frontend renders the settings page
- **THEN** it consumes only the REST JSON response and uses only `wp.hooks.addFilter('dokan_settings_<variant>_field', ...)` for renderer extensibility
- **AND** the frontend SHALL NOT call PHP filter names, attempt to introspect backend extension points, or depend on the order in which backend filters fired

### Requirement: PHP schema extension uses a single hook named `dokan_settings_fields`

The backend SHALL fire exactly one filter to allow extension of the settings schema: `apply_filters('dokan_settings_fields', $elements)`. The filter callback signature SHALL accept and return a flat array of element descriptors. The backend SHALL NOT fire per-node `hook_key` filters during registry build. The previous `dokan_get_admin_settings_schema` filter (introduced by `simplify-settings-schema`) SHALL be removed.

#### Scenario: Single global filter for schema injection
- **WHEN** the `SettingsRegistry` builds the schema
- **THEN** it calls `apply_filters('dokan_settings_fields', $elements)` exactly once, after Lite has assembled its base elements and before values are populated
- **AND** no other filter is fired during structural-element traversal

#### Scenario: Pro and 3rd-party append via the same hook
- **WHEN** an external plugin hooks `add_filter('dokan_settings_fields', $callback)`
- **THEN** the callback receives the flat array of element descriptors (after Lite's contribution)
- **AND** the callback returns an array with appended/modified elements
- **AND** each appended element references existing parent IDs via `page_id`, `subpage_id`, `section_id`, `tab_id`, `subsection_id`, or `field_group_id`

#### Scenario: Backward compatibility break is documented
- **WHEN** an existing 3rd-party callback on `dokan_settings_fields` (from the legacy god-class era) is invoked under the new system
- **THEN** the callback receives the new flat-array shape instead of the old sectioned-array shape
- **AND** this BC break is documented in CHANGELOG.md

### Requirement: Admin settings page renders via plugin-ui's Settings component

The admin settings page SHALL render entirely through `<Settings>` from `@wedevs/plugin-ui`. Custom hand-rolled structural components (Menu, Tab, Section, SubSection, FieldGroup, SettingsParser, PageHeading) and dispatchers (FieldParser) SHALL NOT exist in the codebase. Plugin-ui's `<Settings>` SHALL provide page/subpage routing, sidebar navigation, content layout, save button, loading skeleton, and mobile responsiveness.

#### Scenario: Page renders via <Settings>
- **WHEN** the admin navigates to the Dokan settings page
- **THEN** the page renders `<Settings schema={schema} onSave={...} onNavigate={...} initialPage={...} loading={loading} title="Dokan Settings" hookPrefix="dokan_settings" applyFilters={wp.hooks.applyFilters} />`
- **AND** no custom Menu/Tab/Section/SubSection/FieldGroup/SettingsParser/PageHeading components exist under `src/admin/dashboard/pages/settings/`

#### Scenario: Schema fetched from REST on mount
- **WHEN** the settings page mounts
- **THEN** it issues `GET /dokan/v1/admin/settings`, shows a loading skeleton until the response returns, then passes the flat element array to `<Settings>` as `schema`
- **AND** field values are pre-populated within the schema response — no separate values fetch is issued

#### Scenario: Save dispatches to REST per scope
- **WHEN** the user modifies fields on a subpage and clicks save
- **THEN** `onSave(scopeId, _treeValues, flatValues)` is invoked by plugin-ui
- **AND** the page issues `PUT /dokan/v1/admin/settings/{scopeId}` with `flatValues` as the request body
- **AND** the `dokan_admin_settings_before_save_settings` action fires immediately before the request
- **AND** the `dokan_admin_settings_after_save_settings` action fires immediately after the request resolves

### Requirement: Dokan-unique field variants register via wp.hooks filter

For settings field variants that plugin-ui does not provide out of the box (e.g., `category_based_commission`, `repeater`, `vendor_info_preview`, `single_product_preview`, `refresh_select`, `currency`, `withdraw_schedule`, `withdraw_charges`, `double_input`, `time_picker`, `schedule_time`, `data_clear`, `social_button`, `social_field`, `list`), Dokan SHALL register a custom React renderer via `wp.hooks.addFilter('dokan_settings_<variant>_field', 'dokan-lite/<variant>', handler)`. The filter prefix `dokan_settings` SHALL be passed to `<Settings>` as its `hookPrefix` prop.

#### Scenario: Custom renderer registered via filter
- **WHEN** the admin entry bundle loads
- **THEN** a module `register-fields.ts` runs once, registering one filter per kept Dokan variant via `wp.hooks.addFilter`
- **AND** each filter callback returns a React element rendering the variant-specific component

#### Scenario: Filter fires when variant matches
- **WHEN** plugin-ui's `FieldRenderer` encounters an element with `variant: 'category_based_commission'`
- **THEN** it invokes `applyFilters('dokan_settings_category_based_commission_field', defaultComponent, mergedElement)`
- **AND** Dokan's registered handler returns the CategoryBasedCommission component

#### Scenario: Unregistered variants render fallback
- **WHEN** plugin-ui encounters a variant for which no filter handler is registered (e.g., a Pro variant before Pro JS updates)
- **THEN** plugin-ui's `FallbackField` renders an "Unsupported field type: <variant>" placeholder
- **AND** the page does NOT crash

### Requirement: Dokan-specific page concerns wrap <Settings>

Page-level concerns specific to Dokan (legacy settings URL link, admin notices, action hooks around save, tab persistence) SHALL be wired outside the `<Settings>` component using its prop API (`initialPage`, `onNavigate`, `onSave`) and surrounding JSX wrappers. These concerns SHALL NOT require modifying plugin-ui or extending its internal context.

#### Scenario: Legacy settings URL link
- **WHEN** `dokanAdminDashboardSettings.legacy_settings_url` is defined
- **THEN** a `DashboardSwitchLink` component renders below the `<Settings>` component, linking back to the legacy panel

#### Scenario: AdminNotices integration
- **WHEN** the settings page mounts
- **THEN** `AdminNotices` renders above the `<Settings>` component, scoped via the existing `dokan_admin_dashboard_notices_scopes` filter

#### Scenario: Active page filter
- **WHEN** the page resolves the initial page to activate
- **THEN** it reads from `localStorage.getItem('dokan_active_settings_tab')`, passes the value through `wp.hooks.applyFilters('dokan_admin_settings_active_page_id', $value)`, and supplies the result to `<Settings>` via the `initialPage` prop

#### Scenario: Tab persistence on navigation
- **WHEN** the user navigates between subpages via plugin-ui's sidebar
- **THEN** `<Settings>` invokes `onNavigate(pageId)`
- **AND** the handler calls `localStorage.setItem('dokan_active_settings_tab', pageId)`

### Requirement: Vue legacy settings UI is preserved unchanged

This change SHALL NOT modify, move, or delete any file under `src/admin/` that participates in the legacy Vue settings UI. All 52 Vue files — including `src/admin/pages/Settings.vue` and every supporting component in `src/admin/components/` — SHALL remain on disk and operational. The new React (plugin-ui) settings page SHALL coexist with the Vue UI; both remain reachable. The switch link in the new React UI (`DashboardSwitchLink`) SHALL navigate to the Vue UI's URL.

#### Scenario: No Vue file touched in this change
- **WHEN** the diff for this change is inspected
- **THEN** no file matching `src/admin/**/*.vue` appears in the modified-file list

#### Scenario: Vue UI remains reachable and functional
- **WHEN** an admin user navigates to the legacy Vue settings URL (`admin.php?page=dokan#/settings` or equivalent)
- **THEN** the Vue settings UI renders normally, fields are editable, saves persist, and reloads show the saved values

#### Scenario: Round-trip switch between UIs
- **WHEN** the user is on the new plugin-ui React settings page and clicks the legacy switch link
- **THEN** they land on the Vue settings UI
- **AND** navigating back via the admin menu returns them to the new React UI without error

### Requirement: adminSettings @wordpress/data store stays untouched

This change SHALL NOT modify `src/stores/adminSettings/` (store.ts, reducer.ts, actions.ts, selectors.ts, types.ts, default-state.ts, resolvers.ts). The new page entry MAY use `select(settingsStore).getSettings()` for schema reads and `dispatch(settingsStore).saveSettings()` for saves, OR may bypass the store using `apiFetch` directly. Either choice SHALL preserve all existing store selectors and actions for any external readers.

#### Scenario: Store files unchanged
- **WHEN** the diff for this change is inspected
- **THEN** no file under `src/stores/adminSettings/` appears in the modified-file list

#### Scenario: External readers continue to work
- **WHEN** any code (Lite or Pro) calls `select(settingsStore).getSettings()` or other store accessors
- **THEN** the call returns the same data shape it returned before this change
