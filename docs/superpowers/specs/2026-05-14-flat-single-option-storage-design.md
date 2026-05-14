# Flat Single-Option Storage for the New Settings System — Design

**Date:** 2026-05-14
**Branch:** `refactor/simplify-settings-to-flat-array`
**Status:** Approved
**Related work:**
- `docs/superpowers/specs/2026-05-14-plugin-ui-settings-v1-design.md` — frontend implementation that this storage refactor leaves untouched.

## Context

The new flat-array settings system currently stores values across multiple `wp_options` rows — one per page. `SettingsSchema.php` declares `'storage_key' => 'dokan_settings_general'` (and `_transaction`, `_vendor`, `_appearance`, `_ai_assist`) on each page element. `SettingsRegistry::populate_values()` walks every field's parent chain (field → field_group → section → subpage → page), reads the page's option, and navigates a dot-notation `dependency_key` path into the nested value. `AdminSettingsController::update_item()` does the reverse: converts the incoming `{ dep_key: value }` map into a nested array, deep-merges it with the existing per-page option, and writes back.

This couples storage layout to schema structure. Moving a field from one page (or section, or subpage) to another requires moving its stored value from one `wp_options` row to another — a data migration on every reorganization. The dot-path also forces nested writes and makes raw-SQL inspection awkward (a single field lives at, e.g., `dokan_settings_vendor['vendor_dashboard_section']['vendor_widgets']`).

The new flat-array system is still under development. No production data exists in these per-page keys — they are populated only by developer test installs on this branch and on developer machines.

A **legacy Vue settings system** also exists, writing to options like `dokan_general`, `dokan_selling`, `dokan_pages`. Those keys are read by ~50+ call sites in `includes/functions.php` and by Pro. They are **explicitly out of scope** for this change.

## Goal

Replace the new flat-array system's per-page storage with a **single `dokan_settings` wp_option** keyed by field `id`. Make field-to-page (or section, or subpage) reassignment a pure schema edit with zero storage migration. Drop the parent-chain walker, the dot-path navigator, the per-page storage-key lookup, and the deep-merge logic. Keep the REST contract and the frontend unchanged.

## Scope

### In scope

- Storage: collapse `dokan_settings_general`, `_transaction`, `_vendor`, `_appearance`, `_ai_assist` (and any future per-page keys on this branch) into a single `dokan_settings` option.
- Storage shape: `array<string, mixed>` keyed by field `id`.
- `SettingsRegistry`: rewrite value population. Drop parent-chain walker and dot-path navigator.
- `AdminSettingsController`: rewrite save handler. Drop `flat_to_nested`, `deep_merge`, `get_page_storage_key`.
- `SchemaValidator`: enforce globally-unique `id` for elements with `type === 'field'`. Hard-fail the schema build on duplicates.
- `SettingsSchema.php`: remove `storage_key` from every page declaration. Audit and rename any colliding field IDs that exist today.

### Out of scope

- Legacy Vue keys (`dokan_general`, `dokan_selling`, `dokan_pages`, etc.). They keep their current shape and access pattern.
- `dokan_get_option($field, $section, $default)` shim — unchanged. It targets legacy keys and continues to work as it does today.
- `dokan_admin_settings_rearrange_map($option, $section)` — unchanged. Legacy translation only.
- Vue legacy settings UI (`src/admin/pages/Settings.vue` + supporting files) — unchanged.
- The frontend plugin-ui settings page (`src/admin/dashboard/pages/settings/index.tsx`) — no changes; the wire format and REST shape stay the same.
- `dependency_key` rename or removal from the schema/REST output. New fields should declare `dependency_key === id`, but existing usages of `dependency_key` for dot-path values are not retroactively cleaned beyond what falls out of the audit. (Tracked as a possible follow-up.)
- A PHP accessor helper (e.g., `dokan_settings_get()`). Direct `get_option('dokan_settings')[$id]` is acceptable for v1. A helper can be added later if scattered access becomes a problem.
- Migration logic. The new system is under development; no production data needs to be preserved. Any test data in the old per-page keys is abandoned on this change.

## Storage Model

One `wp_options` row:

- `option_name = 'dokan_settings'`
- `option_value` = serialized `array<string, mixed>` keyed by field `id`
- `autoload = 'yes'` (matches the load profile of the current per-page keys)

Example shape:

