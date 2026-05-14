## ADDED Requirements

### Requirement: Frontend uses plugin-ui Settings component
The admin settings page SHALL render using `@wedevs/plugin-ui`'s `Settings` component, passing the flat schema array from the REST endpoint as the `schema` prop. No custom field renderer components SHALL exist in the Dokan codebase for standard settings field types.

#### Scenario: Settings page renders via plugin-ui
- **WHEN** the admin navigates to Dokan settings
- **THEN** the page renders using `<Settings schema={schema} onSave={handleSave} />` from `@wedevs/plugin-ui`
- **AND** all standard field variants (text, number, switch, select, radio_capsule, customize_radio, combine_input, textarea, html, base_field_label, color_picker, multicheck, show_hide) render correctly

#### Scenario: No custom field component files in Elements directory
- **WHEN** the codebase is searched for files under `src/admin/dashboard/pages/settings/Elements/Fields/`
- **THEN** no custom field renderer files are found

### Requirement: Schema fetched from REST on page load
The settings page SHALL fetch the complete schema via `GET /dokan/v1/admin/settings` on mount and pass it to the plugin-ui Settings component. A loading state SHALL be shown while fetching.

#### Scenario: Initial load with loading state
- **WHEN** the admin settings page mounts
- **THEN** it shows a loading state, fetches `GET /dokan/v1/admin/settings`, then renders the Settings component with the received schema

#### Scenario: Values included in schema
- **WHEN** the schema is fetched
- **THEN** each field element has its current `value` pre-populated by the backend — no separate values fetch is needed

### Requirement: onSave sends flatValues to REST endpoint
When the user clicks save, the `onSave` callback SHALL send the `flatValues` (flat object keyed by `dependency_key`) to `PUT /dokan/v1/admin/settings/{scopeId}`. The `scopeId` is the active subpage ID (or page ID if no subpage).

#### Scenario: Save triggers REST call with flatValues
- **WHEN** the user modifies `vendor_store_url` and clicks save
- **THEN** a PUT request is sent to `/dokan/v1/admin/settings/marketplace` with the flat key-value pairs for that subpage

#### Scenario: Save scoped to active subpage
- **WHEN** the user is on the "Page Setup" subpage and clicks save
- **THEN** only values from the `dokan_pages` subpage are sent in the request

#### Scenario: Save success feedback
- **WHEN** the PUT request returns HTTP 200
- **THEN** the user sees a success notification

#### Scenario: Save error feedback
- **WHEN** the PUT request returns HTTP 400 with validation errors
- **THEN** the user sees error messages on the affected fields

### Requirement: Dokan-specific fields use plugin-ui applyFilters
For any field variant that is Dokan-specific and not provided by plugin-ui out of the box (e.g., `category_based_commission`, `vendor_info_preview`, `single_product_preview`), the system SHALL use plugin-ui's `applyFilters` prop to register custom field renderers via `@wordpress/hooks`. Custom renderers SHALL be registered in the plugin's main script, not in a settings Elements directory.

#### Scenario: Dokan-specific field rendered via applyFilters
- **WHEN** a field has `variant: 'category_based_commission'` which plugin-ui doesn't natively support
- **THEN** a WordPress filter hook renders the custom field component via plugin-ui's `applyFilters` mechanism
- **AND** the custom renderer is registered as a standalone hook, not a component file in the Elements directory

#### Scenario: Unsupported variant shows fallback
- **WHEN** a field has a variant that has no registered custom renderer and is not a built-in plugin-ui variant
- **THEN** the field renders a reasonable fallback (e.g., text input or empty state) rather than crashing

### Requirement: Webpack entries updated for deleted components
The webpack configuration SHALL be updated to remove entry points for deleted settings field components. No dead entry points SHALL remain after the deletion.

#### Scenario: No dead webpack entries
- **WHEN** the webpack build runs
- **THEN** it completes without errors related to missing settings field component files
- **AND** no entry points reference deleted files
