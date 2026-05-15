# CSV-Driven Settings Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build out the new flat `dokan_settings` schema and the `LegacySettingsBridge` mapping using `/Users/mahbub/Downloads/Settings.Mapping.-.fields_extracted_fixed.csv` as the source of truth — 225 legacy fields across 30 sections re-organized into 10 new top-level tabs — so the plugin-ui settings page covers every existing field with no silent regressions.

**Architecture:** The CSV is treated as a frozen contract. Each row produces one `SettingsSchema` field declaration with `legacy_key` pointing back at the legacy `dokan_<section>.<field>` address. The bridge then becomes a real bidirectional sync (currently only 1 field is wired). Work is staged by new top-level tab so each ships independently. Bridge gaps surfaced in the 30-tab trace (nested-array legacy fields, reverse-bulk propagation, reshape cases) are addressed in dedicated tasks rather than per-tab.

**Tech Stack:** PHP 7.4+ / namespaced classes, League Container DI, PHPUnit 9.6 + Brain Monkey, `SettingsSchema`, `LegacySettingsBridge`, the legacy AJAX `dokan_save_settings` handler, `dokan_get_option()` shim, the new REST write path.

---

## Source artifacts

- **CSV:** `/Users/mahbub/Downloads/Settings.Mapping.-.fields_extracted_fixed.csv` (228 lines: 1 header + 225 field rows + 2 trailing/quoted-newline rows). Treat as read-only frozen input.
- **Trace report:** `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` — evidence-backed per-field behavior of the legacy AJAX page; consult when CSV says only "where" but you need to know "how".
- **Spec being amended:** `docs/superpowers/specs/2026-05-14-settings-trace-design.md` — the trace project's design doc; this plan is a follow-on.
- **Existing bridge:** `includes/Admin/Settings/Migration/LegacySettingsBridge.php` (assessed; currently propagates only 1 field).
- **Existing schema:** `includes/Admin/Settings/Schema/SettingsSchema.php` (currently the new-UI source; 1 `legacy_key` declared).

## CSV shape (frozen)

```
SectionKey,Label,Description,Mapping,New Label,New Description,FieldKey,FieldName,FieldType,DefaultValue,OtherInfoJSON
```

Distribution of mapped destinations (top-level segment of the `Mapping` column):

