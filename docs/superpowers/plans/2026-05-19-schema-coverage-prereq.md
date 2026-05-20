# Schema Coverage Prereq Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the schema coverage gap — every `dokan_get_option()` call in `includes/` has a corresponding new-flat schema element with a `legacy_key` declaration, and a PHPUnit coverage gate prevents regressions.

**Architecture:** Add a PHPUnit coverage test (TDD-style red first); attach `legacy_key` to 3 existing schema elements (mechanical); design and add 18 new schema elements via an explicit triage step that the user reviews; verify all-green.

**Tech Stack:** PHP 7.4+, WordPress, PHPUnit 9.6. All work lives under `includes/Admin/Settings/Schema/` and `tests/php/src/Admin/Settings/Schema/`.

---

## File Structure

**New files:**

- `tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php` — single PHPUnit test that scans `includes/**/*.php` for literal `dokan_get_option(<key>, <section>)` calls and asserts every pair is covered by `LegacySettingsBridge::get_mapping()`.
- `docs/superpowers/specs/2026-05-19-schema-coverage-triage.md` — triage deliverable: per-key design decisions (new-flat id, parent section, variant, default, transformer notes) for the 18 keys that need full design. User-reviewable.

**Modified files:**

- `includes/Admin/Settings/Schema/SettingsSchema.php` — add `legacy_key` to 3 existing field elements; add ~18 new field elements (and possibly one new `section` element if existing sections don't naturally host them).

**Not touched:**

- `includes/Admin/Settings/Schema/Generated/csv_fields.php` — auto-generated, off by default. Out of scope.
- `includes/Admin/Settings/Migration/LegacySettingsBridge.php` — already supports the `legacy_key` shape.
- `includes/Admin/Settings/Repository/*.php` — no behavioral change.
- Any `dokan_get_option()` call site — call sites do not change in this PR.

---

## Conventions

- Namespace for the test: `WeDevs\Dokan\Test\Admin\Settings\Schema`.
- Test class extends `WeDevs\Dokan\Test\DokanTestCase` and uses `@group admin-settings`.
- `@since DOKAN_SINCE` on every new schema element field that's a brand-new addition (existing elements being augmented with `legacy_key` don't need a fresh `@since`).
- Each commit message follows the repo convention (`feat(settings):`, `test(settings):`, `docs(settings):`, etc.).
- Run a single PHPUnit class: `npm run phpunit -- --filter=LegacyReadCoverageTest`.
- Run the admin-settings group: `npm run phpunit -- --group=admin-settings`.

---

## Task 1 — Coverage test (TDD red)

**Files:**
- Create: `tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php`:

```php
<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Coverage gate: every static `dokan_get_option('<key>', '<section>')` call
 * site in includes/ must have a corresponding `legacy_key` declaration in
 * the schema (so the bridge's mapping table covers it).
 *
 * Dynamic-arg call sites (e.g. `dokan_get_option( $page, 'dokan_pages' )`)
 * cannot be statically resolved and are intentionally skipped.
 *
 * @group admin-settings
 */
class LegacyReadCoverageTest extends DokanTestCase {

    public function test_every_internal_dokan_get_option_call_has_a_legacy_key_mapping(): void {
        $pairs    = $this->extract_static_legacy_reads();
        $mapping  = ( new LegacySettingsBridge() )->get_mapping();
        $mapped   = [];
        foreach ( $mapping as $entry ) {
            if ( is_array( $entry ) && isset( $entry['option'], $entry['field'] ) ) {
                $mapped[ "{$entry['option']}.{$entry['field']}" ] = true;
            }
        }

        $unmapped = [];
        foreach ( $pairs as $pair => $files ) {
            if ( ! isset( $mapped[ $pair ] ) ) {
                $unmapped[ $pair ] = $files;
            }
        }

        $this->assertSame(
            [],
            $unmapped,
            "Unmapped legacy reads (no legacy_key in schema):\n" .
            implode(
                "\n",
                array_map(
                    static fn( $pair, $files ) => "  - {$pair}  (" . implode( ', ', $files ) . ')',
                    array_keys( $unmapped ),
                    array_values( $unmapped )
                )
            )
        );
    }

    /**
     * Scan includes/**\/*.php for literal `dokan_get_option('<key>', '<section>')` calls.
     *
     * @return array<string, array<int,string>>  Map of "<section>.<key>" => list of relative file paths.
     */
    private function extract_static_legacy_reads(): array {
        $root  = realpath( __DIR__ . '/../../../../../../includes' );
        $this->assertIsString( $root, 'includes/ directory not found from test path.' );

        $rii    = new \RecursiveIteratorIterator( new \RecursiveDirectoryIterator( $root ) );
        $pairs  = [];
        foreach ( $rii as $file ) {
            if ( ! $file->isFile() || 'php' !== strtolower( $file->getExtension() ) ) {
                continue;
            }
            $code = file_get_contents( $file->getPathname() );
            if ( false === $code || false === strpos( $code, 'dokan_get_option' ) ) {
                continue;
            }
            if ( preg_match_all(
                "/dokan_get_option\\(\\s*'([a-z0-9_]+)'\\s*,\\s*'(dokan_[a-z0-9_]+)'/i",
                $code,
                $m,
                PREG_SET_ORDER
            ) ) {
                $rel = ltrim( str_replace( $root, '', $file->getPathname() ), '/' );
                foreach ( $m as $hit ) {
                    $pair             = "{$hit[2]}.{$hit[1]}";
                    $pairs[ $pair ][] = $rel;
                }
            }
        }

        // De-duplicate file lists.
        foreach ( $pairs as $pair => $files ) {
            $pairs[ $pair ] = array_values( array_unique( $files ) );
        }
        ksort( $pairs );
        return $pairs;
    }
}
```