```php
[
    'map_api_source'             => 'google_maps',
    'google_map_api_key'         => 'AIza…',
    'vendor_store_url'           => 'store',
    'admin_percentage'           => '10',
    'enable_seller_registration' => 'on',
    // ...
]
```

No nesting. No dot-paths. Field reassignment (moving `google_map_api_key` from one page to another) is a schema edit and nothing else — the value at the top level of `dokan_settings` is unaffected.

Values can be primitives or arrays, whatever the field variant requires (multicheck stores an array of selected option ids; repeater stores an array of objects; etc.). The storage layer is variant-agnostic.

## ID Uniqueness

The SchemaValidator gains one rule:

> After the `dokan_settings_fields` filter has run and the merged schema is assembled, walk every element with `type === 'field'`. Collect their `id` values. If any duplicates exist, hard-fail the build.

Hard-fail semantics:

- When `WP_DEBUG` is true: emit a `error_log` entry naming every conflicting id and the duplicate count.
- The REST GET response becomes a `WP_Error` with status 500 and a message listing the duplicate ids.
- The admin settings page surfaces this error (via the existing skeleton/empty-schema rendering path).
- Pro/3rd-party authors learn about collisions during development, not after a customer's data is silently overwritten.

Notes on what this rule does and does not check:

- It checks ONLY `type === 'field'` elements (the value-bearing ones). Structural elements (`page`, `subpage`, `tab`, `section`, `subsection`, `fieldgroup`) are exempt — they have no storage slot.
- It is intentional that a `fieldgroup`'s `id` can equal one of its descendant `field`'s `id`. The schema today does this in several places (`google_map_api_key`, `mapbox_api_key`, `withdraw_methods_group_paypal`, etc.) and that pattern stays legal.

For the v1 implementation of this design, Lite's existing field IDs in `SettingsSchema.php` get audited. Any cross-page collisions among value-bearing fields are renamed in this PR. Pro and 3rd-party schemas will surface their own collisions on first run after upgrading; that is the intended discovery mechanism.

## `SettingsRegistry` Changes

Two changes: the value-population path (described below) and the auto-generation path for `dependency_key` (described in the next section).

Rewrite `populate_values()`. The new body:

```php
private function populate_values( array $elements ): array {
    $stored = get_option( 'dokan_settings', [] );
    if ( ! is_array( $stored ) ) {
        $stored = [];
    }

    foreach ( $elements as &$element ) {
        if ( 'field' !== ( $element['type'] ?? '' ) ) {
            continue;
        }
        if ( array_key_exists( 'value', $element ) ) {
            continue;
        }
        $id = $element['id'] ?? '';
        if ( '' === $id ) {
            continue;
        }
        $element['value'] = $stored[ $id ] ?? ( $element['default'] ?? '' );
    }
    unset( $element );

    return $elements;
}
```

Drop the following helpers from `SettingsRegistry`:

- `find_page_id( $element, $lookup, $parent_pointer_types )` — no more parent-chain walking.
- `get_nested_value( $stored_data, $dep_key )` — no more dot-path navigation.
- `get_stored_option( $storage_key )` — replaced by the single `get_option('dokan_settings', [])` call at the top of `populate_values()`.
- `$options_cache` instance property and the `clear_cache()` method are simplified: the cache is no longer keyed by storage key. If a per-request cache is still desirable, it becomes a single nullable property. Otherwise it can be dropped — `get_option` itself caches within the request.

`clear_cache()` is still called from `AdminSettingsController::update_item()` after save to keep stale schema responses out of the same request. Its body can become a single `$this->stored = null;` assignment, or — if we drop the in-class cache entirely — be removed and its callers updated.

The `parent_pointer_types` constant is no longer used by value population. It remains used by `AdminSettingsController::collect_page_descendants()` for page-scoping the save (see next section); leave it in place.

## `dependency_key` Auto-Generation Change

`SettingsRegistry::generate_keys()` (around `SettingsRegistry.php:85–165`) currently computes `dependency_key` as a dot-path relative to the page:

```php
// dependency_key: path without the page prefix (relative to page).
if ( empty( $element['dependency_key'] ) && count( $path ) > 1 ) {
    $element['dependency_key'] = implode( '.', array_slice( $path, 1 ) );
}
```

Replace this so the auto-generated value equals the field's `id`:

