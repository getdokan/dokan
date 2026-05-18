# `dependency_key` Cleanup — Collapse to `id`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the `dependency_key` / `id` duality in the admin settings schema. After this work, `id` is the sole field identifier across PHP storage, REST payloads, plugin-ui state, and `show_if` rules. `dependency_key` ceases to exist as a separate concept.

**Architecture (revised after Task 0 discovery):** Six phases. Phase 0 (audit) is complete. Phase 1 introduces a tolerance layer so server and client can speak both forms during migration. **Phase 2 — the largest — rewrites 56 production dot-path declarations to flat-key form and renames every field id that would collide post-flatten.** Phase 3 migrates every consumer to read `id` directly. Phase 4 removes `dependency_key` from the schema and the abstract class (compat shim still present). Phase 5 documents the new contract. Phase 6 (deferred) removes the transitional REST compat shim once Pro is on a release with flat-key rules. Work spans two plugins (`dokan-lite` PHP+TS and `plugin-ui` TS) and one external surface (REST PUT payload format). The Pro module schemas are the largest blast radius — coordination required.

**Tech Stack:** PHP 7.4+ (`includes/Abstracts/`, `includes/Admin/Settings/`, `includes/REST/`), TypeScript (`src/admin/dashboard/`, `@wedevs/plugin-ui/src/components/settings/`), PHPUnit 9.6 + Brain Monkey, Jest/Vitest for plugin-ui, PHPCS sniff (custom) for regression prevention.

## Phase 0 discovery findings (committed at `9e40fd2b8`)

Full report: `docs/superpowers/specs/2026-05-18-dependency-key-cleanup-discovery.md`.

The audit invalidates the original "redundant machinery" framing of this plan. Dot-path is the **active convention** in production, not a legacy concept:

| Source | Dot-path keys | Flat keys |
| --- | --- | --- |
| dokan-lite `SettingsSchema.php` | 30 | **0** |
| dokan-lite `Settings.php` (legacy AJAX) | 1 | — |
| dokan-pro 5 new-schema files | 25 | **0** |
| dokan-pro `Shipping/ShippingStatus.php` | 1 | — |
| plugin-ui production source | 0 | — |
| plugin-ui Storybook fixtures only | ~407 | — |

The plugin-ui formatter's `child.dependency_key = [parent.dependency_key, child.id].join('.')` at `settings-formatter.ts:188` is **load-bearing** — it builds the dot-paths those 56 rules match against. Removing dot-path support without rewriting the rules first would silently break every `show_if` in the marketplace settings page.

### Id-collision spot-check (CSV side only)

```
Total distinct CSV FieldKeys: 202
Colliding FieldKeys (would block flat-flatten without rename):
  3×  google_details
  3×  linkedin_details
  4×  enabled
  2×  enable_pricing
```

Hand-authored `SettingsSchema.php`: 1 known collision (`privacy_policy_content` declared twice). Pro modules likely add more — Phase 2 Task 3 audits exhaustively.

### Implication

The dot-path namespacing isn't just decorative — it's the deduplicator. Field ids like `enabled` and `provider` recur across many tabs and only the dot-path makes them unique. **Flattening forces a rename on every recurring field**, not just `dependency_key` removal.

---

## Source spec

Authoritative scoping doc: this file. Background motivation in the conversation around 2026-05-18. The CSV-driven migration plan at `docs/superpowers/plans/2026-05-16-csv-driven-settings-migration.md` is upstream — its globally unique id scheme is the model the rewrite mimics.

## Out of scope