- [ ] **Step 2: Run the test to verify it fails with 21 unmapped pairs**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`

Expected: FAIL. The failure message must list 21 unmapped pairs, including (verify presence; order may differ):
- `dokan_ai.dokan_ai_image_gen_availability`
- `dokan_appearance.captcha_enable_status`
- `dokan_appearance.captcha_provider`
- `dokan_appearance.default_store_banner`
- `dokan_appearance.default_store_profile`
- `dokan_appearance.product_sections`
- `dokan_appearance.recaptcha_enable_status`
- `dokan_appearance.recaptcha_secret_key`
- `dokan_appearance.recaptcha_site_key`
- `dokan_appearance.store_list_sort_by`
- `dokan_appearance.store_products`
- `dokan_appearance.vendor_layout_style`
- `dokan_general.contact_seller`
- `dokan_general.store_banner_flex_height`
- `dokan_general.store_banner_flex_width`
- `dokan_general.store_map`
- `dokan_general.store_open_close`
- `dokan_reverse_withdrawal.reverse_withdrawal_enabled`
- `dokan_selling.additional_fee`
- `dokan_selling.admin_percentage`

If the count is different, **stop and report** — either the codebase has changed since the spec was written, or the regex is mis-extracting. Adjust the regex or escalate before continuing.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php
git commit -m "test(settings): coverage gate for unmapped dokan_get_option reads (red)"
```

Committing the test in its red state is deliberate — subsequent commits will be observably driven by it.

---

## Task 2 — Attach `legacy_key` to 3 existing schema elements

The following elements already exist in `SettingsSchema.php` but lack `legacy_key`. Attaching the declaration is mechanical.

| Schema element id | Legacy address to declare |
|---|---|
| `recaptcha_site_key` | `dokan_appearance.recaptcha_site_key` |
| `recaptcha_secret_key` | `dokan_appearance.recaptcha_secret_key` |
| `reverse_withdrawal_enabled` | `dokan_reverse_withdrawal.reverse_withdrawal_enabled` |

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`

- [ ] **Step 1: Locate each existing element**

Run:
```bash
grep -n "'id'\s*=>\s*'recaptcha_site_key'\|'id'\s*=>\s*'recaptcha_secret_key'\|'id'\s*=>\s*'reverse_withdrawal_enabled'" includes/Admin/Settings/Schema/SettingsSchema.php
```

Expected: three line numbers, one per id.

- [ ] **Step 2: Add `legacy_key` to each element**

For each of the three elements, add the `legacy_key` entry alongside the existing `default`, `validations`, etc. Use the array form (matches the style of the existing declarations elsewhere in `SettingsSchema.php`):

For `recaptcha_site_key` and `recaptcha_secret_key` — add INSIDE the element's array (typically right after `default` or `tooltip`):

```php
'legacy_key' => [
    'option' => 'dokan_appearance',
    'field'  => 'recaptcha_site_key',
],
```

(swap `'recaptcha_site_key'` → `'recaptcha_secret_key'` for the second element)

For `reverse_withdrawal_enabled` — add INSIDE that element's array:

```php
'legacy_key' => [
    'option' => 'dokan_reverse_withdrawal',
    'field'  => 'reverse_withdrawal_enabled',
],
```

- [ ] **Step 3: Run the coverage test — should now report 18 unmapped pairs**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`

