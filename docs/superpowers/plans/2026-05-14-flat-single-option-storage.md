# Flat Single-Option Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-page `dokan_settings_<page>` wp_options with a single `dokan_settings` option keyed by globally-unique field `id`, so reassigning a field between pages/sections requires only a schema edit (no data migration).

**Architecture:** Four PHP files change in three tasks. Task 1 adds a strict field-id-uniqueness rule to the validator (additive, no behavior change yet). Task 2 atomically rewires `SettingsRegistry::populate_values()`, `SettingsRegistry::generate_keys()` (to set `dependency_key = id`), and `AdminSettingsController::update_item()` to read/write the single option. Task 3 cleans `SettingsSchema.php` (removes 5 `storage_key` declarations, rewrites ~40 `dependencies[].key` references from dot-paths to field ids, and renames any cross-page id collisions the validator surfaces). The frontend (`src/admin/dashboard/pages/settings/index.tsx`) needs no changes — the wire format shape is identical; only the key values shift from dot-paths to ids.

**Tech Stack:** PHP 7.4+, PHPUnit 9.6, WP-PHPUnit, Brain Monkey, `WeDevs\Dokan\Test\DokanTestCase`. Build & lint via composer (`composer phpcs`, `composer phpcbf`).

**Linked spec:** `docs/superpowers/specs/2026-05-14-flat-single-option-storage-design.md`

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `includes/Admin/Settings/Schema/SchemaValidator.php` | **Modify** | Add `check_unique_field_ids()`. Wire it into `validate()` so duplicates surface as errors (not warnings). |
| `includes/Admin/Settings/Schema/SettingsRegistry.php` | **Modify** | Rewrite `populate_values()` to read once from `dokan_settings` and look up by id. Change `generate_keys()` so `dependency_key === id`. Delete `find_page_id()`, `get_nested_value()`, `get_stored_option()`. Simplify or remove the per-key `$options_cache` (replaced with a single nullable property). |
| `includes/REST/AdminSettingsController.php` | **Modify** | Rewrite `update_item()` to validate by id, merge into `dokan_settings`, save once. Delete `flat_to_nested()`, `deep_merge()`, `get_page_storage_key()`. Update the two action hook signatures (drop `$storage_key`). |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | **Modify** | Delete `'storage_key' => 'dokan_settings_<page>'` from each page declaration. Rewrite every `dependencies[].key` reference that uses a dot-path. Rename any colliding field ids. |
| `tests/php/src/Admin/Settings/Schema/SchemaValidatorTest.php` | **Create** | New PHPUnit class extending `DokanTestCase`. Covers the new field-id-uniqueness rule. |
| `tests/php/src/Admin/Settings/Schema/SettingsRegistryStorageTest.php` | **Create** | New PHPUnit class covering the rewritten populate_values, the `dependency_key === id` invariant, and the controller's save path against `dokan_settings`. |
| `tests/php/src/Admin/Settings/Schema/SettingsSchemaTest.php` | **No edit, but watch** | Existing tests run as a regression check (`test_schema_passes_validator_with_no_errors`). Will surface any field-id collision the cleanup pass missed. |
| `src/admin/dashboard/pages/settings/index.tsx` | **No edit** | Frontend stays as-is. |

**Commit policy:** Each task ends with one suggested commit message in the project's conventional-commits style. Do NOT use `--no-verify`. If a pre-commit hook fails, fix the underlying issue and create a NEW commit.

**Running tests:** `npm run phpunit` runs the full PHP suite against the running `wp-env`. Filter to a single class with `npm run phpunit -- --filter SchemaValidatorTest`. The `wp-env` must be running (`npm run env:start`).

---

## Task 1: Add globally-unique field-id check to SchemaValidator

**Files:**
- Create: `tests/php/src/Admin/Settings/Schema/SchemaValidatorTest.php`
- Modify: `includes/Admin/Settings/Schema/SchemaValidator.php`

The existing `check_duplicate_ids()` produces *warnings* and scopes uniqueness by parent (so two fields named `enabled` under different sections do NOT trigger). We ADD a new check that's strict: every `type === 'field'` element must have a globally unique `id` across the entire merged schema. Duplicates become *errors*.

We do not modify `check_duplicate_ids()` — it serves a different purpose (catching accidental same-id-in-same-scope copy-paste) and stays as-is at warning severity.