| New top-level tab | Fields | Source sections (selected) |
| --- | --- | --- |
| Vendors | 46 | `dokan_general`, `dokan_selling`, `dokan_product_subscription`, `dokan_spmv`, `dokan_social_api`, `dokan_verification_sms_gateways`, `dokan_vendor_analytics` |
| Product | 28 | `dokan_printful`, `dokan_quote_settings`, `dokan_product_advertisement`, `dokan_wholesale` |
| Transactions | 32 (25 + 7 typo'd `Transaction`) | `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_selling` (commissions) |
| General | 22 | `dokan_general`, `dokan_pages`, `dokan_geolocation`, `dokan_live_search_setting`, `dokan_appearance` |
| Shipment | 21 | `dokan_delivery_time`, `dokan_shipping_status_setting`, `dokan_general` |
| Appearance | 20 | `dokan_appearance`, `dokan_colors`, `dokan_general`, `dokan_menu_manager`, `dokan_verification`, `dokan_selling` |
| Moderation | 18 | `dokan_live_chat`, `dokan_rma`, `dokan_store_support_setting`, `dokan_report_abuse` |
| Compliance | 11 | `dokan_general`, `dokan_privacy`, `dokan_germanized` |
| AI Assist | 5 | `dokan_ai` |
| Verification | 5 | `dokan_verification`, `dokan_email_verification` |
| **Unmapped** | 17 | (decided in Task 1) |

## Conventions used throughout

- **Tab order in code:** General → Vendors → Product → Transactions → Shipment → Appearance → Moderation → Compliance → Verification → AI Assist. Matches an admin-facing reading order; can be reordered with one `SettingsSchema` change.
- **Field id rule:** Each new field gets `id = '<new_top_tab_slug>_<new_subsection_slug>_<csv_FieldKey>'` unless the CSV's New Label collides — then disambiguate with a suffix. Slug rule: `strtolower(preg_replace('/[^a-z0-9]+/i', '_', $segment))` trimmed of underscores.
- **`legacy_key` rule:** Always written as the struct form `[ 'option' => 'dokan_<section>', 'field' => '<FieldKey>' ]`. Reserve the dotted-string form for legacy_key entries hand-edited by humans.
- **Drop policy for `Mapping == '-'`:** by default treat as **deferred-not-deleted** — the field still appears in the bridge mapping so legacy installs don't lose data, but the new schema doesn't surface a UI control. Task 1 decides exceptions.
- **`Transactions` typo unification:** every CSV row with top-level `Transaction` (7 rows from `dokan_selling`) is folded into `Transactions`. Document the unification in Task 1's commit.
- **Commit cadence:** one commit per task. Message format: `feat(settings): <what>` for code, `docs(settings-mig): <what>` for plan/spec updates, `test(settings): <what>` for tests.

---

## Task 0: Inventory, dedupe, and freeze the CSV-derived field list

**Files:**
- Create: `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md`
- Create: `tools/migration/parse_settings_csv.php`

- [ ] **Step 1: Write the CSV parser script**

Path: `tools/migration/parse_settings_csv.php`. PHP CLI script that reads the CSV via `fgetcsv()` (handles quoted commas natively) and emits JSON of one record per row with normalized fields:

```php
<?php
$path = $argv[1] ?? '/Users/mahbub/Downloads/Settings.Mapping.-.fields_extracted_fixed.csv';
$fh   = fopen( $path, 'r' );
$head = fgetcsv( $fh );
$out  = [];
while ( ( $r = fgetcsv( $fh ) ) !== false ) {
    if ( count( $r ) < 11 ) {
        continue; // skip malformed continuation rows
    }
    $rec = array_combine( $head, $r );
    $rec['_new_top']    = trim( explode( '>', $rec['Mapping'] )[0] ?? '' );
    $rec['_new_path']   = array_map( 'trim', explode( '>', $rec['Mapping'] ) );
    $rec['_other_info'] = json_decode( $rec['OtherInfoJSON'], true ) ?: [];
    $out[] = $rec;
}
echo json_encode( $out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
```

- [ ] **Step 2: Run it and verify counts**

```bash
php tools/migration/parse_settings_csv.php > /tmp/csv_inventory.json
jq 'length' /tmp/csv_inventory.json   # expect 225
jq '[.[] | select(._new_top == "" or ._new_top == "-")] | length' /tmp/csv_inventory.json  # expect 17
jq '[.[] | ._new_top] | group_by(.) | map({k:.[0], n:length}) | sort_by(-.n)' /tmp/csv_inventory.json
```

- [ ] **Step 3: Unify the `Transaction` → `Transactions` typo**

```bash
jq 'map(if ._new_top == "Transaction" then ._new_top = "Transactions" | ._new_path[0] = "Transactions" else . end)' \
   /tmp/csv_inventory.json > /tmp/csv_inventory.unified.json
jq '[.[] | ._new_top] | group_by(.) | map({k:.[0], n:length}) | sort_by(-.n)' /tmp/csv_inventory.unified.json
```
Expect 10 top-level destinations (Vendors 46, Product 28, Transactions 32, General 22, Shipment 21, Appearance 20, Moderation 18, Compliance 11, AI Assist 5, Verification 5) plus empty/dash (17).

- [ ] **Step 4: Write the inventory doc**

Write `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md` containing:

```markdown
# CSV-derived settings field inventory

**Source:** `Settings.Mapping.-.fields_extracted_fixed.csv` (225 fields)
**Generated:** 2026-05-16

## Top-level destinations (post-typo-fix)

| Top tab | Fields |
| --- | --- |
| Vendors | 46 |
| Transactions | 32 |
| Product | 28 |
| General | 22 |
| Shipment | 21 |
| Appearance | 20 |
| Moderation | 18 |
| Compliance | 11 |
| AI Assist | 5 |
| Verification | 5 |
| (unmapped) | 17 |

## Unmapped fields — decisions

| Section | FieldKey | Type | Decision | Reason |
| --- | --- | --- | --- | --- |
| dokan_general | site_options | sub_section | DROP | UI header, no value |
| dokan_general | vendor_store_options | sub_section | DROP | UI header |
| dokan_general | product_page_options | sub_section | DROP | UI header |
| dokan_selling | commission | sub_section | DROP | UI header |
| dokan_selling | fee-recipients | sub_section | DROP | UI header |
| dokan_selling | selling_capabilities | sub_section | DROP | UI header |
| dokan_selling | catalog_mode_settings | sub_section | DROP | UI header |
| dokan_appearance | appearance_options | sub_section | DROP | UI header |
| dokan_social_api | section_title | sub_section | DROP | UI header |
| dokan_selling | catalog_mode_hide_product_price | switcher | KEEP-BRIDGE-ONLY | Real field, no new home in CSV — bridge preserves DB value but no new-UI control until product owner assigns a destination |
| dokan_appearance | store_map | switcher | KEEP-BRIDGE-ONLY | Same as above |
| dokan_geolocation | location | gmap | KEEP-BRIDGE-ONLY-NESTED | Complex nested shape; Task 7 handles it |
| dokan_product_subscription | cancelling_email_subject | textarea | KEEP-BRIDGE-ONLY | Email template — likely moves to email settings |
| dokan_product_subscription | cancelling_email_body | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_subscription | alert_email_subject | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_subscription | alert_email_body | textarea | KEEP-BRIDGE-ONLY | Email template |
| dokan_product_advertisement | vendor_subscription_enabled | switcher | KEEP-BRIDGE-ONLY | Needs new-tab decision |

## Reserved unmapped → bridge-only protocol

Bridge-only fields:
- Appear in the bridge mapping (`legacy_key` declared).
- Do NOT appear in `SettingsSchema::get_schema()` as visible elements.
- Their stored values are preserved across the new flat option and legacy options.
- A follow-on task adds a `bridge_only: true` annotation on the schema entry so the bridge picks them up.
```

- [ ] **Step 5: Commit**

```bash
git add tools/migration/parse_settings_csv.php docs/superpowers/specs/2026-05-16-csv-fields-inventory.md
git commit -m "docs(settings-mig): freeze CSV-derived field inventory and unmapped-field decisions"
```

---

## Task 1: Bridge upgrades to support the full CSV

The current bridge supports only flat `option.field` addresses and only the `legacy → new` write direction. The CSV reveals 4 needs not covered:

1. **`bridge_only: true`** fields (no UI element but legacy round-trip required).
2. **Reverse-bulk propagation:** `update_option('dokan_settings')` must mirror back into the relevant legacy `dokan_<section>` rows so direct `get_option()` Pro readers see fresh values.
3. **Nested-array legacy fields** (e.g., `dokan_geolocation.location.latitude`, `dokan_withdraw.withdraw_methods.paypal`, `dokan_colors.store_color_pallete.value`). Need dotted-path traversal beyond the second segment.
4. **Schema reshape cases** (e.g., Delivery Time 7 day-fields → 1 `delivery_days_schedule`). Bridge cannot express via per-field `legacy_key`; needs a transformer hook.

**Files:**
- Modify: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Create: `includes/Admin/Settings/Migration/LegacyAddress.php` (value object)
- Create: `includes/Admin/Settings/Migration/Transformer/TransformerInterface.php`
- Create: `includes/Admin/Settings/Migration/Transformer/PassThroughTransformer.php`
- Modify: `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php`
- Create: `tests/php/src/Admin/Settings/Migration/LegacyAddressTest.php`
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

- [ ] **Step 1: Write the failing test — deep-path legacy address**

`tests/php/src/Admin/Settings/Migration/LegacyAddressTest.php`:

```php
<?php
namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\DokanTest\DokanTestCase;
use WeDevs\Dokan\Admin\Settings\Migration\LegacyAddress;

class LegacyAddressTest extends DokanTestCase {
    public function test_parses_two_segment_address() {
        $addr = LegacyAddress::parse( 'dokan_general.site_logo' );
        $this->assertSame( 'dokan_general', $addr->option() );
        $this->assertSame( [ 'site_logo' ], $addr->path() );
    }

    public function test_parses_nested_path() {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $this->assertSame( 'dokan_geolocation', $addr->option() );
        $this->assertSame( [ 'location', 'latitude' ], $addr->path() );
    }

    public function test_reads_nested_value() {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $val  = $addr->read_from( [ 'location' => [ 'latitude' => '23.45' ] ] );
        $this->assertSame( '23.45', $val );
    }

    public function test_writes_nested_value() {
        $addr = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $arr  = [];
        $addr->write_to( $arr, '23.45' );
        $this->assertSame( [ 'location' => [ 'latitude' => '23.45' ] ], $arr );
    }

    public function test_rejects_blank_segments() {
        $this->assertNull( LegacyAddress::parse( 'dokan_general.' ) );
        $this->assertNull( LegacyAddress::parse( '.field' ) );
        $this->assertNull( LegacyAddress::parse( '' ) );
    }
}
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm run phpunit -- --filter LegacyAddressTest
```
Expected: FAIL — `LegacyAddress` class not found.

- [ ] **Step 3: Implement `LegacyAddress` value object**

`includes/Admin/Settings/Migration/LegacyAddress.php`:

```php
<?php
namespace WeDevs\Dokan\Admin\Settings\Migration;

final class LegacyAddress {
    /** @var string */
    private $option;
    /** @var array<int,string> */
    private $path;

    private function __construct( string $option, array $path ) {
        $this->option = $option;
        $this->path   = $path;
    }

    public static function parse( $input ): ?self {
        if ( is_array( $input ) && isset( $input['option'], $input['field'] ) ) {
            $option = (string) $input['option'];
            $field  = (string) $input['field'];
            if ( '' === $option || '' === $field ) {
                return null;
            }
            return new self( $option, [ $field ] );
        }
        if ( is_string( $input ) && strpos( $input, '.' ) !== false ) {
            $parts = explode( '.', $input );
            if ( count( $parts ) < 2 ) {
                return null;
            }
            $option = array_shift( $parts );
            if ( '' === $option || in_array( '', $parts, true ) ) {
                return null;
            }
            return new self( $option, $parts );
        }
        return null;
    }

    public function option(): string {
        return $this->option;
    }

    /** @return array<int,string> */
    public function path(): array {
        return $this->path;
    }

    public function read_from( array $legacy ) {
        $cursor = $legacy;
        foreach ( $this->path as $segment ) {
            if ( ! is_array( $cursor ) || ! array_key_exists( $segment, $cursor ) ) {
                return null;
            }
            $cursor = $cursor[ $segment ];
        }
        return $cursor;
    }

    public function write_to( array &$legacy, $value ): void {
        $cursor = &$legacy;
        foreach ( $this->path as $i => $segment ) {
            $last = $i === count( $this->path ) - 1;
            if ( $last ) {
                $cursor[ $segment ] = $value;
                return;
            }
            if ( ! isset( $cursor[ $segment ] ) || ! is_array( $cursor[ $segment ] ) ) {
                $cursor[ $segment ] = [];
            }
            $cursor = &$cursor[ $segment ];
        }
    }
}
```

- [ ] **Step 4: Verify Step 1 tests pass**

```bash
npm run phpunit -- --filter LegacyAddressTest
```
Expected: PASS 5/5.

- [ ] **Step 5: Refactor bridge to use `LegacyAddress`**

In `LegacySettingsBridge.php`, replace `parse_address()` with `LegacyAddress::parse()` and the read/write helpers (`array_key_exists` followed by `$legacy[ $field ]`) with `$address->read_from( $legacy )` and `$address->write_to( $legacy, $value )`. Update the `by_option` index to store the `LegacyAddress` instance instead of the `field` string. Re-run `LegacySettingsBridgeTest`; all existing tests must still pass.

- [ ] **Step 6: Write failing test for reverse-bulk propagation**

In `LegacySettingsBridgeTest.php`, add:

```php
public function test_writes_back_to_legacy_options_on_new_save() {
    update_option( 'dokan_general', [ 'site_logo' => 'old.png' ] );
    update_option( 'dokan_settings', [ 'general_marketplace_site_logo' => 'new.png' ] );

    $bridge = new \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge();
    $written = $bridge->write_new_to_legacy( [ 'general_marketplace_site_logo' => 'new.png' ] );

    $this->assertContains( 'dokan_general', $written );
    $this->assertSame( 'new.png', get_option( 'dokan_general' )['site_logo'] );
}
```

(Assumes a `legacy_key` is declared for `general_marketplace_site_logo` → `dokan_general.site_logo` in fixtures; add via `dokan_legacy_settings_key_mapping` filter inside the test.)

- [ ] **Step 7: Implement `write_new_to_legacy`**

In `LegacySettingsBridge.php`, add:

```php
/**
 * Mirror a new-option slice back into the relevant legacy wp_options.
 *
 * Used when the new UI writes `dokan_settings`. The bridge groups changes
 * by legacy option name, reads each legacy option, writes the mapped
 * sub-paths in-place, and persists with `update_option`. Returns the list
 * of legacy option names that were written.
 *
 * @param array<string,mixed> $new_slice  Subset of `dokan_settings` keys to mirror.
 *
 * @return array<int,string>
 */
public function write_new_to_legacy( array $new_slice ): array {
    $this->build_map();
    $changes_by_option = [];
    foreach ( $new_slice as $new_key => $value ) {
        $address = $this->map[ $new_key ] ?? null;
        if ( ! $address instanceof LegacyAddress ) {
            continue;
        }
        $changes_by_option[ $address->option() ][] = [ $address, $value ];
    }
    $written = [];
    foreach ( $changes_by_option as $option_name => $entries ) {
        $legacy = get_option( $option_name, [] );
        if ( ! is_array( $legacy ) ) {
            $legacy = [];
        }
        foreach ( $entries as [ $address, $value ] ) {
            $address->write_to( $legacy, $value );
        }
        update_option( $option_name, $legacy );
        $written[] = $option_name;
    }
    return $written;
}
```

- [ ] **Step 8: Verify Step 6 test passes**

```bash
npm run phpunit -- --filter LegacySettingsBridgeTest
```

- [ ] **Step 9: Wire reverse propagation on `dokan_settings` writes**

Add a listener in `AdminSettingsServiceProvider::register()` (or a dedicated `BridgeBootstrap` class — choose to keep DI provider focused; create a dedicated file `includes/Admin/Settings/Migration/BridgeBootstrap.php`). On `update_option_dokan_settings` and `add_option_dokan_settings`, diff old vs new, build the changed slice, call `write_new_to_legacy( $changed_slice )`. Guard with a static reentry flag so the legacy write doesn't trigger another new write through the AJAX-save propagation path (Settings.php:183).

- [ ] **Step 10: Define `TransformerInterface` and `PassThroughTransformer`**

For reshape cases (Task 7+ tabs), the bridge needs a per-field transformer hook. Define:

```php
namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

interface TransformerInterface {
    /** Legacy → new value. */
    public function to_new( $legacy_value );

    /** New → legacy value. */
    public function to_legacy( $new_value );
}
```

`PassThroughTransformer` implements both as identity. Bridge consults `$element['legacy_transformer']` (FQCN string); if absent, defaults to pass-through. Resolve via DI container `try/catch` so tests can swap in fakes.

- [ ] **Step 11: Add a `bridge_only: true` annotation**

In the bridge's `harvest_from_schema()`, accept fields with `'type' => 'field'` OR `'bridge_only' => true`. The latter are not emitted by the new UI but still participate in mapping. Test: a bridge-only field round-trips through `hydrate_new_from_legacy` and `write_new_to_legacy`.

- [ ] **Step 12: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacyAddress.php \
        includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        includes/Admin/Settings/Migration/Transformer/ \
        includes/Admin/Settings/Migration/BridgeBootstrap.php \
        includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php \
        tests/php/src/Admin/Settings/Migration/
git commit -m "feat(settings): bridge supports deep paths, reverse propagation, transformers, bridge-only fields"
```

---

## Task 2: Build the CSV→schema code generator

The schema for ~208 mapped fields is too large to hand-author safely. Write a one-shot generator that produces a PHP file the schema can `require`. The generator stays in `tools/` and is re-runnable; it never auto-executes on production.

**Files:**
- Create: `tools/migration/generate_schema_fragment.php`
- Create: `tests/php/src/Admin/Settings/Schema/GeneratedFragmentTest.php`

- [ ] **Step 1: Failing test asserting generated fragment is loadable and produces N elements**

```php
public function test_generated_fragment_returns_expected_element_count() {
    $fragment = require dirname( __DIR__, 4 ) . '/../includes/Admin/Settings/Schema/Generated/csv_fields.php';
    $this->assertIsArray( $fragment );
    // 208 visible fields (225 - 17 unmapped) + however many sub_section/group elements we wrap each subsection in.
    $field_count = count( array_filter( $fragment, fn( $e ) => ( $e['type'] ?? '' ) === 'field' ) );
    $this->assertSame( 208, $field_count );
}

public function test_every_field_has_legacy_key_struct() {
    $fragment = require dirname( __DIR__, 4 ) . '/../includes/Admin/Settings/Schema/Generated/csv_fields.php';
    foreach ( $fragment as $element ) {
        if ( ( $element['type'] ?? '' ) !== 'field' ) {
            continue;
        }
        $this->assertArrayHasKey( 'legacy_key', $element, "Field {$element['id']} missing legacy_key" );
        $this->assertIsArray( $element['legacy_key'] );
        $this->assertArrayHasKey( 'option', $element['legacy_key'] );
        $this->assertArrayHasKey( 'field', $element['legacy_key'] );
    }
}
```

- [ ] **Step 2: Run test, verify it fails**

PASS/FAIL: FAIL — `Generated/csv_fields.php` doesn't exist yet.

- [ ] **Step 3: Write the generator**

`tools/migration/generate_schema_fragment.php`. PHP CLI. Reads the unified inventory JSON from Task 0 Step 3, emits `includes/Admin/Settings/Schema/Generated/csv_fields.php` containing a `return [ ... ]` array.

For each non-unmapped CSV row, emit:

```php
[
    'type'        => 'field',
    'id'          => $slug,                  // generated per id rule
    'top_tab'     => $row['_new_top'],       // e.g. 'Vendors'
    'sub_path'    => array_slice( $row['_new_path'], 1 ),
    'label'       => $row['New Label'] !== '-' ? $row['New Label'] : $row['Label'],
    'description' => $row['New Description'] !== '-' ? $row['New Description'] : $row['Description'],
    'field_type'  => $row['FieldType'],
    'default'     => $row['DefaultValue'],
    'is_lite'     => $row['_other_info']['is_lite'] ?? false,
    'legacy_key'  => [
        'option' => $row['SectionKey'],
        'field'  => $row['FieldKey'],
    ],
],
```

For unmapped rows where the inventory says `KEEP-BRIDGE-ONLY`, emit:

```php
[
    'bridge_only' => true,
    'id'          => 'bridge_only_' . $slug,
    'legacy_key'  => [ 'option' => $row['SectionKey'], 'field' => $row['FieldKey'] ],
],
```

Skip rows marked `DROP`.

- [ ] **Step 4: Run the generator**

```bash
php tools/migration/generate_schema_fragment.php \
    /tmp/csv_inventory.unified.json \
    > includes/Admin/Settings/Schema/Generated/csv_fields.php
php -l includes/Admin/Settings/Schema/Generated/csv_fields.php  # lint
```

- [ ] **Step 5: Verify the test passes**

```bash
npm run phpunit -- --filter GeneratedFragmentTest
```
Expected: PASS 2/2.

- [ ] **Step 6: Wire the fragment into `SettingsSchema`**

In `SettingsSchema::get_schema()`, after the hand-authored entries, splice in the generated array via `array_merge`. Gate behind a feature flag option `dokan_csv_schema_enabled` (default off) so the diff is reviewable in isolation. Off-by-default keeps production behavior identical until Task 8 flips it on.

- [ ] **Step 7: Commit**

```bash
git add tools/migration/generate_schema_fragment.php \
        includes/Admin/Settings/Schema/Generated/csv_fields.php \
        includes/Admin/Settings/Schema/SettingsSchema.php \
        tests/php/src/Admin/Settings/Schema/GeneratedFragmentTest.php
git commit -m "feat(settings): CSV-driven schema fragment, off by default"
```

---

## Tasks 3–12: Per-tab field wire-up (one task per new top-level tab)

Each task takes one new top-level tab from the inventory, audits the generated fragment for that tab, fills in nuance the generator can't (hand-authored validation rules, dependencies, transformers, `OtherInfoJSON` interpretation), and writes the parity tests.

The 10 per-tab tasks all share the same step template. Substitute `<TAB>` (e.g. `Vendors`), `<tab_slug>` (e.g. `vendors`), and `<expected_field_count>` from the inventory table.

### Per-tab task template

**Files:**
- Modify: `includes/Admin/Settings/Schema/Generated/csv_fields.php` (annotate, not regenerate, where hand-tuning is needed)
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php` (tab-level structure: sub-sections, ordering)
- Create: `tests/php/src/Admin/Settings/Schema/Tab/<TAB>SchemaTest.php`

- [ ] **Step 1: Static audit**

Run the generator's fragment through a filter:
```bash
php -r '$f = require "includes/Admin/Settings/Schema/Generated/csv_fields.php";
        $tab = array_filter( $f, fn( $e ) => ( $e["top_tab"] ?? "" ) === "<TAB>" );
        echo count( $tab ) . PHP_EOL;
        foreach ( $tab as $e ) { printf("  %-40s  %s.%s\n", $e["id"], $e["legacy_key"]["option"], $e["legacy_key"]["field"]); }'
```
Expect `<expected_field_count>` rows. If mismatch, stop and reconcile against `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md`.

- [ ] **Step 2: Cross-reference the trace report**

Open `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` and locate every legacy section feeding this tab (per the inventory). For each, confirm the trace's per-field findings are addressed:

- **Validation:** does the legacy section have a fail-closed validator (Reverse Withdrawal, Withdraw, Product Advertising, Delivery Time, Custom Withdraw Method)? Port the validator into the new field's `sanitize_callback` or a dedicated `Validator` class. **Do not** rely on the legacy `dokan_before_saving_settings` hook from the AJAX path.
- **Read-time normalization:** does the legacy section have a `dokan_get_settings_values` filter (e.g. `set_withdraw_limit_gateways`, `set_commission_type_if_not_set`, Colors palette-name shim)? Port to the new schema's read pipeline.
- **Side effects:** wp_posts mutation (Subscription), background jobs (SPMV), Action Scheduler crons (Reverse Withdrawal), rewrite flush (General `custom_store_url`), self-seeders (Shipping Status, Delivery Time). Decide for each: port to new save path, defer, or delete (with explicit ADR).

- [ ] **Step 3: Failing parity test**

`tests/php/src/Admin/Settings/Schema/Tab/<TAB>SchemaTest.php` — for each field in the tab, assert:

```php
public function test_tab_<tab_slug>_has_expected_field_count() {
    $schema = $this->fragment_for_tab( '<TAB>' );
    $this->assertCount( <expected_field_count>, $schema );
}

public function test_every_legacy_key_maps_to_a_real_legacy_option() {
    $known_legacy = [ 'dokan_general', 'dokan_selling', 'dokan_withdraw', /* ... all 30 */ ];
    foreach ( $this->fragment_for_tab( '<TAB>' ) as $element ) {
        $this->assertContains( $element['legacy_key']['option'], $known_legacy );
    }
}

public function test_legacy_save_propagates_to_new_settings_for_<tab_slug>() {
    foreach ( $this->fragment_for_tab( '<TAB>' ) as $element ) {
        $legacy_option = $element['legacy_key']['option'];
        $legacy_field  = $element['legacy_key']['field'];
        $new_id        = $element['id'];

        update_option( $legacy_option, [ $legacy_field => '__T_parity_' . $new_id ] );

        // Trigger the legacy AJAX save handler's propagation path.
        $bridge = new \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new( $legacy_option, [ $legacy_field => '__T_parity_' . $new_id ] );
        $existing_new = get_option( 'dokan_settings', [] );
        update_option( 'dokan_settings', array_merge( $existing_new, $slice ) );

        $new = get_option( 'dokan_settings', [] );
        $this->assertSame(
            '__T_parity_' . $new_id,
            $new[ $new_id ] ?? null,
            "Legacy save for {$legacy_option}.{$legacy_field} did not propagate to dokan_settings[{$new_id}]"
        );
    }
}

public function test_new_save_propagates_back_to_legacy_for_<tab_slug>() {
    $payload = [];
    foreach ( $this->fragment_for_tab( '<TAB>' ) as $element ) {
        $payload[ $element['id'] ] = '__T_reverse_' . $element['id'];
    }
    $existing_new = get_option( 'dokan_settings', [] );
    update_option( 'dokan_settings', array_merge( $existing_new, $payload ) );

    // BridgeBootstrap listener should mirror to legacy options.
    do_action( 'update_option_dokan_settings', $existing_new, array_merge( $existing_new, $payload ) );

    foreach ( $this->fragment_for_tab( '<TAB>' ) as $element ) {
        $legacy = get_option( $element['legacy_key']['option'], [] );
        $this->assertSame(
            '__T_reverse_' . $element['id'],
            $legacy[ $element['legacy_key']['field'] ] ?? null,
            "New save for {$element['id']} did not mirror back to {$element['legacy_key']['option']}.{$element['legacy_key']['field']}"
        );
    }
}
```

- [ ] **Step 4: Make the tests pass**

Iterate: add missing fields, fix mismatched legacy_keys, port validators where the parity test for save→DB→read fails. If a field genuinely has a reshape (nested or many-to-one), implement a `TransformerInterface` for it under `includes/Admin/Settings/Migration/Transformer/<TabName><Field>Transformer.php`.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/ tests/php/src/Admin/Settings/Schema/Tab/<TAB>SchemaTest.php
git commit -m "feat(settings): wire <TAB> tab fields with legacy_key + parity tests"
```

---

### Concrete tab assignments (one task each, in landing order)

Order chosen so the lowest-risk / cleanest-trace tabs land first; the high-risk reshape tabs land later when the bridge primitives are well-exercised.

| Task | Tab | Fields | Source sections | Special hazards (from trace) |
| --- | --- | --- | --- | --- |
| Task 3 | AI Assist | 5 | `dokan_ai` | Real API keys in DB; never log raw values. |
| Task 4 | Verification | 5 | `dokan_verification`, `dokan_email_verification` | Cross-tab schema collision (Task 21 trace finding): both pages own `enabled` on `dokan_verification`. Namespace the new ids to disambiguate. |
| Task 5 | Compliance | 11 | `dokan_general`, `dokan_privacy`, `dokan_germanized` | Germanized: `billing_` prefix on keys still emitted by `CustomFields/Billing.php`. Decision required: keep prefix or migrate read sites. |
| Task 6 | General | 22 | `dokan_general`, `dokan_pages`, `dokan_geolocation`, `dokan_live_search_setting`, `dokan_appearance` | (a) Pages MERGE save — only legacy tab not OVERWRITE; (b) Geolocation nested `gmap` requires `LegacyAddress` deep-path; (c) `custom_store_url` triggers rewrite flush. |
| Task 7 | Appearance | 20 | `dokan_appearance`, `dokan_colors`, `dokan_general`, `dokan_menu_manager`, `dokan_verification`, `dokan_selling` | (a) Colors response ≠ DB shim (palette name normalization); (b) Menu Manager cross-leak `dashboard_menu_manager: []` injected into every save — Pro fix at `DataSource.php:45`. |
| Task 8 | Moderation | 18 | `dokan_live_chat`, `dokan_rma`, `dokan_store_support_setting`, `dokan_report_abuse` | (a) Live Chat plaintext credentials in GET; (b) RMA per-row action; (c) Report Abuse module-activation default seeding. |
| Task 9 | Vendors | 46 | 7 source sections | Highest field count. Verification SMS Gateways 73% schema↔read mismatch; Social API plaintext OAuth; Subscription destructive `wp_posts` rewrite; SPMV background visibility job. |
| Task 10 | Product | 28 | `dokan_printful`, `dokan_quote_settings`, `dokan_product_advertisement`, `dokan_wholesale` | Printful 1/11 schema match (rebuild required); Product Advertising 4 default flips; Wholesale silent enum rename. |
| Task 11 | Shipment | 21 | `dokan_delivery_time`, `dokan_shipping_status_setting`, `dokan_general` | Delivery Time 7→1 day-field collapse — first reshape-transformer use case; Shipping Status cross-plugin Lite reads. |
| Task 12 | Transactions | 32 | `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_selling` (commissions) | (a) Withdraw `withdraw_methods` keyed-array shape; (b) Reverse Withdrawal Action Scheduler crons; (c) Selling commission validator clamp; (d) `validate_fixed_price_values` empty-string fallback bug — fix on port, don't reproduce. |

Each row above is one task, expanded from the per-tab template.

---

## Task 13: Lite/Pro field gating

The CSV has `OtherInfoJSON.is_lite` per field. Fields without `is_lite: true` are Pro-only. The new schema must hide Pro fields when Pro is inactive.

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`
- Create: `tests/php/src/Admin/Settings/Schema/LitePoFieldGatingTest.php`

- [ ] **Step 1: Failing test**

```php
public function test_pro_fields_are_filtered_out_when_pro_inactive() {
    add_filter( 'dokan_is_pro_exists', '__return_false' );
    $schema   = ( new SettingsSchema() )->get_schema();
    $pro_only = array_filter( $schema, fn( $e ) => ! ( $e['is_lite'] ?? false ) && ( $e['type'] ?? '' ) === 'field' );
    $this->assertCount( 0, $pro_only );
}

public function test_pro_fields_appear_when_pro_active() {
    add_filter( 'dokan_is_pro_exists', '__return_true' );
    $schema   = ( new SettingsSchema() )->get_schema();
    $pro_only = array_filter( $schema, fn( $e ) => ! ( $e['is_lite'] ?? false ) && ( $e['type'] ?? '' ) === 'field' );
    $this->assertGreaterThan( 100, count( $pro_only ) );
}
```

- [ ] **Step 2: Implement the gate**

In `SettingsSchema::get_schema()` after splicing in the generated fragment, filter out elements with `is_lite: false` when `! dokan_pro_exists()`. Apply via a final pass before returning.

- [ ] **Step 3: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php tests/php/src/Admin/Settings/Schema/LitePoFieldGatingTest.php
git commit -m "feat(settings): gate Pro-only CSV fields on dokan_pro_exists()"
```

---

## Task 14: REST + nonce parity & shape contract

The new UI writes `dokan_settings` via REST (new path) and the legacy AJAX still writes legacy options. Make sure both round-trip through the bridge in both directions.

**Files:**
- Modify: REST controller for `dokan_settings` (locate via grep `grep -rn "register_rest_route.*dokan.*settings" includes/`)
- Create: `tests/php/src/REST/SettingsRoundTripTest.php`

- [ ] **Step 1: Failing E2E test**

```php
public function test_legacy_ajax_save_round_trips_through_rest_get() {
    // Simulate legacy save handler write
    $_POST = [
        'action'       => 'dokan_save_settings',
        'nonce'        => wp_create_nonce( 'dokan_admin' ),
        'section'      => 'dokan_general',
        'settingsData' => [ 'site_logo' => '__T_rest_round_trip' ],
    ];
    do_action( 'wp_ajax_dokan_save_settings' );

    // REST GET on /dokan/v1/settings should now reflect via dokan_settings flat option
    $request  = new \WP_REST_Request( 'GET', '/dokan/v1/settings' );
    $response = rest_do_request( $request );
    $data     = $response->get_data();
    $this->assertSame( '__T_rest_round_trip', $data['general_marketplace_site_logo'] ?? null );
}

public function test_rest_save_round_trips_back_to_legacy_option() {
    $request = new \WP_REST_Request( 'POST', '/dokan/v1/settings' );
    $request->set_body_params( [ 'general_marketplace_site_logo' => '__T_rest_reverse' ] );
    rest_do_request( $request );

    $legacy = get_option( 'dokan_general', [] );
    $this->assertSame( '__T_rest_reverse', $legacy['site_logo'] ?? null );
}
```

- [ ] **Step 2: Make them pass**

Add the reverse listener wiring already done in Task 1 Step 9; verify it fires for REST writes too. If the REST controller bypasses `update_option('dokan_settings', ...)` and writes via a different code path, normalize to `update_option` or duplicate the bridge call there.

- [ ] **Step 3: Commit**

```bash
git add includes/REST/ tests/php/src/REST/SettingsRoundTripTest.php
git commit -m "test(settings): REST↔legacy round-trip parity"
```

---

## Task 15: Flip the feature flag and clean up

- [ ] **Step 1: Flip default**

In `SettingsSchema`, change the default of `dokan_csv_schema_enabled` to `true`. Add an upgrade hook in `dokan-class.php` to set the option on first boot of the new version.

- [ ] **Step 2: Run the full test suite**

```bash
npm run test:phpunit
```
Must be green.

- [ ] **Step 3: Manual smoke test on `core-dokan.test`**

For each of the 10 new tabs:
- Open the new UI tab.
- Edit one field; save.
- Toggle to legacy view; confirm the value appears in the corresponding `dokan_<section>` option.
- Edit a different field via the legacy AJAX page.
- Toggle back to new UI; confirm the legacy edit appears.

Document any failures and fix before commit.

- [ ] **Step 4: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php dokan-class.php
git commit -m "feat(settings): enable CSV-driven schema by default"
```

---

## Task 16: Documentation & developer surface

**Files:**
- Modify: `docs/superpowers/specs/2026-05-16-csv-fields-inventory.md` (mark each tab task as landed)
- Create: `docs/settings/extending.md`

- [ ] **Step 1: Write the developer doc**

Cover: how to add a new field via `dokan_legacy_settings_key_mapping`, how to register a `TransformerInterface`, the `is_lite` gating semantics, the `bridge_only: true` flag, how to debug propagation failures (log keys, common pitfalls).

- [ ] **Step 2: Commit**

```bash
git add docs/settings/extending.md docs/superpowers/specs/2026-05-16-csv-fields-inventory.md
git commit -m "docs(settings-mig): developer extension surface and inventory completion"
```

---

## Stop conditions / escalation

- If a tab task's parity test cannot be made green for a specific field after 2 attempts, STOP and surface the field to the user with: legacy section, new id, what the bridge sees, what the test expects, and what got stored.
- If the CSV's `New Label` / `New Description` are placeholder (`-`), keep the legacy `Label`/`Description` and flag the row for product/UX review — don't invent copy.
- If a field's `OtherInfoJSON` contains a key the inventory doesn't document (i.e. anything besides `is_lite`), STOP and update the inventory before coding.
- If the bridge's reverse-propagation listener triggers infinite recursion (legacy save → new write → reverse-propagate → legacy save), the static reentry guard from Task 1 Step 9 has a bug; fix the guard rather than disabling the listener.

## Done definition

- 208 mapped fields visible in the new UI under the correct top-level tab and subsection.
- All 17 unmapped fields either dropped (per Task 1 inventory) or `bridge_only: true` so their DB values survive.
- `LegacySettingsBridge` supports deep paths, reverse propagation, transformers, and bridge-only fields.
- Every per-tab parity test green: legacy save → new option, new save → legacy option, both directions, every mapped field.
- REST↔legacy round-trip green.
- Lite/Pro gating respected.
- Documentation in `docs/settings/extending.md`.
- All work committed; no `git add -A` was used.