Expected: FAIL, but with 18 pairs (not 21). The three attached above must NOT appear in the failure list.

- [ ] **Step 4: Run admin-settings group to confirm no regressions**

Run: `npm run phpunit -- --group=admin-settings`

Expected: existing tests pass (other than `LegacyReadCoverageTest` which still reports 18 unmapped). If any other test fails, the `legacy_key` attachment broke a parity assumption — investigate before continuing.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php
git commit -m "feat(settings): attach legacy_key to 3 existing schema elements (recaptcha + reverse withdrawal)"
```

---

## Task 3 — Triage the 18 remaining keys (deliverable + checkpoint)

The remaining 18 keys have no existing schema element. Each needs:
1. **New-flat id** — short, descriptive, must not collide with existing schema ids.
2. **Parent section** — which `section_id` / `subpage_id` the field attaches to (required: `field` elements must have a parent pointer).
3. **Variant** — `text`, `switch`, `select`, `number`, `croppable_image`, etc. (see `SchemaValidator::DEFAULT_KNOWN_VARIANTS`).
4. **Default** — must match the legacy default the call sites pass to `dokan_get_option()`.
5. **Transformer** (rare) — only if the new-side value shape differs from legacy (e.g., boolean vs. `'on'/'off'`).

**Files:**
- Create: `docs/superpowers/specs/2026-05-19-schema-coverage-triage.md`

- [ ] **Step 1: For each of the 18 keys, gather the inputs**

For each pair below, run:

```bash
# Find the legacy default(s) the call sites pass — the third arg to dokan_get_option:
grep -n "dokan_get_option(\s*'<KEY>'\s*,\s*'<SECTION>'" includes -r --include="*.php"

# Check Installer.php / SetupWizard.php / Upgrade/*.php for explicit on-disk defaults:
grep -n "'<KEY>'" includes/Install includes/Admin/SetupWizard.php includes/Upgrade -r --include="*.php"

# Verify no schema element with the chosen new-flat id already exists:
grep -n "'id'\s*=>\s*'<PROPOSED_NEW_ID>'" includes/Admin/Settings/Schema/SettingsSchema.php
```

The 18 keys to triage:

```
dokan_ai.dokan_ai_image_gen_availability
dokan_appearance.captcha_enable_status
dokan_appearance.captcha_provider
dokan_appearance.default_store_banner
dokan_appearance.default_store_profile
dokan_appearance.product_sections
dokan_appearance.recaptcha_enable_status
dokan_appearance.store_list_sort_by
dokan_appearance.store_products
dokan_appearance.vendor_layout_style
dokan_general.contact_seller
dokan_general.store_banner_flex_height
dokan_general.store_banner_flex_width
dokan_general.store_map
dokan_general.store_open_close
dokan_selling.additional_fee
dokan_selling.admin_percentage
```

(Note: `dokan_reverse_withdrawal.reverse_withdrawal_enabled` was handled in Task 2; the count above is 17 listed pairs — actual is 18 total minus 1 already-handled = 17 here. If the count is off, re-verify with: `npm run phpunit -- --filter=LegacyReadCoverageTest` and read the latest unmapped list.)

- [ ] **Step 2: Write the triage document**

Create `docs/superpowers/specs/2026-05-19-schema-coverage-triage.md` with this structure:

```markdown
# Schema Coverage Triage — 18 new schema elements

Per-key decisions feeding Tasks 4–6 of `2026-05-19-schema-coverage-prereq.md`.

## Conventions

- Format: one heading per legacy pair, followed by a structured decision table.
- Parent section refers to an existing `section_id` in `SettingsSchema.php` unless explicitly noted as "needs new section".
- "Variant" is the rendered input control; see SchemaValidator::DEFAULT_KNOWN_VARIANTS for the allow-list.
- "Default" must exactly match the legacy default the call sites pass to `dokan_get_option()`. If multiple call sites pass different defaults, document them all and explain the chosen one.

## dokan_ai.dokan_ai_image_gen_availability

| Field | Decision |
|---|---|
| New-flat id | `dokan_ai_image_gen_availability` |
| Parent section_id | `<existing section>` |
| Variant | `<variant>` |
| Default | `<default>` |
| Transformer | `<none / spec>` |
| Notes | <free text> |