- [ ] **Step 1: Confirm `wp-env` is running**

Run:
```bash
npm run env:start
```

Expected: env starts (or "already running"). If wp-env complains about port conflicts, stop other Docker containers first.

- [ ] **Step 2: Write the failing test**

Create `tests/php/src/Admin/Settings/Schema/SchemaValidatorTest.php` with EXACTLY:

```php
<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for SchemaValidator's globally-unique field-id rule.
 *
 * @group admin-settings
 * @group settings-schema
 */
class SchemaValidatorTest extends DokanTestCase {

    /**
     * Build a minimal schema with two pages and one field per page.
     *
     * @param string $field_id_general     The id for the general page's field.
     * @param string $field_id_transaction The id for the transaction page's field.
     *
     * @return array
     */
    private function build_schema( string $field_id_general, string $field_id_transaction ): array {
        return [
            [ 'id' => 'general',     'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'transaction', 'type' => 'page', 'title' => 'Transaction' ],
            [ 'id' => 'general_section', 'type' => 'section', 'page_id' => 'general',     'title' => 'General Section' ],
            [ 'id' => 'txn_section',     'type' => 'section', 'page_id' => 'transaction', 'title' => 'Transaction Section' ],
            [
                'id'         => $field_id_general,
                'type'       => 'field',
                'variant'    => 'text',
                'section_id' => 'general_section',
                'title'      => 'General Field',
            ],
            [
                'id'         => $field_id_transaction,
                'type'       => 'field',
                'variant'    => 'text',
                'section_id' => 'txn_section',
                'title'      => 'Transaction Field',
            ],
        ];
    }

    public function test_unique_field_ids_passes_when_all_ids_distinct(): void {
        $validator = new SchemaValidator();
        $result    = $validator->validate( $this->build_schema( 'foo', 'bar' ) );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' )
        );

        $this->assertEmpty( $duplicate_errors, 'No duplicate-field-id errors expected when all ids are unique.' );
    }

    public function test_unique_field_ids_fails_on_cross_page_collision(): void {
        $validator = new SchemaValidator();
        $result    = $validator->validate( $this->build_schema( 'shared_id', 'shared_id' ) );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' ) && str_contains( $msg, 'shared_id' )
        );

        $this->assertNotEmpty( $duplicate_errors, 'Expected a duplicate-field-id error when the same id appears under two pages.' );
    }

    public function test_unique_field_ids_ignores_non_field_elements(): void {
        // A `fieldgroup` and a `field` can share an id (existing schema pattern: google_map_api_key).
        $schema = [
            [ 'id' => 'general',         'type' => 'page',    'title' => 'General' ],
            [ 'id' => 'general_section', 'type' => 'section', 'page_id' => 'general', 'title' => 'General Section' ],
            [ 'id' => 'my_group',        'type' => 'fieldgroup', 'section_id' => 'general_section' ],
            [
                'id'             => 'my_group',
                'type'           => 'field',
                'variant'        => 'text',
                'field_group_id' => 'my_group',
                'title'          => 'My Field',
            ],
        ];

        $validator = new SchemaValidator();
        $result    = $validator->validate( $schema );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' )
        );

        $this->assertEmpty( $duplicate_errors, 'A field and a fieldgroup sharing an id must not trigger the field-id-uniqueness rule.' );
    }
}
```

- [ ] **Step 3: Run the new test, verify all three fail**

Run:
```bash
npm run phpunit -- --filter SchemaValidatorTest
```

Expected: three tests run. `test_unique_field_ids_passes_when_all_ids_distinct` PASSES vacuously (no `Duplicate field id` error exists because the rule isn't implemented). `test_unique_field_ids_fails_on_cross_page_collision` FAILS (asserts non-empty errors, but rule doesn't fire). `test_unique_field_ids_ignores_non_field_elements` PASSES vacuously.

Actual expected output mid-implementation: at least one failure on the `cross_page_collision` test with an empty `$duplicate_errors` array.

- [ ] **Step 4: Implement `check_unique_field_ids` in SchemaValidator**

Open `includes/Admin/Settings/Schema/SchemaValidator.php`. After the existing `check_variants()` method (line ~665), and before the public utility methods `add_error()` / `add_warning()` (line ~718), insert this new private method:

```php
    /**
     * Check that every field-type element has a globally unique id.
     *
     * Unlike `check_duplicate_ids()` (which scopes uniqueness to a field's parent
     * and produces warnings), this rule enforces uniqueness across the ENTIRE
     * merged schema and produces ERRORS. Required because settings are stored
     * in a single `dokan_settings` option keyed by field id — a duplicate id
     * means one field's value would silently overwrite another's.
     *
     * Non-field elements (page, subpage, section, etc.) are exempt: they have
     * no storage slot, so an id collision between a fieldgroup and a field is
     * harmless (and used intentionally in the schema, e.g., `google_map_api_key`).
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_unique_field_ids( array $elements ): void {
        $seen = [];

        foreach ( $elements as $element ) {
            if ( 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }
            $id = $element['id'] ?? '';
            if ( '' === $id ) {
                continue;
            }

            if ( isset( $seen[ $id ] ) ) {
                $this->errors[] = sprintf(
                    'Duplicate field id "%s" — every field must declare a globally unique id (required by single-option storage).',
                    $id
                );
                continue;
            }

            $seen[ $id ] = true;
        }
    }
```

- [ ] **Step 5: Wire the new check into `validate()`**

In the same file, find the `validate()` method (line ~214). Locate this block:

```php
        $this->check_required_properties( $elements );
        $this->check_parent_references( $elements );
        $this->check_parent_requirements( $elements );
        $this->check_reachability( $elements );
        $this->check_duplicate_ids( $elements );
        $this->check_variants( $elements );
```

Add one line after `check_variants`:

```php
        $this->check_required_properties( $elements );
        $this->check_parent_references( $elements );
        $this->check_parent_requirements( $elements );
        $this->check_reachability( $elements );
        $this->check_duplicate_ids( $elements );
        $this->check_variants( $elements );
        $this->check_unique_field_ids( $elements );
```

- [ ] **Step 6: Run the test, verify all three pass**

Run:
```bash
npm run phpunit -- --filter SchemaValidatorTest
```

Expected: three tests pass.

- [ ] **Step 7: Run full PHPUnit to surface any schema regressions**

Run:
```bash
npm run phpunit -- --filter 'SettingsSchemaTest|SchemaValidatorTest'
```

Expected: SettingsSchemaTest's `test_schema_passes_validator_with_no_errors` may now FAIL if the live `SettingsSchema.php` has any cross-page field-id duplicates. Read the failure message — it will list the duplicate ids by name. Record those for Task 3 (the cleanup task will rename them).

If `test_schema_passes_validator_with_no_errors` passes, the live schema is clean; Task 3's rename step has zero collisions to fix.

- [ ] **Step 8: Run PHPCS on the modified file**

Run:
```bash
composer phpcs -- includes/Admin/Settings/Schema/SchemaValidator.php
```

Expected: zero errors. If PHPCS complains, run `composer phpcbf -- includes/Admin/Settings/Schema/SchemaValidator.php` to auto-fix, then re-run.

- [ ] **Step 9: Commit**

```bash
git add tests/php/src/Admin/Settings/Schema/SchemaValidatorTest.php includes/Admin/Settings/Schema/SchemaValidator.php
git commit -m "feat(settings): enforce globally-unique field ids in SchemaValidator

Adds check_unique_field_ids() that fails the schema build when any two
type=field elements share an id. Required by upcoming single-option
storage (each field maps directly to a top-level key in dokan_settings,
so duplicates would silently overwrite each other).

Non-field elements (page, section, fieldgroup, etc.) are exempt — they
have no storage slot and the schema deliberately reuses ids across
types (e.g., google_map_api_key as both a fieldgroup and its inner
show_hide field)."
```

---

## Task 2: Atomic registry + controller refactor

**Files:**
- Create: `tests/php/src/Admin/Settings/Schema/SettingsRegistryStorageTest.php`
- Modify: `includes/Admin/Settings/Schema/SettingsRegistry.php`
- Modify: `includes/REST/AdminSettingsController.php`

All three are changed in a single commit because they're tightly coupled. After the registry switches to `dokan_settings` as its read source but before the controller switches its write target, saves would persist to old per-page keys while reads come from the new key — saves would silently vanish from the UI. Bundling avoids that broken intermediate state.