```php
if ( empty( $element['dependency_key'] ) && 'field' === ( $element['type'] ?? '' ) && ! empty( $element['id'] ) ) {
    $element['dependency_key'] = $element['id'];
}
```

Why this matters:

- Plugin-ui's `<Settings>` keys its internal values map by `dependency_key`. When the admin clicks save, plugin-ui produces `flatValues` keyed by each field's `dependency_key`.
- The controller looks up incoming keys via `$by_id[$key]` (see the `update_item` body above).
- Therefore: `dependency_key` MUST equal `id` so plugin-ui's wire format matches the controller's lookup.

Effect on the response: every field in the schema response now has `dependency_key === id`. The frontend doesn't notice — it still uses `dependency_key` the way it always did, the value just happens to equal the id.

Effect on `hook_key`: untouched by this change. `hook_key` continues to be computed as `dokan_settings_<path>` per `SettingsRegistry::generate_keys()`. It's used by per-node filters elsewhere; we don't touch it here.

## `AdminSettingsController` Changes

Rewrite `update_item()`. The route stays `PUT /dokan/v1/admin/settings/{page_id}`, page-scoped writes stay (anti-tampering), and the wire format stays `{ values: { <key>: <value>, ... } }`. The internal logic changes:

```php
public function update_item( $request ) {
    $page_id     = $request->get_param( 'page_id' );
    $flat_values = $request->get_param( 'values' );

    if ( ! is_array( $flat_values ) ) {
        return new WP_Error( 'dokan_rest_invalid_values', __( 'Values must be an object.', 'dokan-lite' ), [ 'status' => 400 ] );
    }

    $schema = $this->registry->get_schema();
    $fields = $this->get_fields_by_page( $schema, $page_id );

    if ( empty( $fields ) ) {
        return new WP_Error(
            'dokan_rest_invalid_page',
            /* translators: %s: page ID */
            sprintf( __( 'No fields found for page "%s".', 'dokan-lite' ), $page_id ),
            [ 'status' => 404 ]
        );
    }

    // Build lookup by field id (each id is globally unique per SchemaValidator).
    $by_id = [];
    foreach ( $fields as $f ) {
        if ( ! empty( $f['id'] ) ) {
            $by_id[ $f['id'] ] = $f;
        }
    }

    $validation_errors = [];
    $sanitized         = [];

    foreach ( $flat_values as $key => $value ) {
        $field = $by_id[ $key ] ?? null;
        if ( ! $field ) {
            // Unknown id for this page — skip silently (could be an unloaded extension's field).
            continue;
        }

        $errors = $this->validate_field_value( $field, $value );
        if ( ! empty( $errors ) ) {
            $validation_errors[ $key ] = $errors;
            continue;
        }

        $sanitized[ $key ] = $this->sanitize_field_value( $field, $value );
    }

    if ( ! empty( $validation_errors ) ) {
        return new WP_Error(
            'dokan_rest_validation_failed',
            __( 'Validation failed for one or more fields.', 'dokan-lite' ),
            [ 'status' => 400, 'errors' => $validation_errors ]
        );
    }

    /**
     * Fired before saving admin settings.
     *
     * @since DOKAN_SINCE
     *
     * @param string $page_id     The page being saved.
     * @param array  $sanitized   Sanitized values keyed by field id.
     */
    do_action( 'dokan_before_saving_settings', $page_id, $sanitized );

    $existing = get_option( 'dokan_settings', [] );
    if ( ! is_array( $existing ) ) {
        $existing = [];
    }
    $merged = array_merge( $existing, $sanitized );

    update_option( 'dokan_settings', $merged, true );

    /**
     * Fired after saving admin settings.
     *
     * @since DOKAN_SINCE
     *
     * @param string $page_id    The page that was saved.
     * @param array  $sanitized  Sanitized values that were saved.
     * @param array  $merged     The full merged dokan_settings array.
     */
    do_action( 'dokan_after_saving_settings', $page_id, $sanitized, $merged );

    $this->registry->clear_cache();

    return rest_ensure_response( apply_filters( 'dokan_admin_settings_response', $this->registry->get_schema() ) );
}
```

Drop the following helpers from `AdminSettingsController`:

- `flat_to_nested( $flat_values )` — no more nested storage shape.
- `deep_merge( $base, $overlay )` — `array_merge` suffices for a flat top-level map.
- `get_page_storage_key( $schema, $page_id )` — no per-page storage keys.