[…repeat for all 17 remaining pairs…]
```

For each entry, fill in real values — no placeholders.

**Guidance for the triage author:**
- For appearance / general / selling keys that have well-defined neighbors in `SettingsSchema.php`, choose the same parent section.
- For `dokan_ai_image_gen_availability`, the only call sites are in REST controllers; no existing AI section in the lite schema — proposed section: see what `dokan_ai` other fields look like; if none, the field needs a "Settings / AI" section. **Escalate** to user if a new section is needed.
- For `captcha_*` / `recaptcha_enable_status`, peers exist in the schema (`recaptcha_site_key`, `recaptcha_secret_key`, the `recaptcha` toggle). Use the same parent.
- For `additional_fee` and `admin_percentage`, peers exist in the commission section. Reuse them.

- [ ] **Step 3: Self-review the triage document**

Before committing, re-read your triage:
- Every chosen new-flat id is unique (grep `SettingsSchema.php` for collisions).
- Every parent section_id you reference exists in `SettingsSchema.php` (grep to verify).
- Every variant is in `SchemaValidator::DEFAULT_KNOWN_VARIANTS`.
- Every default matches what the call sites pass.

- [ ] **Step 4: Commit the triage**

```bash
git add docs/superpowers/specs/2026-05-19-schema-coverage-triage.md
git commit -m "docs(settings): triage decisions for 18 new schema elements"
```

- [ ] **Step 5: CHECKPOINT — pause for user review**

This is a hard pause. The triage document drives all subsequent tasks. Do NOT proceed to Task 4 until the user has reviewed and approved the triage doc.

Report back with:
- Number of entries (must be 17 or 18).
- Any keys you escalated (needs new section, ambiguous default, etc.).
- Any keys you couldn't decide on alone.

---

## Task 4 — Add declarations for the `dokan_appearance.*` group

Per the approved triage, add ~10 new field elements covering all `dokan_appearance.*` unmapped pairs (every entry whose pair starts with `dokan_appearance.`).

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`

- [ ] **Step 1: For each appearance entry in the triage, add the field element to `SettingsSchema.php`**

Each element follows this shape:

```php
[
    'id'         => '<new_flat_id>',
    'type'       => 'field',
    'variant'    => '<variant>',
    'section_id' => '<parent_section_id_from_triage>',
    'title'      => esc_html__( '<short title>', 'dokan-lite' ),
    'default'    => <default>,
    'legacy_key' => [
        'option' => 'dokan_appearance',
        'field'  => '<original_legacy_key>',
    ],
],
```

Add each element in the same array block as its peers (e.g., elements with the same `section_id`) to keep the schema file readable.

If the triage prescribes a transformer, add the `dokan_legacy_settings_key_mapping` filter wiring per the bridge's documented pattern (see `LegacySettingsBridge.php:402` for the filter, and the `transform_legacy_payload_to_new` flow). Transformer plumbing is rare and the triage should have flagged it.

- [ ] **Step 2: Run the coverage test — should now report appearance pairs as resolved**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`

Expected: FAIL, but the failure message no longer lists any `dokan_appearance.*` pairs.

- [ ] **Step 3: Run the schema validator + admin-settings group**

Run: `npm run phpunit -- --group=admin-settings`

Expected: PASS on everything except `LegacyReadCoverageTest` (still reports the remaining `dokan_general.*`, `dokan_selling.*`, `dokan_ai.*` pairs).

`SchemaValidatorTest`, `SettingsSchemaTest`, `LegacySettingsBridgeTest`, and all per-tab schema tests must remain green. If any fail, the new declarations violated a schema invariant — re-check parent pointers, variant names, id uniqueness.

- [ ] **Step 4: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php
git commit -m "feat(settings): declare schema elements for dokan_appearance.* unmapped reads"
```

---

## Task 5 — Add declarations for the `dokan_general.*` group

5 entries: `contact_seller`, `store_banner_flex_height`, `store_banner_flex_width`, `store_map`, `store_open_close`.

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`

- [ ] **Step 1: For each general entry in the triage, add the field element**

Same shape as Task 4, with `'legacy_key' => [ 'option' => 'dokan_general', 'field' => '<original>' ]`.

- [ ] **Step 2: Run the coverage test — should now report only `dokan_selling.*` + `dokan_ai.*`**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`

Expected: FAIL with 3 remaining unmapped pairs: `dokan_selling.additional_fee`, `dokan_selling.admin_percentage`, `dokan_ai.dokan_ai_image_gen_availability`.

- [ ] **Step 3: Run admin-settings group**

Run: `npm run phpunit -- --group=admin-settings`

Expected: PASS (except `LegacyReadCoverageTest`).