- [ ] **Step 1: Write the failing tests**

Create `tests/php/src/Admin/Settings/Schema/SettingsRegistryStorageTest.php` with EXACTLY:

```php
<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests the single-option `dokan_settings` storage model.
 *
 * Covers SettingsRegistry's populate_values() reads, generate_keys()
 * setting dependency_key = id, and the absence of per-page wp_options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-storage
 */
class SettingsRegistryStorageTest extends DokanTestCase {

    protected function setUp(): void {
        parent::setUp();
        delete_option( 'dokan_settings' );
    }

    protected function tearDown(): void {
        delete_option( 'dokan_settings' );
        parent::tearDown();
    }

    public function test_populate_values_reads_from_dokan_settings_by_id(): void {
        update_option(
            'dokan_settings',
            [
                'custom_store_url' => 'shop',
                'admin_percentage' => '15',
            ]
        );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $store_url_field = null;
        $admin_pct_field = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) !== 'field' ) {
                continue;
            }
            if ( ( $el['id'] ?? '' ) === 'custom_store_url' ) {
                $store_url_field = $el;
            }
            if ( ( $el['id'] ?? '' ) === 'admin_percentage' ) {
                $admin_pct_field = $el;
            }
        }

        $this->assertNotNull( $store_url_field, 'Field custom_store_url must exist in the schema.' );
        $this->assertSame( 'shop', $store_url_field['value'], 'custom_store_url value must come from dokan_settings.' );

        $this->assertNotNull( $admin_pct_field, 'Field admin_percentage must exist in the schema.' );
        $this->assertSame( '15', $admin_pct_field['value'], 'admin_percentage value must come from dokan_settings.' );
    }

    public function test_populate_values_falls_back_to_default_when_id_absent(): void {
        update_option( 'dokan_settings', [] );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'custom_store_url' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found, 'custom_store_url must exist.' );
        $this->assertSame( $found['default'] ?? '', $found['value'], 'Missing stored id must yield the field default.' );
    }

    public function test_generate_keys_sets_dependency_key_equal_to_id(): void {
        $schema = ( new SettingsRegistry() )->get_schema( true );

        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) !== 'field' ) {
                continue;
            }
            $id      = $el['id'] ?? '';
            $dep_key = $el['dependency_key'] ?? '';

            $this->assertSame(
                $id,
                $dep_key,
                sprintf( 'Field "%s" has dependency_key "%s" — expected to equal id.', $id, $dep_key )
            );
        }
    }

    public function test_no_per_page_wp_options_are_read(): void {
        // Seed the OLD per-page key with a value that would have been read by the previous code path.
        update_option( 'dokan_settings_general', [ 'marketplace' => [ 'marketplace_settings' => [ 'custom_store_url' => 'OLD_VALUE' ] ] ] );
        // The new key is empty, so reads should fall back to the field default — NOT to OLD_VALUE.
        delete_option( 'dokan_settings' );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'custom_store_url' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found );
        $this->assertNotSame( 'OLD_VALUE', $found['value'], 'Registry must no longer read from dokan_settings_general.' );

        delete_option( 'dokan_settings_general' );
    }
}
```

- [ ] **Step 2: Run the new tests, verify they fail**

Run:
```bash
npm run phpunit -- --filter SettingsRegistryStorageTest
```

Expected: at least three of the four tests FAIL — `populate_values_reads_from_dokan_settings_by_id` (registry reads per-page keys), `generate_keys_sets_dependency_key_equal_to_id` (dep_key is currently a dot-path), and `no_per_page_wp_options_are_read` (registry still reads the old key).

- [ ] **Step 3: Rewrite `SettingsRegistry::populate_values()`**

Open `includes/Admin/Settings/Schema/SettingsRegistry.php`. Locate `populate_values()` at line ~302. Replace its body (and the helper methods `find_page_id`, `get_stored_option`, `get_nested_value` immediately following it) with a simpler implementation. The new `populate_values()` becomes:

```php
    /**
     * Populate field values from the single dokan_settings wp_option.
     *
     * Reads `dokan_settings` once and looks up each field's value by its id.
     * Falls back to the field's `default` when the id is absent from storage.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with field `value` populated.
     */
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

Delete the three helper methods that no longer have callers within `SettingsRegistry`:

- `find_page_id( array $element, array $lookup, array $parent_pointer_types ): ?string` (line ~380)
- `get_stored_option( string $storage_key ): array` (line ~419)
- `get_nested_value( array $data, string $path )` (line ~438)

Simplify the cache. Replace the `private array $options_cache = [];` instance property with `private ?array $stored_cache = null;` (if you want to keep a per-instance read cache) or remove the property entirely (since `get_option` itself uses object cache within a request — usually sufficient). Update `clear_cache()` accordingly: either `$this->stored_cache = null;` or remove the method's body and leave it as a no-op for BC with `AdminSettingsController::update_item()`.

Recommended: keep `clear_cache()` as a no-op for now. Removing it requires editing every caller, which is busywork for no benefit.

- [ ] **Step 4: Change `SettingsRegistry::generate_keys()` to make `dependency_key === id`**

In the same file, locate `generate_keys()` at line ~96. Find the line that sets `dependency_key` (around line 161):

```php
            // dependency_key: path without the page prefix (relative to page).
            if ( empty( $element['dependency_key'] ) && count( $path ) > 1 ) {
                $element['dependency_key'] = implode( '.', array_slice( $path, 1 ) );
            }
```

Replace it with:

```php
            // dependency_key: equals the field's id (storage is flat, keyed by id).
            if ( empty( $element['dependency_key'] ) && 'field' === ( $element['type'] ?? '' ) && ! empty( $element['id'] ) ) {
                $element['dependency_key'] = $element['id'];
            }