- Renaming the `id` schema attribute to something else. The collapse target is **`id`**.
- Restructuring the schema tree shape. Parent pointers (`page_id`, `subpage_id`, etc.) stay.
- Touching legacy `dokan_get_setting_values` AJAX (it doesn't carry `dependency_key`).
- Reworking `show_if` matcher logic (`key` / `self` / `value` / `comparison` / `attribute`). Only the **key shape** changes.
- Plugin-ui's `hook_key` system. Different concern; stays as-is.
- Renaming CSV-generator-emitted field ids (they're already globally unique by construction).

## In scope (made explicit because of discovery)

- **Field id renames** wherever a flat id would collide. Includes coordinated update of every read site (`dokan_get_option`, `get_option`, REST schema consumers) and a wp_options migration helper that copies old keys to new keys on first upgrade.
- **Dokan Pro coordination.** Phase 2 rewrites Pro schema files; Pro maintainers must merge in lockstep with Lite. Pin a Pro version requirement in `dokan.php`'s plugin header constraints once the rewrites land.

## Conventions used throughout

- **Field identifier:** `id`. Globally unique per schema. Storage key, payload key, `show_if` matcher key, all use `id`.
- **Compat-fallback policy:** the REST PUT controller's last-segment fallback (`AdminSettingsController.php:175-186`) becomes a TRANSITIONAL shim with `_doing_it_wrong` deprecation logging. Removed in Phase 6 once Pro is fully on flat-keys (target: 2 minor releases after Phase 2 ships).
- **Id-rename policy:** when a flat id would collide, pick a domain-prefixed rename (e.g. `subscription_enable_pricing` over `enable_pricing`). Migrate via an upgrade hook that runs once per install, copying `dokan_settings[<old>]` to `dokan_settings[<new>]` and removing the old key.
- **Tests-first cadence:** every behavior change starts with a failing test. Existing test suites (`LegacySettingsBridgeTest`, the 10 `*SchemaTest` files, `SettingsRoundTripTest`, plugin-ui's vitest suite) must stay green through every step.
- **Commit cadence:** one commit per task. Message format: `refactor(settings): <what>` for code; `test(settings): <what>` for tests; `docs(settings): <what>` for docs; `chore(settings): <what>` for tooling.

---

## Phase 0 — Discovery & risk audit ✅ DONE

### Task 0: Audit existing `show_if` rules ✅ — commit `9e40fd2b8`

Findings written to `docs/superpowers/specs/2026-05-18-dependency-key-cleanup-discovery.md`. Conclusion: compat fallback is load-bearing, rule rewrite is the bulk of the work.

---

## Phase 1 — Tolerance (server emits both, client preserves)

Goal: server starts always-emitting `dependency_key === id` for flat-array path while continuing to build dot-path for class-based path. Plugin-ui formatter stops overwriting. Both forms keep working everywhere; this phase makes no externally visible changes.

### Task 1: PHP `SettingsElement::set_dependency_key()` emits `id`

**Files:**
- Modify: `includes/Abstracts/SettingsElement.php`
- Test: `tests/php/src/Abstracts/SettingsElementTest.php` (create or extend)

- [ ] **Step 1: Failing test — child's dependency_key equals its id, not the dot-path**

```php
public function test_dependency_key_equals_id_not_dot_path() {
    $parent = new \WeDevs\Dokan\Admin\Settings\Element\Page( [ 'id' => 'general' ] );
    $child  = new \WeDevs\Dokan\Admin\Settings\Element\Field( [ 'id' => 'commission_type' ] );
    $parent->set_children( [ $child ] );

    $children = $parent->get_children();
    $resolved = $children['commission_type'];

    $this->assertSame( 'commission_type', $resolved->get_dependency_key() );
}
```

- [ ] **Step 2: Change `SettingsElement::get_children()` line 370**

```php
// Before:
$child->set_dependency_key( trim( $this->get_dependency_key() . '.' . $child->get_id(), '. ' ) );

// After:
$child->set_dependency_key( $child->get_id() );
```

- [ ] **Step 3: Change `get_dependencies()` (line 407-415) to use `id`**

```php
public function get_dependencies(): array {
    $self = $this->get_id();
    return array_map(
        function ( $dependency ) use ( $self ) {
            $dependency['self'] = $self;
            return $dependency;
        },
        $this->dependencies
    );
}
```

Same change for `get_validations()` (line 463-472).

- [ ] **Step 4: Run full PHP suite**

```bash
vendor/bin/phpunit -c phpunit.xml --filter "SettingsElement|SettingsSchema|SettingsRegistry|LegacySettingsBridge|GeneratedFragment|SettingsRoundTrip"
```

**Expected:** Some tests FAIL because they assert dot-path values. Document each failure — these tests are about to become invalid (the dot-path form is going away). Update them in Step 5.

- [ ] **Step 5: Update affected tests**

Replace dot-path expectations with flat-id expectations. Tests that exercised the dot-path-as-deduplicator behavior need to be marked `@todo Phase 2` and skipped temporarily — they'll come back in Phase 2 after rules are rewritten.

- [ ] **Step 6: Commit**

```bash
git add includes/Abstracts/SettingsElement.php tests/php/src/Abstracts/
git commit -m "refactor(settings): class-based SettingsElement emits dependency_key === id"
```

---

### Task 2: plugin-ui formatter preserves server-supplied `dependency_key`

**Files:**
- Modify: `/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui/src/components/settings/settings-formatter.ts`
- Modify: corresponding `.test.ts`

- [ ] **Step 1: Failing test — server-supplied dependency_key is preserved**

```ts
it('preserves server-supplied dependency_key without overwriting', () => {
    const input: SettingsElement[] = [
        { id: 'general', type: 'page' },
        { id: 'commission_type', type: 'field', page_id: 'general',
          dependency_key: 'commission_type' },
    ];
    const out = formatSettings(input);
    expect(findField(out, 'commission_type').dependency_key).toBe('commission_type');
});
```

- [ ] **Step 2: Change `settings-formatter.ts:188`**

```ts
// Before:
child.dependency_key = [parent.dependency_key, child.id]
    .filter(Boolean)
    .join('.');

// After: prefer server value; fall back to id when missing.
child.dependency_key = child.dependency_key || child.id;
```

And `settings-formatter.ts:152`:

```ts
// Before:  element.dependency_key = '';
// After:   element.dependency_key = element.dependency_key || element.id;
```

- [ ] **Step 3: Run vitest suite in plugin-ui**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui && npm test
```

Tests that hardcoded dot-path `dependency_key` values will fail — they were testing the formatter's overwrite, not real semantics. Update or mark `@todo Phase 2`.

- [ ] **Step 4: Smoke test against dokan-lite**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui && npm run build
```

Build dokan-lite admin bundle, open the settings page in a browser. **EXPECTED REGRESSION:** show_if rules on the General/Selling tabs may stop firing because the schema declares dot-path rules but the formatter no longer builds dot-paths. **Do not fix the regression here** — that's what Phase 2 is for. Document the visible broken rules and move on.

- [ ] **Step 5: Commit (in plugin-ui repo)**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
git add src/components/settings/settings-formatter.ts src/components/settings/settings-formatter.test.ts
git commit -m "refactor(settings): formatter preserves server-supplied dependency_key; falls back to id"
```

---

## Phase 2 — Rule rewrite & id deduplication (THE LARGEST PHASE)

Goal: rewrite all 56 dot-path declarations to flat-key form. Where flat-key would collide, rename the field id (and migrate stored values). When this phase lands, show_if rules work again — but only with flat-key matching.

### Task 3: Exhaustive id-collision audit

**Files:**
- Create: `docs/superpowers/specs/2026-05-18-id-collision-audit.md`
- Modify: `tools/migration/parse_settings_csv.php` (extend to also report all field ids)

- [ ] **Step 1: Extract every field id from every active schema source**

```bash
# CSV-derived
php -r '$f = require "includes/Admin/Settings/Schema/Generated/csv_fields.php";
        foreach ($f as $e) { if (($e["type"] ?? "") === "field") { echo "csv\t" . ($e["legacy_key"]["field"] ?? "") . "\t" . ($e["id"] ?? "") . "\n"; } }' \
   > /tmp/ids_csv.tsv

# Hand-authored dokan-lite
grep -hoE "'id'\s*=>\s*'[^']+'" includes/Admin/Settings/Schema/SettingsSchema.php \
  | sed -E "s/.*=>\s*'([^']+)'.*/lite\t\1/" > /tmp/ids_lite.tsv

# Hand-authored dokan-pro (5 schema files identified in Task 0)
PRO=/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/dokan-pro
for f in includes/Schema/ProSettingsSchema.php \
         modules/printful/.../PrintfulSettingsSchema.php \
         modules/live-chat/.../LiveChatSettingsSchema.php \
         modules/vendor-verification/.../VendorVerificationSettingsSchema.php \
         modules/subscription/.../SubscriptionSettingsSchema.php; do
    grep -hoE "'id'\s*=>\s*'[^']+'" "$PRO/$f" 2>/dev/null \
      | sed -E "s/.*=>\s*'([^']+)'.*/pro\t\1/" >> /tmp/ids_pro.tsv
done
```

- [ ] **Step 2: Build the collision report**

```bash
cat /tmp/ids_csv.tsv /tmp/ids_lite.tsv /tmp/ids_pro.tsv \
  | awk -F'\t' '{print $NF}' | sort | uniq -c | awk '$1 > 1 {print}' \
  | tee /tmp/collisions.txt
```

For every collision, record:
- The colliding id string
- Each location (source + tab context + dot-path)
- Proposed rename for one or more occurrences (preserve the most-referenced one; rename others with domain prefix)

- [ ] **Step 3: Write the audit document**

`docs/superpowers/specs/2026-05-18-id-collision-audit.md`:

```markdown
# Field id collision audit

**Date:** 2026-05-18
**Source plan:** Phase 2 Task 3

## All collisions

| Id | Occurrences (file:line, dot-path) | Keep | Rename to | Owner |
| --- | --- | --- | --- | --- |
| `enabled` | (4 lite + N pro) | `dokan_general.compliance.enabled` | other 3+ → `<domain>_enabled` | … |
| `enable_pricing` | (subscription + spmv) | subscription | spmv → `spmv_enable_pricing` | dokan-pro |
| `google_details` | (social-api + verification + email-verification) | social-api | others → `<domain>_google_details` | dokan-pro |
| `linkedin_details` | (same) | … | … | … |
| `privacy_policy_content` (lite-only dup) | (2 in SettingsSchema.php) | first | second → `privacy_policy_content_2` (or remove duplicate) | dokan-lite |
| … | … | … | … | … |

## wp_options migration map

For each rename, the upgrade hook copies `dokan_settings[<old>]` → `dokan_settings[<new>]` once per install.

| Old key | New key | Plugin owning the migration |
| --- | --- | --- |
```

- [ ] **Step 4: Get user sign-off on the rename list**

Before writing any migration code, surface the rename decisions to the user. Some renames may need product input (e.g. is the "kept" choice the right one?). STOP and ask.

- [ ] **Step 5: Commit the audit (no code changes yet)**

```bash
git add docs/superpowers/specs/2026-05-18-id-collision-audit.md tools/migration/parse_settings_csv.php
git commit -m "docs(settings): exhaustive field id collision audit + rename proposals"
```

---

### Task 4: Implement id renames + upgrade migration

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php` (hand-authored renames)
- Modify: `includes/Admin/Settings/Schema/Generated/csv_fields.php` (CSV-side renames; regen via generator after editing the slug rule)
- Modify: `tools/migration/generate_schema_fragment.php` (if the slug rule needs an override for collision cases)
- Create: `includes/Admin/Settings/Migration/IdRenameMigration.php` (one-shot wp_options key copier)
- Modify: `dokan-class.php` (register upgrade hook to run the migration on plugin activation/update)
- Modify: all read sites (`dokan_get_option`, `get_option('dokan_settings')` direct callers) — accept either old or new id (read-side compat for 1 release cycle, then deprecate)
- Test: `tests/php/src/Admin/Settings/Migration/IdRenameMigrationTest.php`
- Coordination: `dokan-pro` renames in the same shape (separate PR in Pro repo)

- [ ] **Step 1: Failing test for the migration helper**

```php
public function test_migration_copies_old_key_to_new_key_once() {
    update_option( 'dokan_settings', [ 'enable_pricing' => 'on', 'other' => 'x' ] );

    $migration = new \WeDevs\Dokan\Admin\Settings\Migration\IdRenameMigration( [
        'enable_pricing' => 'subscription_enable_pricing',
    ] );
    $migration->run();

    $settings = get_option( 'dokan_settings' );
    $this->assertSame( 'on', $settings['subscription_enable_pricing'] );
    $this->assertArrayNotHasKey( 'enable_pricing', $settings );
    $this->assertSame( 'x', $settings['other'] ); // unrelated keys preserved
}

public function test_migration_is_idempotent() {
    update_option( 'dokan_settings', [ 'subscription_enable_pricing' => 'off' ] );

    $migration = new \WeDevs\Dokan\Admin\Settings\Migration\IdRenameMigration( [
        'enable_pricing' => 'subscription_enable_pricing',
    ] );
    $migration->run();   // first
    $migration->run();   // second; must not overwrite

    $this->assertSame( 'off', get_option( 'dokan_settings' )['subscription_enable_pricing'] );
}
```

- [ ] **Step 2: Implement `IdRenameMigration`**

```php
namespace WeDevs\Dokan\Admin\Settings\Migration;

class IdRenameMigration {
    /** @var array<string,string> */
    private array $rename_map;

    public function __construct( array $rename_map ) {
        $this->rename_map = $rename_map;
    }

    public function run(): void {
        $settings = get_option( 'dokan_settings', [] );
        if ( ! is_array( $settings ) ) { return; }

        $dirty = false;
        foreach ( $this->rename_map as $old => $new ) {
            if ( array_key_exists( $old, $settings ) && ! array_key_exists( $new, $settings ) ) {
                $settings[ $new ] = $settings[ $old ];
                unset( $settings[ $old ] );
                $dirty = true;
            } elseif ( array_key_exists( $old, $settings ) ) {
                // Both keys present — new wins; old is cruft from a partial migration.
                unset( $settings[ $old ] );
                $dirty = true;
            }
        }
        if ( $dirty ) { update_option( 'dokan_settings', $settings ); }
    }
}
```

- [ ] **Step 3: Apply renames in `SettingsSchema.php`**

For each hand-authored field whose id is in the rename map, change the `'id' => '...'` value to the new name. Keep `legacy_key` unchanged (storage path in `dokan_<section>` rows is independent of new id).

- [ ] **Step 4: Apply renames in the CSV generator**

Modify `generate_schema_fragment.php` to emit the renamed ids for the 4 known CSV-side collisions. Regenerate the fragment. Re-run all per-tab parity tests; they should still pass because the generator's slug-collision suffix logic handles the rename transparently.

- [ ] **Step 5: Update read sites in dokan-lite**

```bash
grep -rn "dokan_get_option\|get_option.*dokan_settings" includes/ | grep -E "(enable_pricing|enabled|google_details|linkedin_details)"
```

For each match, add read-side compat: try new id first, fall back to old id once, log deprecation.

- [ ] **Step 6: Register migration in `dokan-class.php`**

```php
// On admin_init or plugin activation
$migration = new IdRenameMigration( [
    'enable_pricing'   => 'subscription_enable_pricing',
    'enabled'          => null,  // not migratable — too ambiguous
    // ... full list from audit
] );
$migration->run();
```

Use a `dokan_settings_id_rename_migrated_v1` option flag to ensure the migration runs only once.

- [ ] **Step 7: Coordinate dokan-pro**

Open a parallel PR in `dokan-pro` that applies the same renames in Pro schema files. Lite and Pro must merge in lockstep — pin Pro version requirement in Lite's plugin header once merged.

- [ ] **Step 8: Commit (multiple commits — schema renames, migration helper, read-site updates, dokan-class wiring)**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php \
        includes/Admin/Settings/Schema/Generated/csv_fields.php \
        tools/migration/generate_schema_fragment.php \
        includes/Admin/Settings/Migration/IdRenameMigration.php \
        includes/admin/.../*.php \
        dokan-class.php \
        tests/php/src/Admin/Settings/Migration/IdRenameMigrationTest.php
git commit -m "refactor(settings): rename colliding field ids + one-shot wp_options migration"
```

---

### Task 5: Rewrite dokan-lite dot-path rules to flat-key form

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php` (30 rule rewrites)
- Modify: `includes/Admin/Settings.php` (1 legacy show_if at line 699)
- Test: per-tab tests + new explicit show_if behavior tests

- [ ] **Step 1: Failing tests for each affected show_if rule**

Pick 3 representative rules (one per page) and write functional tests asserting the dependent field's visibility:

```php
public function test_admin_percentage_visible_when_commission_type_is_fixed() {
    update_option( 'dokan_settings', [ 'commission_type' => 'fixed' ] );
    $schema = SettingsSchema::get_schema();
    $admin_pct = $this->find_element_by_id( $schema, 'admin_percentage' );
    $this->assertFieldVisible( $admin_pct, $schema, [ 'commission_type' => 'fixed' ] );
}

public function test_admin_percentage_hidden_when_commission_type_is_percentage() { /* … */ }
```

(Helper assertions need to be added to a test trait.)

- [ ] **Step 2: Rewrite each dot-path rule in `SettingsSchema.php`**

For each of the 30 rules, change the key to flat form. Example:

```php
// Before:
'show_if' => [ 'general.commerce.commission_type' => 'fixed' ],

// After:
'show_if' => [ 'commission_type' => 'fixed' ],
```

If `commission_type` was renamed in Task 4, use the new id.

- [ ] **Step 3: Rewrite the 1 legacy show_if in `Settings.php:699`**

- [ ] **Step 4: Run full PHP suite + per-tab tests**

All show_if-related tests should pass. Tests skipped in Task 1 Step 5 can be un-skipped.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php includes/Admin/Settings.php tests/php/src/
git commit -m "refactor(settings): rewrite 31 dot-path show_if rules to flat-key form (dokan-lite)"
```

---

### Task 6: Rewrite dokan-pro dot-path rules to flat-key form

**Files (dokan-pro repo):**
- Modify: `includes/Schema/ProSettingsSchema.php`
- Modify: `modules/printful/.../PrintfulSettingsSchema.php`
- Modify: `modules/live-chat/.../LiveChatSettingsSchema.php`
- Modify: `modules/vendor-verification/.../VendorVerificationSettingsSchema.php`
- Modify: `modules/subscription/.../SubscriptionSettingsSchema.php`
- Modify: `includes/Shipping/ShippingStatus.php` (legacy show_if at line 179)
- Modify: Pro tests covering show_if behavior

- [ ] **Step 1: Coordinate the Pro PR**

This task lives in the `dokan-pro` repo. Open a PR there that mirrors the rewrite shape from Task 5. Lite and Pro must merge in lockstep.

- [ ] **Step 2: Rewrite 25 dot-path rules + 1 legacy show_if**

Same pattern as Task 5.

- [ ] **Step 3: Run Pro test suite**

- [ ] **Step 4: Smoke test the cross-plugin scenarios**

Specifically: the rules that reference Lite-owned fields from Pro (e.g. Pro's `shipping_status_provider` show_if that depends on Lite's `enabled_germanized`). Confirm they still resolve.

- [ ] **Step 5: Commit in dokan-pro**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/dokan-pro
git add includes/ modules/ tests/
git commit -m "refactor(settings): rewrite 26 dot-path show_if rules to flat-key form (dokan-pro)"
```

---

### Task 7: PHPCS sniff to detect dot-path rule declarations

**Files:**
- Create: `phpcs.dokan-flat-show-if.xml` (custom standard config)
- Create: `tools/phpcs-sniffs/DokanFlatShowIf/Sniffs/FlatShowIfSniff.php`
- Modify: `composer.json` (register the sniff in `phpcs` script)
- Create: `tests/php-cs/FlatShowIfSniffTest.php`

- [ ] **Step 1: Sniff that flags `'show_if' => [ '<has-a-dot>' => ... ]` and `->add_dependency('<has-a-dot>'`**

```php
public function register(): array {
    return [ T_CONSTANT_ENCAPSED_STRING ];
}

public function process( File $phpcsFile, $stackPtr ): void {
    $token = $phpcsFile->getTokens()[ $stackPtr ];
    $literal = trim( $token['content'], "'\"" );

    if ( false === strpos( $literal, '.' ) ) { return; }

    // Look back to see if this literal is the key argument of an add_dependency
    // call or appears as a key inside a 'show_if' / 'dependencies' array.
    // (Heuristic; tighten as needed.)
    if ( $this->is_inside_show_if_or_add_dependency( $phpcsFile, $stackPtr ) ) {
        $phpcsFile->addError(
            'Dot-path show_if / dependency keys are forbidden — use the flat field id.',
            $stackPtr,
            'DotPathDependencyKey'
        );
    }
}
```

- [ ] **Step 2: Register sniff in `composer.json` phpcs script**

- [ ] **Step 3: Run `composer phpcs` on the full codebase**

Should be clean now (Tasks 5–6 already rewrote everything). If anything is flagged, that's a missed rule — fix it.

- [ ] **Step 4: Document the sniff in `docs/settings/extending.md`**

- [ ] **Step 5: Commit**

```bash
git add phpcs.dokan-flat-show-if.xml tools/phpcs-sniffs/ composer.json tests/php-cs/
git commit -m "chore(settings): PHPCS sniff to forbid dot-path dependency keys"
```

---

## Phase 3 — Consumer migration (read `id` directly)

### Task 8: plugin-ui consumers read `id` instead of `dependency_key`

**Files (in plugin-ui repo):**
- Modify: `src/components/settings/field-renderer.tsx`
- Modify: `src/components/settings/settings-context.tsx`
- Modify: `src/components/settings/fields.tsx`
- Modify: `src/components/settings/settings-formatter.ts` (flatValues building, dependency `self`, idIndex)

- [ ] **Step 1: Failing tests**

Assert `values` is keyed by `id`; `onChange` is called with `id`; `errors` is keyed by `id`.

- [ ] **Step 2: Mechanical replace**

```diff
- onChange(element.dependency_key!, val)
+ onChange(element.id, val)

- values[element.dependency_key] ?? element.value
+ values[element.id] ?? element.value
```

~30 sites in `fields.tsx`, ~3 in `field-renderer.tsx`, several in `settings-context.tsx`.

- [ ] **Step 3: Vitest suite green**

- [ ] **Step 4: Smoke test in dokan-lite UI**

- [ ] **Step 5: Commit (plugin-ui)**

```bash
git commit -m "refactor(settings): consumers read field id; dependency_key becomes vestigial"
```

---

### Task 9: dokan-lite legacy frontend reads `id`

**Files:**
- Modify: `src/admin/dashboard/utils/settingsDependencyParser.ts`
- Modify: `src/admin/dashboard/utils/settingsDependencyApplicator.ts`
- Modify: `src/admin/dashboard/utils/settingsTypes.ts` (mark `dependency_key` optional + `@deprecated`)
- Modify: `src/admin/dashboard/pages/settings/fields/DokanDoubleInput.tsx`
- Modify: `src/admin/dashboard/pages/settings/fields/DokanSingleProductPreview.tsx`
- Modify: `src/admin/dashboard/pages/settings/fields/DokanVendorInfoPreview.tsx`

- [ ] **Step 1: Replace `element.dependency_key` with `element.id`**

- [ ] **Step 2: Build admin bundle, smoke test setup-guide**

- [ ] **Step 3: Commit**

```bash
git add src/admin/dashboard/
git commit -m "refactor(settings): dokan-lite legacy frontend reads field id instead of dependency_key"
```

---

### Task 10: REST controller — install transitional compat fallback with deprecation

**Files:**
- Modify: `includes/REST/AdminSettingsController.php`
- Test: `tests/php/src/REST/SettingsRoundTripTest.php`

- [ ] **Step 1: Failing test — dot-path PUT payload still resolves but emits deprecation**

```php
public function test_rest_put_with_dot_path_payload_warns_but_still_writes() {
    $this->setExpectedDeprecated( 'AdminSettingsController dot-path payload' );

    $request = new \WP_REST_Request( 'PUT', '/dokan/v1/admin/settings/general' );
    $request->set_body_params( [
        'general.marketplace.setup_wizard_logo_url' => 'value_via_dotpath',
    ] );
    rest_do_request( $request );

    $this->assertSame( 'value_via_dotpath', get_option( 'dokan_settings' )['setup_wizard_logo_url'] ?? null );
}
```

- [ ] **Step 2: Add `_doing_it_wrong` to the fallback at line 179-186**

```php
if ( ! $field && false !== strpos( $key, '.' ) ) {
    $parts = explode( '.', $key );
    $last  = end( $parts );
    $field = $by_id[ $last ] ?? null;
    if ( $field ) {
        _doing_it_wrong(
            __METHOD__,
            sprintf(
                'PUT payload key "%s" uses deprecated dot-path form; use field id "%s" instead.',
                esc_html( $key ),
                esc_html( $last )
            ),
            'DOKAN_NEXT_MAJOR'
        );
        $key = $last;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add includes/REST/AdminSettingsController.php tests/php/src/REST/SettingsRoundTripTest.php
git commit -m "refactor(settings): REST PUT dot-path fallback now logs deprecation"
```

---

## Phase 4 — Removal

### Task 11: Drop `dependency_key` from schema; deprecate getter/setter

**Files:**
- Modify: `includes/Abstracts/SettingsElement.php` (drop `to_array()` line; deprecate get/set)
- Modify (plugin-ui): `src/components/settings/settings-formatter.ts` (drop `child.dependency_key = …` fallback line from Task 2)
- Modify (plugin-ui): `src/components/settings/settings-types.ts` (drop the field)
- Modify: `src/admin/dashboard/utils/settingsTypes.ts` (drop the field)

- [ ] **Step 1: Failing test — `to_array()` omits dependency_key**

- [ ] **Step 2: Drop the field; deprecate the methods**

```php
/** @deprecated DOKAN_NEXT_MAJOR Use get_id() instead. Returns id verbatim. */
public function get_dependency_key(): string { return $this->get_id(); }

/** @deprecated DOKAN_NEXT_MAJOR No-op. dependency_key is now always equal to id. */
public function set_dependency_key( string $_unused ): SettingsElement { return $this; }
```

- [ ] **Step 3: TS — drop the field from types**

Compiler errors point at any remaining consumers; fix by using `id`.

- [ ] **Step 4: Drop formatter fallback line**

`settings-formatter.ts:188` (the line we changed in Task 2) is now redundant. Delete it.

- [ ] **Step 5: Suites green (both repos)**

- [ ] **Step 6: Commit (one per repo)**

```bash
# dokan-lite
git commit -m "refactor(settings): drop dependency_key from schema; getter/setter deprecated no-ops"
# plugin-ui
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
git commit -m "refactor(settings): drop dependency_key from schema types and formatter"
```

---

## Phase 5 — Documentation

### Task 12: Update extending guides and Storybook stories

**Files:**
- Modify: `docs/settings/extending.md`
- Modify (plugin-ui): `CLAUDE.md`, `DEVELOPER_GUIDE.md`, `src/DeveloperGuide.mdx`, `src/components/settings/Settings.mdx`, `src/components/settings/Settings.stories.tsx`

- [ ] **Step 1: Replace `dependency_key` mentions with `id`**

Add a "Migration notice" callout pointing at the deprecated getter for back-compat consumers.

- [ ] **Step 2: Update Storybook story fixtures**

Drop the ~407 dot-path `dependency_key` literals in `Settings.stories.tsx`. Replace with flat-form examples.

- [ ] **Step 3: Commit (two repos)**

```bash
git commit -m "docs(settings): extending guide and stories reflect dependency_key removal"
```

---

## Phase 6 — Compat removal (DEFERRED, target: 2 minor releases after Phase 2)

### Task 13: Remove the REST dot-path fallback

Once Pro has shipped a release that uses flat-key rules AND adoption metrics show no `_doing_it_wrong` log entries for the dot-path fallback for 2 release cycles, remove the fallback.

**Files:**
- Modify: `includes/REST/AdminSettingsController.php` (delete lines 179-186 + the `_doing_it_wrong` block)
- Modify: `tests/php/src/REST/SettingsRoundTripTest.php` (remove the dot-path PUT test)

- [ ] **Step 1: Delete the fallback**
- [ ] **Step 2: Delete the corresponding test**
- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(settings): remove transitional dot-path PUT fallback"
```

---

## Stop conditions / escalation

- **If Task 3 surfaces id collisions in a Pro module that's still actively shipping dot-path rules:** STOP. The rename requires Pro coordination beyond this plan's scope. Surface to user with the colliding id list and propose either (a) delay Phase 2 until Pro joins, or (b) ship Lite with the renames + read-side compat for old keys, accepting that Pro will see broken rules until it catches up.
- **If Phase 2 Task 4's migration would touch a wp_option row that has user-modified data we can't safely copy:** STOP. The migration is one-shot; getting it wrong leaves stale data. Surface specific concerns.
- **If Phase 2 Task 5/6's rewrites cause a parity test failure that isn't a dot-path issue:** the rule rewrite uncovered a pre-existing bug. Surface the test failure as a separate fix-this-first task; don't bury it in the rewrite.
- **If a smoke test in Phase 1 Task 2 shows show_if rules NOT broken after the formatter change:** the rule isn't actually using dot-paths (the dependency-resolver may have been doing tolerant matching). Re-audit and confirm before continuing.

## Done definition

- `vendor/bin/phpunit -c phpunit.xml` green.
- `cd plugin-ui && npm test` green.
- `composer phpcs` green (with the new DotPathDependencyKey sniff active).
- `grep -r 'dependency_key' includes/ src/` returns only:
  - Deprecated getter/setter in `SettingsElement.php` (intentional).
  - Comments documenting the removal.
- `grep -r 'dependency_key' /path/to/plugin-ui/src` — no live consumer code.
- All 56 dot-path rules rewritten to flat-key form (verified by Phase 0 audit script re-run returning 0).
- Id renames migrated via `IdRenameMigration` upgrade hook.
- Phase 6 deferred; tracked in `docs/superpowers/specs/2026-05-18-cleanup-deferred.md`.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Pro doesn't merge in lockstep | HIGH | Pro show_if rules break on installs running new Lite + old Pro | Pin Pro version requirement in Lite plugin header; release notes |
| Id-rename migration corrupts stored settings on a non-trivial install | MEDIUM | Lost vendor preferences | Idempotent migration + back up `dokan_settings` to a sibling option before mutating |
| New PHPCS sniff has false positives on legitimate dotted strings | LOW | Build red noise | Sniff includes context heuristic (only inside show_if / add_dependency); easy to tighten |
| Phase 5's Storybook fixture rewrite breaks visual regression tests | LOW | Story screenshots differ | Re-baseline screenshots in same commit; review diff manually |
| Third-party plugin reads `element.dependency_key` from REST response after Phase 4 | LOW | Extension UI breaks | Deprecated getter still returns `id` server-side; on the client, addons should read `element.id` |
| Stored show_if-related localStorage caches use old dot-path keys | LOW | One-time empty state on first load | Bust cache in upgrade hook |

## Estimated effort (revised)

| Phase | Tasks | Hours | Status |
| --- | --- | --- | --- |
| 0. Discovery | 1 (T0) | 0.5 | ✅ DONE |
| 1. Tolerance | 2 (T1–T2) | 2 | pending |
| 2. Rule rewrite | 5 (T3–T7) | **8** (Pro coordination + audit + renames + sniff) | pending |
| 3. Consumer migration | 3 (T8–T10) | 3 | pending |
| 4. Removal | 1 (T11) | 1 | pending |
| 5. Documentation | 1 (T12) | 1 | pending |
| 6. Compat removal | 1 (T13) | 0.5 | DEFERRED |
| **Total** | 14 | **~16h** | — |

Plus calendar time for Pro coordination — likely 1–2 weeks for Pro PR review and a Lite-Pro coordinated release window.