- [ ] **Step 4: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php
git commit -m "feat(settings): declare schema elements for dokan_general.* unmapped reads"
```

---

## Task 6 — Add declarations for `dokan_selling.*` + `dokan_ai.*`

3 entries: `additional_fee`, `admin_percentage`, `dokan_ai_image_gen_availability`.

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`

- [ ] **Step 1: Add the field elements per the triage**

For `additional_fee` and `admin_percentage`: `'legacy_key' => [ 'option' => 'dokan_selling', 'field' => '<original>' ]`.

For `dokan_ai_image_gen_availability`: `'legacy_key' => [ 'option' => 'dokan_ai', 'field' => 'dokan_ai_image_gen_availability' ]`. If the triage flagged that a new section is needed for AI, add it now per the design noted in the triage doc.

- [ ] **Step 2: Run the coverage test — must now pass**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`

Expected: PASS — zero unmapped pairs.

If the test still fails, the failure message lists exactly which pair is still missing. Cross-check against the triage; one entry was skipped or has a typo'd `legacy_key` field name.

- [ ] **Step 3: Run admin-settings group**

Run: `npm run phpunit -- --group=admin-settings`

Expected: PASS — all green.

- [ ] **Step 4: Run PHPCS on the schema file**

Run: `composer phpcs -- includes/Admin/Settings/Schema/SettingsSchema.php`

Expected: 0 errors, 0 warnings.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php
git commit -m "feat(settings): declare schema elements for dokan_selling.* + dokan_ai.* unmapped reads"
```

---

## Task 7 — Final verification

**Files:** none (verification only)

- [ ] **Step 1: Coverage test green**

Run: `npm run phpunit -- --filter=LegacyReadCoverageTest`
Expected: PASS — 1 test, 1 assertion.

- [ ] **Step 2: Full admin-settings group green**

Run: `npm run phpunit -- --group=admin-settings`
Expected: PASS — all tests, no failures.

- [ ] **Step 3: Schema file PHPCS clean**

Run: `composer phpcs -- includes/Admin/Settings/Schema/SettingsSchema.php`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Confirm no behavioral change for `dokan_get_option()` callers**

Run the existing parity test:
```
npm run phpunit -- --filter=DokanGetOptionReflectsNewSettingsTest
```
Expected: PASS. This test exercises the read-time overlay; adding `legacy_key` declarations should not change its assertions.

- [ ] **Step 5: Report and stop**

No commit — verification only.

Report back with:
- Coverage test result.
- Admin-settings group result (total tests, assertions, time).
- PHPCS result.
- DokanGetOptionReflectsNewSettings result.

---

## Self-Review Notes

**Spec coverage:**

| Spec section | Plan task(s) |
|---|---|
| Discovery script / coverage check | Task 1 |
| Per-key triage | Task 3 |
| 21 unmapped reads → declared | Tasks 2, 4, 5, 6 |
| PHPUnit coverage gate | Task 1 (test created) + Task 6 (passes) |
| Dynamic call sites accepted as out-of-scope | Documented in Task 1's test docblock |
| New-flat id naming policy | Documented in Task 3's guidance |
| Behavioral default parity | Task 3 step 1 + Task 4–6 enforce in declarations |

**Spec adjustments discovered during plan-write:**

1. The spec said "per-tab files under `includes/Admin/Settings/Schema/Tab/`" — those don't exist. The hand-authored schema is one file (`SettingsSchema.php`). The auto-generated `Generated/csv_fields.php` is opt-in (gated by `dokan_csv_schema_enabled`, default off) and out of scope. Plan reflects this.
2. The spec said all 21 keys need new schema elements. Plan-time discovery: 3 of 21 already have schema elements (`recaptcha_site_key`, `recaptcha_secret_key`, `reverse_withdrawal_enabled`); only 18 need new declarations. Task 2 attaches `legacy_key` to the existing 3; Tasks 4–6 handle the 18 via triage.
3. Triage promoted to a deliverable with user-review checkpoint (Task 3). The spec described it as a step; the plan makes it a discrete artifact (`2026-05-19-schema-coverage-triage.md`) the user can review before any schema writes.

**Type consistency:** No types/methods invented across tasks. The test uses only existing public API (`LegacySettingsBridge::get_mapping()` is verified at `LegacySettingsBridgeTest.php:44`). The schema element shape matches existing declarations in `SettingsSchema.php` (verified by inspection of `recaptcha_site_key` and `custom_store_url` neighbors).

**No placeholders.**