```

`hook_key` generation in the same method stays unchanged — it serves a different purpose.

- [ ] **Step 5: Rewrite `AdminSettingsController::update_item()`**

Open `includes/REST/AdminSettingsController.php`. Locate `update_item()` (line ~136). Replace the body — from the first line inside the method to the closing brace — with:

```php
        $page_id     = $request->get_param( 'page_id' );
        $flat_values = $request->get_param( 'values' );

        if ( ! is_array( $flat_values ) ) {
            return new WP_Error(
                'dokan_rest_invalid_values',
                __( 'Values must be an object.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
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
         * @param string $page_id    The page being saved.
         * @param array  $sanitized  Sanitized values keyed by field id.
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
```

Delete the three helper methods that no longer have callers within `AdminSettingsController`:

- `get_page_storage_key( array $schema, string $page_id ): ?string` (line ~321)
- `flat_to_nested( array $flat_values ): array` (line ~527)
- `deep_merge( array $base, array $overlay ): array` (line ~561)

Keep `get_fields_by_page()`, `collect_page_descendants()`, `validate_field_value()`, and `sanitize_field_value()` — they're still used.

- [ ] **Step 6: Run the new test class, verify all four tests pass**

Run:
```bash
npm run phpunit -- --filter SettingsRegistryStorageTest
```

Expected: all four tests pass.

If `test_populate_values_reads_from_dokan_settings_by_id` fails with "Field custom_store_url must exist", check that field actually exists in `SettingsSchema.php` — it does at the time of writing, but if it was renamed during Task 3 of an earlier branch, swap the test's id for an existing one (verify with `grep -n "'custom_store_url'" includes/Admin/Settings/Schema/SettingsSchema.php`).

- [ ] **Step 7: Run the validator test from Task 1 to confirm it still passes**

Run:
```bash
npm run phpunit -- --filter SchemaValidatorTest
```

Expected: three tests pass.

- [ ] **Step 8: Run the existing schema test, expect possible new failures**

Run:
```bash
npm run phpunit -- --filter SettingsSchemaTest
```

Expected: most tests pass. The one likely failure is `test_schema_passes_validator_with_no_errors` if any cross-page field-id collisions exist (Task 1's validator now catches them). Record the failing-id names from the output; Task 3 renames them. If `SettingsSchemaTest` had any test that asserted a specific dot-path `dependency_key` value, that test also fails — note for adjustment in Task 3.

This failure is EXPECTED at this point. Do NOT fix it inside Task 2 — Task 3 owns the schema cleanup.

- [ ] **Step 9: Run PHPCS on the modified files**

Run:
```bash
composer phpcs -- includes/Admin/Settings/Schema/SettingsRegistry.php includes/REST/AdminSettingsController.php
```

Expected: zero errors. Run `composer phpcbf -- <same paths>` to auto-fix anything trivial.

- [ ] **Step 10: Commit**

```bash
git add tests/php/src/Admin/Settings/Schema/SettingsRegistryStorageTest.php includes/Admin/Settings/Schema/SettingsRegistry.php includes/REST/AdminSettingsController.php
git commit -m "refactor(settings): switch storage to single dokan_settings option

SettingsRegistry::populate_values() now reads once from dokan_settings
keyed by field id, instead of walking parent chains to per-page
wp_options. generate_keys() now sets dependency_key = id so the wire
format aligns with the storage shape.

AdminSettingsController::update_item() validates and sanitises by field
id, then array_merges into dokan_settings — replacing the previous
flat_to_nested → deep_merge → per-page-update_option chain.

Dead helpers removed: SettingsRegistry::{find_page_id,get_stored_option,
get_nested_value}, AdminSettingsController::{get_page_storage_key,
flat_to_nested,deep_merge}.

Action hook signatures change (dokan_before_saving_settings and
dokan_after_saving_settings drop \$storage_key). No production
callbacks exist yet; documented in CHANGELOG."
```

---

## Task 3: SettingsSchema cleanup — remove storage_key, rewrite dependency keys, fix id collisions

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`
- Optionally modify: `tests/php/src/Admin/Settings/Schema/SettingsSchemaTest.php` (only if a test directly asserted a specific dot-path `dependency_key` value — discovered in Task 2 Step 8)

After this task, `SettingsSchema.php` reflects the new convention: no per-page `storage_key`, no dot-path `dependency_key` references in `dependencies[]`, and no cross-page field-id collisions.

- [ ] **Step 1: Remove `storage_key` lines from each page declaration**

In `includes/Admin/Settings/Schema/SettingsSchema.php`, search for `'storage_key'`:

```bash
grep -n "'storage_key'" includes/Admin/Settings/Schema/SettingsSchema.php
```

Expected output (five lines for the Lite pages):
```
88:                'storage_key' => 'dokan_settings_general',
304:                'storage_key' => 'dokan_settings_transaction',
702:                'storage_key' => 'dokan_settings_vendor',
820:                'storage_key' => 'dokan_settings_appearance',
1183:                'storage_key' => 'dokan_settings_ai_assist',
```

Delete each of those lines. The page declaration arrays remain valid PHP (the `storage_key` key was always optional in the structural sense; the registry just ignored its absence after Task 2's rewrite).

If the file has any additional page declarations added on this branch that also carry a `storage_key`, delete those too. The grep above is authoritative — if it returns lines, delete them.

- [ ] **Step 2: Rewrite `dependencies[].key` dot-paths to field ids**

Search for every dot-path:

```bash
grep -n "'key' => '[^']*\\.[^']*'" includes/Admin/Settings/Schema/SettingsSchema.php
```

For each match, the value looks like `'commission.commission.commission_type'` or `'location.map_api_configuration.map_api_source'` etc. The last dot-segment is the target field's `id`. Rewrite the literal to just that segment.

Examples (these are the patterns from Task 2's grep — verify each is present in your tree):

```php
// Before:
[ 'key' => 'commission.commission.commission_type', 'value' => 'category_based', ... ]
// After:
[ 'key' => 'commission_type', 'value' => 'category_based', ... ]
```

```php
// Before:
[ 'key' => 'location.map_api_configuration.map_api_source', 'value' => 'google_maps', ... ]
// After:
[ 'key' => 'map_api_source', 'value' => 'google_maps', ... ]
```

```php
// Before:
[ 'key' => 'product_generation.product_image_section.product_info_generate', 'value' => 'on', ... ]
// After:
[ 'key' => 'product_info_generate', 'value' => 'on', ... ]
```

```php
// Before:
[ 'key' => 'commission.commission.reset_sub_category_when_edit_all_category', 'value' => 'off', ... ]
// After:
[ 'key' => 'reset_sub_category_when_edit_all_category', 'value' => 'off', ... ]
```

For each rewrite, immediately verify the target id exists somewhere in the file:

```bash
grep -n "'id'.*=>.*'commission_type'" includes/Admin/Settings/Schema/SettingsSchema.php
```

If the grep returns zero matches, the dependency is pointing at a nonexistent field — that's an existing schema bug; rename the dependency to point at whatever field currently does the conditional driving (read the surrounding context to figure out the intent).

For dynamically-built keys (e.g., `'key' => $dep_engine`), trace the variable's construction (search for `$dep_engine =` in the same file) and update the construction to use the target field's id directly rather than concatenating a dot-path.

- [ ] **Step 3: Reverse-grep to confirm zero dot-paths remain**

Run:
```bash
grep -n "'key' => '[^']*\\.[^']*'" includes/Admin/Settings/Schema/SettingsSchema.php
```

Expected: zero output. If anything matches, repeat Step 2 for that match.

- [ ] **Step 4: Run the schema test to surface field-id collisions**

Run:
```bash
npm run phpunit -- --filter 'SettingsSchemaTest::test_schema_passes_validator_with_no_errors'
```

The test output names each duplicate id detected by `check_unique_field_ids` (from Task 1). For each duplicate:

  a. Identify both occurrences in `SettingsSchema.php`:
  ```bash
  grep -n "'id'\\s*=>\\s*'<DUPLICATE_ID>'" includes/Admin/Settings/Schema/SettingsSchema.php
  ```

  b. Read the surrounding context to determine which one needs a rename. Prefer renaming the LESS prominent / more-domain-specific one (e.g., a generic `enabled` under "Compliance" gets `compliance_recaptcha_enabled`).

  c. Rename the field's `id` to a unique value.

  d. Reverse-grep to update every reference to the old id — both `dependencies[].key` references and any `enable_state` / `disable_state` references:
  ```bash
  grep -n "'<OLD_ID>'" includes/Admin/Settings/Schema/SettingsSchema.php
  ```
  Update every match that pointed at the renamed field.

  e. After all renames, re-run the test:
  ```bash
  npm run phpunit -- --filter 'SettingsSchemaTest::test_schema_passes_validator_with_no_errors'
  ```
  Expected: passes.

- [ ] **Step 5: Run the full SettingsSchemaTest**

Run:
```bash
npm run phpunit -- --filter SettingsSchemaTest
```

Expected: all tests pass. If a test that asserts a specific `dependency_key` value fails (e.g., asserts `'commission.commission.commission_type'` is the dep_key), update that assertion to the new id-based value (`'commission_type'`). Edit `SettingsSchemaTest.php` only for assertions of dot-path values — do not "fix" assertions of broader schema invariants.

- [ ] **Step 6: Run the registry storage test from Task 2**

Run:
```bash
npm run phpunit -- --filter SettingsRegistryStorageTest
```

Expected: all four tests still pass. If `test_populate_values_reads_from_dokan_settings_by_id` now fails because one of the field ids it asserts (`custom_store_url`, `admin_percentage`) got renamed during the collision fix, update the test's expected id to the new name.

- [ ] **Step 7: Run the full admin-settings group**

Run:
```bash
npm run phpunit -- --group admin-settings
```

Expected: every test in the `admin-settings` group passes. Investigate any unexpected failure.

- [ ] **Step 8: Run PHPCS on the schema file**

Run:
```bash
composer phpcs -- includes/Admin/Settings/Schema/SettingsSchema.php
```

Expected: zero errors. PHPCS may complain about long lines after rewrites — auto-fix with `composer phpcbf -- includes/Admin/Settings/Schema/SettingsSchema.php`.

- [ ] **Step 9: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php tests/php/src/Admin/Settings/Schema/SettingsSchemaTest.php
git commit -m "refactor(settings): clean SettingsSchema for single-option storage

- Remove the now-ignored storage_key declarations from every page
  (general, transaction, vendor, appearance, ai_assist).
- Rewrite ~40 dependencies[].key references from dot-paths
  (commission.commission.commission_type) to plain field ids
  (commission_type), matching the registry's new dependency_key = id.
- Rename any cross-page field-id collisions caught by the validator's
  new check_unique_field_ids rule, plus their dependency back-references.
- Adjust SettingsSchemaTest assertions of literal dependency_key values
  to the new id form."
```

---

## Task 4: End-to-end verification

**Files:** none.

This task does not modify code. It walks through the verification steps from the design's Risks/Tradeoffs section and confirms the change works against a running site.

- [ ] **Step 1: Run the full PHP test suite**

Run:
```bash
npm run phpunit
```

Expected: zero failures across the whole suite. If a non-admin-settings test fails (e.g., something in Commission, Withdrawal, Vendor), read it carefully — the failure is either unrelated (pre-existing) or a downstream consumer of `dokan_get_option` / `get_option('dokan_settings_*')` that broke when we deleted the per-page keys.

If a downstream consumer broke, that's out of scope for this plan — record the consumer name and stop here for a separate fix.

- [ ] **Step 2: Wipe any orphan per-page options from dev install**

Optional but recommended for a clean test:
```bash
npm run wp-env -- run cli wp option delete dokan_settings_general
npm run wp-env -- run cli wp option delete dokan_settings_transaction
npm run wp-env -- run cli wp option delete dokan_settings_vendor
npm run wp-env -- run cli wp option delete dokan_settings_appearance
npm run wp-env -- run cli wp option delete dokan_settings_ai_assist
```

Expected: each command reports success or "Could not delete (option does not exist)". Either is fine.

- [ ] **Step 3: Manual smoke test — load and save**

In a browser:

1. Navigate to WP admin → Dokan → Settings.
2. Confirm the page renders (sidebar + content area; no console errors).
3. On the General page, change "Vendor Store URL" prefix to `store-flat-test-XYZ`.
4. Click save.
5. Network tab: verify a `PUT /dokan/v1/admin/settings/general` request fires with body `{"values":{"custom_store_url":"store-flat-test-XYZ"}}` (or similar — the key is the field id, not a dot-path).
6. The PUT should return 200.
7. Reload the page. The new value persists.

- [ ] **Step 4: Verify the storage shape directly**

Run:
```bash
npm run wp-env -- run cli wp option get dokan_settings --format=json
```

Expected: a JSON object with top-level keys equal to field ids — `custom_store_url`, plus any other fields the smoke test touched, plus their values. NO nested structure like `marketplace.marketplace_settings.custom_store_url`.

- [ ] **Step 5: Verify no per-page options were written**

Run:
```bash
npm run wp-env -- run cli wp option get dokan_settings_general --format=json
```

Expected: error / "could not be found". The per-page options should no longer exist after Step 2's wipe; saving via the new controller writes to `dokan_settings`, not back to per-page keys.

- [ ] **Step 6: Try a known-bad save (validation path)**

Find a field with `validations` (e.g., a numeric field with `min_value`). In the browser, set it to an invalid value, save. Confirm:

- The PUT returns 400.
- The response body includes `{"code":"dokan_rest_validation_failed", ... ,"errors": { "<field_id>": [ ... ] }}` — note the error map is keyed by field id, not by dot-path.
- The `dokan_settings` option was NOT modified (re-run Step 4 to confirm the previous good value is still there).

- [ ] **Step 7: Document accepted regressions**

Confirm the spec's Risks/Tradeoffs hold:

  a. **Hook signature change** — In a temp mu-plugin, add `add_action('dokan_before_saving_settings', function($page_id, $sanitized) { error_log('SAVED ' . $page_id . ' ' . count($sanitized)); }, 10, 2);`. Save settings in the admin. Verify the log entry fires with the new two-argument signature. Remove the mu-plugin.

  b. **Array-valued fields replaced (not deep-merged)** — Find a `multicheck` field. Set it to ["a","b","c"], save. Set it to just ["a"], save. Run `wp option get dokan_settings --format=json` and confirm the field's stored value is `["a"]` (not `["a","b","c"]`).

This task has no commit — it is verification only. If any step fails, open a new task in this plan (or a follow-up plan) to address the specific issue.

---

## Out-of-Scope Reminders

Per the spec, these are intentionally NOT in this plan:

- Legacy Vue keys (`dokan_general`, `dokan_selling`, `dokan_pages`, etc.) and the `dokan_get_option` shim.
- A new PHP accessor helper (e.g., `dokan_settings_get()`).
- Renaming or dropping `dependency_key` from the schema/REST output.
- Frontend changes — `src/admin/dashboard/pages/settings/index.tsx` is untouched.
- Migration tooling for production data — none exists yet in the new keys.

If any of these come up as needed during implementation, stop and flag — they are follow-up changes, not this plan's scope.