Keep:

- `get_fields_by_page()` and `collect_page_descendants()` — still used to enforce that a save scoped to page X cannot touch fields belonging to page Y.
- `validate_field_value()` and `sanitize_field_value()` — per-field logic, agnostic to storage layout.

Note on hook signatures: the `dokan_before_saving_settings` and `dokan_after_saving_settings` actions drop their `$storage_key` parameter (it no longer exists). This is a BC break for any callbacks that hooked the old signature. Since the new flat-array system is under development, no production callbacks exist; documented in CHANGELOG for safety.

## `SettingsSchema.php` Changes

1. Delete the `'storage_key' => 'dokan_settings_<page>'` line from every page declaration. Known occurrences from grep:
   - Line 88 (`general`)
   - Line 304 (`transaction`)
   - Line 702 (`vendor`)
   - Line 820 (`appearance`)
   - Line 1183 (`ai_assist`)

   Any newer page declarations added on this branch get the same treatment.

2. Rewrite all `dependencies[].key` references to use the target field's `id` instead of the dot-path. 40 references exist in the file today (per `grep -c`); examples that change:

   | Before | After |
   |---|---|
   | `'key' => 'commission.commission.commission_type'` | `'key' => 'commission_type'` |
   | `'key' => 'location.map_api_configuration.map_api_source'` | `'key' => 'map_api_source'` |
   | `'key' => 'product_generation.product_image_section.product_info_generate'` | `'key' => 'product_info_generate'` |

   Variable-built keys like `'key' => $dep_engine` and `'key' => $dep_generate` are constructed elsewhere — update the construction site(s) to use the target field's id rather than a dot-path.

3. Audit for cross-page field-id collisions. Walk every element with `type === 'field'`, collect `id`s, identify duplicates. For each duplicate, rename one side to a unique value AND update every `dependencies[].key` reference that pointed at it. The SchemaValidator will fail loudly on the first request if any duplicates are missed, but it won't catch dependency references that target a renamed id — those silently no-op (the dependency rule never matches anything). To catch those: after renaming, grep for the old id and confirm zero remaining references.

4. For all NEW fields added going forward in `SettingsSchema.php`: do not declare `dependency_key`. The registry auto-generates it as `dependency_key === id`. Manually declaring it is permitted but redundant.

The audit and rename pass is the highest-risk step. The SchemaValidator's hard-fail mode is the safety net that prevents shipping with id collisions, but dangling dependency references are silent — verify each rename's reverse-grep is clean before committing.

## SchemaValidator Changes

Add a public or private validation method invoked from the existing validation flow. Approximate body:

```php
/**
 * Validate that every field-type element has a globally unique id.
 *
 * @param array $elements Merged schema (after dokan_settings_fields filter).
 *
 * @return string[] Array of error messages (empty if valid).
 */
private function validate_unique_field_ids( array $elements ): array {
    $seen   = [];
    $errors = [];

    foreach ( $elements as $element ) {
        if ( 'field' !== ( $element['type'] ?? '' ) ) {
            continue;
        }
        $id = $element['id'] ?? '';
        if ( '' === $id ) {
            continue;
        }
        if ( isset( $seen[ $id ] ) ) {
            $errors[] = sprintf( 'Duplicate field id "%s" — every field must declare a globally unique id.', $id );
        }
        $seen[ $id ] = true;
    }

    return $errors;
}
```

Wire it into whatever method already orchestrates SchemaValidator's checks. If the validator returns errors, the schema build halts and the REST GET returns a `WP_Error` with the messages embedded.

## Frontend Impact

Zero changes. The plugin-ui settings page at `src/admin/dashboard/pages/settings/index.tsx`:

- Still calls `apiFetch({ path: '/dokan/v1/admin/settings' })` on mount.
- Still receives the flat-array schema with `value` populated per field.
- Still calls `apiFetch({ path: '/dokan/v1/admin/settings/{scopeId}', method: 'PUT', data: { values: flatValues } })` on save.
- Still passes `hookPrefix="dokan_settings"` and `applyFilters` to `<Settings>`.

The wire format `{ values: { <key>: <value>, ... } }` is unchanged in shape. The values inside the keys do change: previously `<key>` was a dot-path like `commission.commission.commission_type`; after this change `<key>` is the field's `id` (e.g., `commission_type`). The change is transparent to the frontend because the registry sets `dependency_key === id` on every field before returning the schema, so plugin-ui's `<Settings>` reads the new key from each schema element and uses it as-is for its values map. No frontend code path is aware of "dot-path" vs "id" — it only knows `dependency_key`.

## Field Groups, Switch Groups, and Visibility

The flat storage model does NOT affect grouping or visibility semantics:

- A `fieldgroup`-type element groups visually and may carry `dependencies` that drive its display based on another field's value. The group itself has no storage slot.
- A `switch_group` field-variant element wraps children in plugin-ui's render layer. The switch field has its own `id` (its value persists in `dokan_settings`); each child field has its own `id` (their values persist in `dokan_settings`).
- When a parent switch is off, plugin-ui hides the children but does NOT clear their stored values. Re-enabling the switch reveals the prior values intact.
- When the admin saves, plugin-ui sends only fields that participated in the active scope. The controller writes incoming ids; hidden-and-unchanged ids are absent from the payload and remain at their stored values. There is no "clear children when parent disabled" semantic in v1 — same as current behavior.

This is exactly how the current per-page-key system already behaves; collapsing to single-key storage preserves it without code.

## Files Changed Summary

| Path | Change | Approx. LOC |
|---|---|---|
| `includes/Admin/Settings/Schema/SettingsRegistry.php` | Rewrite `populate_values()`; change `generate_keys()` to set `dependency_key = id`; drop `find_page_id`, `get_nested_value`, `get_stored_option`; simplify or remove `options_cache`. | -70 / +15 |
| `includes/Admin/Settings/Schema/SchemaValidator.php` | Add `validate_unique_field_ids()`; wire into existing orchestration. | +30 |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | Remove `storage_key` from 5+ page declarations; rewrite ~40 `dependencies[].key` references from dot-path to target field id; rename any colliding field ids. | -5 / +0 (rewrites net-zero LOC) |
| `includes/REST/AdminSettingsController.php` | Rewrite `update_item()` body; drop `flat_to_nested`, `deep_merge`, `get_page_storage_key`. Update before/after-save action signatures. | -90 / +30 |
| **Frontend (`src/admin/dashboard/pages/settings/index.tsx`)** | **No change** | 0 |
| **Vue legacy UI (`src/admin/**/*.vue`)** | **No change** | 0 |
| **`dokan_get_option` and `functions.php` callers** | **No change** | 0 |

Net PHP: ~165 LOC removed, ~75 added. The change makes the new system smaller, simpler, and more flexible for field-reassignment.

## Risks and Trade-offs

**Schema build fails loudly on duplicate field ids.**
→ Intentional. Soft-failing would silently lose data. Pro/3rd-party authors need a visible signal during development.

**Action hook signatures change.**
→ `dokan_before_saving_settings` / `dokan_after_saving_settings` drop `$storage_key`. Since the new system is under development and these hooks have no production callbacks yet, this is a BC break in name only. Documented in CHANGELOG.

**Stale test data in `dokan_settings_general` etc. is orphaned.**
→ Accepted. Dev installs that want a clean slate can `wp option delete dokan_settings_general` (and friends) before testing. Stale rows do nothing — nothing reads them after this change.

**An `array_merge` save semantics differ from `deep_merge`.**
→ Old code deep-merged because storage was nested. New code uses a flat top-level map, so `array_merge` is correct. Array-valued fields (multicheck, repeater, etc.) are now REPLACED on save, not merged element-by-element — but that was also true at the leaf level of `deep_merge`, so behavior is equivalent for end users.

**Pro plugin or 3rd-party schemas may have IDs that collide with Lite or with each other.**
→ The SchemaValidator surfaces this on first request after upgrade. Pro release notes call it out; 3rd parties discover it via the visible error.

## Future Follow-ups (Not in This Change)

- A PHP accessor helper for ergonomic reads (`dokan_settings_get($id, $default = null)`). Punted to a follow-up; we want to see how it feels without one first.
- Collapsing `dependency_key` into `id` in the schema/REST output (would simplify the JSON shape further, but requires coordinated changes in any consumer that introspects `dependency_key`).
- Legacy Vue keys consolidation (a much larger change with BC ramifications for `dokan_get_option` callers).
- Migration tooling, if/when this code ships with production data in the per-page keys (currently no such data exists).
