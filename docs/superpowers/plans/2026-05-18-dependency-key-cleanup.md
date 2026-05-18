# `dependency_key` Cleanup — Collapse to `id`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the `dependency_key` / `id` duality in the admin settings schema. After this work, `id` is the sole field identifier across PHP storage, REST payloads, plugin-ui state, and `show_if` rules. `dependency_key` ceases to exist as a separate concept.

**Architecture:** Three-phase rollout. Phase 1 makes the contract tolerant of both forms (id and dot-path); Phase 2 migrates every consumer to `id`; Phase 3 removes `dependency_key` from the schema and the abstract class. The work spans two plugins (`dokan-lite` PHP+TS and `plugin-ui` TS) and one external surface (REST PUT payload format). The CSV-driven flat schema (already shipped) is the forcing function — its globally unique ids prove the invariant `dependency_key === id` already holds; we're just deleting the redundant machinery.

**Tech Stack:** PHP 7.4+ (`includes/Abstracts/`, `includes/Admin/Settings/`, `includes/REST/`), TypeScript (`src/admin/dashboard/`, `@wedevs/plugin-ui/src/components/settings/`), PHPUnit 9.6 + Brain Monkey, Jest/Vitest for plugin-ui.

---

## Source spec

Authoritative scoping doc: this file. Background motivation in the conversation that triggered the cleanup (see `git log --oneline` around 2026-05-18). The CSV-driven migration plan at `docs/superpowers/plans/2026-05-16-csv-driven-settings-migration.md` is upstream — it locked in the assumption that ids are globally unique, which is what makes this cleanup safe.

## Why this exists

Today, the same field carries three different `dependency_key` values depending on which code path it flowed through:

| Source | Generation rule | Example value |
| --- | --- | --- |
| `SettingsElement::set_dependency_key()` (class-based, server) | dot-path built by tree traversal | `general.marketplace.site_logo` |
| `SettingsRegistry::generate_keys()` (flat-array, server) | equals `id` (removed 2026-05-18) | `vendors_vendor_onboarding_setup_wizard_logo_url` |
| `settings-formatter.ts:188` (plugin-ui client) | dot-path rebuilt by tree traversal — **overwrites server value** | `general.marketplace.site_logo` |

Downstream consumers (REST controller, plugin-ui `fields.tsx`, dokan-lite legacy parser) have to either match exact strings or apply hacky last-segment fallbacks (`AdminSettingsController.php:175-186`). An addon that explicitly sets `dependency_key` on a field has it silently clobbered by the formatter.

The CSV-driven schema enforces globally unique field ids by construction (every per-tab test asserts `array_unique($ids) === $ids`). Storage is already keyed by `id` (`dokan_settings[$id] = $value`). `dependency_key` adds zero information that `id` doesn't already encode.

## Out of scope

- Renaming `id` to anything else. The collapse target is **id**.
- Restructuring the schema tree shape. Parent pointers (`page_id`, `subpage_id`, etc.) stay.
- Touching legacy `dokan_get_setting_values` AJAX (it doesn't carry `dependency_key`).
- Reworking `show_if` semantics (the matcher logic stays; only the key shape changes).
- Plugin-ui's `hook_key` system. Different concern; stays as-is.

## Conventions used throughout

- **Field identifier:** `id`. Globally unique per schema. Storage key, payload key, `show_if` matcher key, all use `id`.
- **Migration policy for stored `show_if` rules:** read-side compat — when matching a rule key, try `id` first, then last-dot-segment as fallback. Old rules keep working; new rules use `id` directly. Compat fallback gets a `_doing_it_wrong`-style deprecation log entry.
- **Tests-first cadence:** every behavior change starts with a failing test. Existing test suites (`LegacySettingsBridgeTest`, the 10 `*SchemaTest` files, `SettingsRoundTripTest`, plugin-ui's vitest suite) must stay green through every step.
- **Commit cadence:** one commit per task. Message format: `refactor(settings): <what>` for code; `test(settings): <what>` for tests; `docs(settings): <what>` for docs.

---

## Phase 0 — Discovery & risk audit

### Task 0: Audit existing `show_if` rules in PHP for dot-path usage

The cleanup is safe if no production `show_if` rule uses dot-path form (everything declares `'show_if' => [ 'commission_type' => ... ]` rather than `'show_if' => [ 'general.commerce.commission_type' => ... ]`). Confirm.

**Files:**
- None modified.
- Read: `includes/Admin/Settings/Schema/SettingsSchema.php`, `includes/Abstracts/SettingsElement.php`, and `dokan-pro/` (parent dir scan).

- [ ] **Step 1: Scan dokan-lite for dot-path show_if keys**

```bash
grep -rn "'show_if'\|show_if\s*=>" includes/ 2>/dev/null
grep -rnE "'dependencies'\s*=>|->add_dependency\(" includes/ 2>/dev/null
grep -rnE "->add_dependency\(\s*'[^']*\.[^']*'" includes/ 2>/dev/null
```

For every match, inspect the `key` argument. If any are dot-paths (e.g. `'general.marketplace.commission_type'`), record them in the report.

- [ ] **Step 2: Same scan in dokan-pro**

```bash
PRO_ROOT=/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/dokan-pro
grep -rnE "->add_dependency\(\s*'[^']*\.[^']*'" "$PRO_ROOT" 2>/dev/null | head -50
grep -rnE "'show_if'\s*=>\s*\[\s*'[^']*\.[^']*'" "$PRO_ROOT" 2>/dev/null | head -50
```

- [ ] **Step 3: Audit plugin-ui Storybook stories and tests for dot-path rules**

```bash
PLUGIN_UI=/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
grep -rnE "dependency_key.*\." "$PLUGIN_UI/src" 2>/dev/null | head -20
```

- [ ] **Step 4: Decide compat-fallback necessity**

If Step 1–3 surface **zero** dot-path rules: the cleanup can land without a runtime compat shim. Document this in the inventory.

If **any** dot-path rules exist: the cleanup needs a read-side fallback (Task 3 Step 6 below). Document the count + file:line list.

- [ ] **Step 5: Write the discovery report**

Create `docs/superpowers/specs/2026-05-18-dependency-key-cleanup-discovery.md`:

```markdown
# `dependency_key` cleanup — discovery report

**Date:** 2026-05-18

## Dot-path show_if rules found

| File | Line | Rule key | Decision |
| --- | --- | --- | --- |
| (none) or (list) | … | … | … |

## Compat-fallback needed?

Yes / No (with reasoning)

## Plugin-ui consumers using element.dependency_key

(File list from grep)
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-05-18-dependency-key-cleanup-discovery.md
git commit -m "docs(settings): dependency_key cleanup discovery — dot-path rule audit"
```

---

## Phase 1 — Make the contract tolerant of both forms

Goal: server starts always-emitting `dependency_key === id` (for flat-array path) and `dependency_key === id` (for class-based path). Plugin-ui formatter stops overwriting. Everything keeps working.

### Task 1: Class-based PHP — `SettingsElement::set_dependency_key()` returns `id`

**Files:**
- Modify: `includes/Abstracts/SettingsElement.php`
- Test: `tests/php/src/Abstracts/SettingsElementTest.php` (create or extend)

- [ ] **Step 1: Failing test — element's dependency_key equals its id, not the dot-path**

```php
public function test_dependency_key_equals_id_not_dot_path() {
    $parent = new \WeDevs\Dokan\Admin\Settings\Element\Page( [ 'id' => 'general' ] );
    $child  = new \WeDevs\Dokan\Admin\Settings\Element\Field( [ 'id' => 'commission_type' ] );
    $parent->set_children( [ $child ] );

    // After tree resolution, the child should be addressable by its id, not by the dot-path.
    $children = $parent->get_children();
    $resolved = $children['commission_type'];

    $this->assertSame( 'commission_type', $resolved->get_dependency_key() );
}
```

Run; verify FAIL (current behavior is `'general.commission_type'`).

- [ ] **Step 2: Change `SettingsElement::get_children()` line 370**

```php
// Before:
$child->set_dependency_key( trim( $this->get_dependency_key() . '.' . $child->get_id(), '. ' ) );

// After:
$child->set_dependency_key( $child->get_id() );
```

- [ ] **Step 3: Verify Step 1 test passes**

- [ ] **Step 4: Change `get_dependencies()` (line 407-415) to use `id`**

```php
public function get_dependencies(): array {
    $self = $this->get_id();   // was: $this->get_dependency_key();
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

- [ ] **Step 5: Update the docblock on `add_dependency()` (line 434)**

```php
 * @param string $key Field id of the field this dependency watches.
 *                    Dot-path form `parent.child.field` is accepted for
 *                    backward compatibility; the last segment is matched.
```

(The compat note is intentional — the matcher in plugin-ui will get a fallback in Task 3.)

- [ ] **Step 6: Run the full PHP suite**

```bash
vendor/bin/phpunit -c phpunit.xml --filter "SettingsElement|SettingsSchema|SettingsRegistry|LegacySettingsBridge|GeneratedFragment|SettingsRoundTrip"
```

All green expected. If something turns red, the consumer relied on dot-path — surface it before changing.

- [ ] **Step 7: Commit**

```bash
git add includes/Abstracts/SettingsElement.php tests/php/src/Abstracts/SettingsElementTest.php
git commit -m "refactor(settings): class-based SettingsElement emits dependency_key === id"
```

---

### Task 2: plugin-ui — stop overwriting `dependency_key` in formatter

**Files:**
- Modify: `/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui/src/components/settings/settings-formatter.ts`
- Modify: corresponding `.test.ts` file (if it exists; otherwise create)

- [ ] **Step 1: Failing test — server-supplied dependency_key is preserved**

```ts
it('preserves server-supplied dependency_key without overwriting', () => {
    const input: SettingsElement[] = [
        { id: 'general', type: 'page', /* ... */ },
        { id: 'commission_type', type: 'field', page_id: 'general',
          dependency_key: 'commission_type' },
    ];
    const out = formatSettings(input);
    const field = findField(out, 'commission_type');
    expect(field.dependency_key).toBe('commission_type');
});

it('falls back to id when server omits dependency_key', () => {
    const input: SettingsElement[] = [
        { id: 'general', type: 'page', /* ... */ },
        { id: 'commission_type', type: 'field', page_id: 'general' },
    ];
    const out = formatSettings(input);
    const field = findField(out, 'commission_type');
    expect(field.dependency_key).toBe('commission_type');
});
```

Run; verify FAIL (current behavior overwrites with `general.commission_type`).

- [ ] **Step 2: Change `settings-formatter.ts:188`**

```ts
// Before:
child.dependency_key = [parent.dependency_key, child.id]
    .filter(Boolean)
    .join('.');

// After: prefer server value; fall back to id when missing.
child.dependency_key = child.dependency_key || child.id;
```

Same treatment for `settings-formatter.ts:152` (page-level reset):

```ts
// Before:
element.dependency_key = '';

// After:
element.dependency_key = element.dependency_key || element.id;
```

And `settings-formatter.ts:244, 252` (`self: child.dependency_key` for dependencies/validations) — leave as-is; they'll now reference id, which is what we want.

- [ ] **Step 3: Verify Step 1 tests pass**

- [ ] **Step 4: Run plugin-ui's full vitest suite**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
npm test
```

All green. If something fails, it's relying on dot-path — fix the test or surface it to the user.

- [ ] **Step 5: Smoke test against dokan-lite**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
npm run build
```

Then in dokan-lite, rebuild the admin bundle and open the settings page in a browser. Verify show_if rules still fire on the General > Selling commission section (`commission_type === 'fixed'` reveals `admin_percentage`).

- [ ] **Step 6: Commit (in plugin-ui repo)**

```bash
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
git add src/components/settings/settings-formatter.ts src/components/settings/settings-formatter.test.ts
git commit -m "refactor(settings): formatter preserves server-supplied dependency_key; falls back to id"
```

---

## Phase 2 — Migrate consumers from `dependency_key` to `id`

Now every consumer reads `id` directly. `dependency_key` becomes vestigial.

### Task 3: plugin-ui consumers — read `id` instead of `dependency_key`

**Files (all in `/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui`):**
- Modify: `src/components/settings/field-renderer.tsx`
- Modify: `src/components/settings/settings-context.tsx`
- Modify: `src/components/settings/fields.tsx`
- Modify: `src/components/settings/settings-formatter.ts` (flatValues building, dependency `self` reference, idIndex)

- [ ] **Step 1: Failing tests for each consumer**

Add tests asserting `values` map is keyed by `id` (not `dependency_key`), `onChange` is called with `id`, `validation errors` are keyed by `id`. Existing tests likely use the same value for both today — find one that doesn't (or contrive one) so the test fails meaningfully.

- [ ] **Step 2: Replace `element.dependency_key` with `element.id` in each consumer**

Mechanical change. Pattern:

```diff
- value: element.dependency_key ? (values[element.dependency_key] ?? element.value) : element.value,
+ value: values[element.id] ?? element.value,
```

```diff
- onChange={(val) => onChange(element.dependency_key!, val)}
+ onChange={(val) => onChange(element.id, val)}
```

Apply to all ~30 call sites in `fields.tsx` and the 3 in `field-renderer.tsx`.

- [ ] **Step 3: settings-context.tsx — `flatValues` map keyed by id**

`settings-context.tsx:30, 32, 139, 146, 178, 312, 329, 359` all need to switch to `id`. The `flatValues` map and `errors` map both become `Record<string, any>` keyed by field id.

- [ ] **Step 4: Update show_if matcher fallback (if Task 0 found dot-path rules)**

In whichever file the dependency-rule matcher lives (likely `settings-formatter.ts` or a dedicated `dependency-resolver.ts`), apply the read-side compat:

```ts
function resolveDepKey(rawKey: string, allIds: Set<string>): string {
    if (allIds.has(rawKey)) return rawKey;
    // Compat: legacy dot-path form. Match by last segment === field id.
    const tail = rawKey.split('.').pop()!;
    if (allIds.has(tail)) {
        // eslint-disable-next-line no-console
        console.warn(
            `[plugin-ui/settings] dot-path show_if key "${rawKey}" is deprecated; use "${tail}" instead.`
        );
        return tail;
    }
    return rawKey;  // unresolvable; let the strict matcher fail loudly
}
```

Apply the resolver wherever dependency keys are looked up in `values`.

- [ ] **Step 5: Run plugin-ui vitest suite**

- [ ] **Step 6: Smoke test in dokan-lite UI**

Open settings, save a value, reload, confirm value persists. Toggle show_if-driven visibility (Selling tab `commission_type` is the canonical case).

- [ ] **Step 7: Commit (in plugin-ui repo)**

```bash
git add src/components/settings/
git commit -m "refactor(settings): consumers read field id; dependency_key becomes vestigial"
```

---

### Task 4: dokan-lite legacy frontend — same migration

**Files:**
- Modify: `src/admin/dashboard/utils/settingsDependencyParser.ts`
- Modify: `src/admin/dashboard/utils/settingsDependencyApplicator.ts`
- Modify: `src/admin/dashboard/utils/settingsTypes.ts` (mark `dependency_key` optional + deprecated)
- Modify: `src/admin/dashboard/pages/settings/fields/DokanDoubleInput.tsx`
- Modify: `src/admin/dashboard/pages/settings/fields/DokanSingleProductPreview.tsx`
- Modify: `src/admin/dashboard/pages/settings/fields/DokanVendorInfoPreview.tsx`
- Modify: `src/admin/dashboard/pages/setup-guide/StepSettings.tsx` (verify no behavior change)

- [ ] **Step 1: Replace `element.dependency_key` with `element.id` everywhere**

For the parser/applicator (utils/*):

```diff
- depWithValue.key === element.dependency_key
+ depWithValue.key === element.id
```

For the field components, replace `updateValue(element.dependency_key, ...)` with `updateValue(element.id, ...)` and drop the `if (!element.dependency_key) return` guards (id is always present).

- [ ] **Step 2: Update TS types**

`settingsTypes.ts:50`:

```ts
/** @deprecated use `id` directly; will be removed in Dokan 5.x */
dependency_key?: string;
```

- [ ] **Step 3: Build dokan-lite admin bundle**

```bash
npm run build
```

- [ ] **Step 4: Smoke test setup guide**

The setup guide is the only consumer of `settingsDependencyParser/Applicator`. Open `wp-admin/admin.php?page=dokan-onboarding` (or whatever the setup guide URL is), step through the settings screen, confirm dependent fields still toggle.

- [ ] **Step 5: Commit**

```bash
git add src/admin/dashboard/
git commit -m "refactor(settings): dokan-lite legacy frontend reads field id instead of dependency_key"
```

---

### Task 5: REST controller — remove the last-segment fallback

**Files:**
- Modify: `includes/REST/AdminSettingsController.php`
- Modify: `tests/php/src/REST/SettingsRoundTripTest.php`

- [ ] **Step 1: Failing test — REST PUT with id-keyed payload writes correctly (already passes)**

The existing `test_dokan_settings_update_fires_reverse_propagation` already exercises id-keyed PUT payloads. Add a new test that asserts the dot-path fallback STILL works (we're keeping it as compat) BUT logs a deprecation when it fires:

```php
public function test_rest_put_with_dot_path_payload_warns_but_still_writes() {
    // Pre-condition: a field exists with id 'setup_wizard_logo_url'
    $request = new \WP_REST_Request( 'PUT', '/dokan/v1/admin/settings/general' );
    $request->set_body_params( [
        'general.marketplace.setup_wizard_logo_url' => 'value_via_dotpath',
    ] );

    // The fallback should resolve to the field, but emit a deprecation log entry.
    $this->setExpectedDeprecated( 'AdminSettingsController dot-path payload' );

    rest_do_request( $request );
    $this->assertSame( 'value_via_dotpath', get_option( 'dokan_settings' )['setup_wizard_logo_url'] ?? null );
}
```

- [ ] **Step 2: Add deprecation log to the fallback at line 179-186**

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

- [ ] **Step 3: Verify test passes; full PHP suite green**

- [ ] **Step 4: Commit**

```bash
git add includes/REST/AdminSettingsController.php tests/php/src/REST/SettingsRoundTripTest.php
git commit -m "refactor(settings): REST PUT dot-path fallback now logs deprecation"
```

---

## Phase 3 — Remove `dependency_key` from the schema

Now nothing reads `dependency_key` except the deprecated getter. Time to delete.

### Task 6: Schema — stop emitting `dependency_key`

**Files:**
- Modify: `includes/Abstracts/SettingsElement.php` (`to_array()` at line 666; `set/get_dependency_key()` getters/setters)
- Modify: `includes/Admin/Settings/Schema/SettingsRegistry.php` (drop residual docblock references)
- Modify: `src/admin/dashboard/utils/settingsTypes.ts` (drop the field)
- Modify (plugin-ui): `src/components/settings/settings-types.ts` (drop the field), `settings-formatter.ts` (drop fallback line from Task 2)

- [ ] **Step 1: Failing test — `to_array()` does not include `dependency_key`**

```php
public function test_to_array_omits_dependency_key() {
    $field = new \WeDevs\Dokan\Admin\Settings\Element\Field( [ 'id' => 'site_logo' ] );
    $array = $field->to_array();
    $this->assertArrayNotHasKey( 'dependency_key', $array );
}
```

- [ ] **Step 2: Remove `'dependency_key' => $this->get_dependency_key()` from `to_array()`**

`SettingsElement.php:666` line removed.

- [ ] **Step 3: Mark `set_dependency_key` / `get_dependency_key` as deprecated**

```php
/**
 * @deprecated DOKAN_NEXT_MAJOR Use get_id() instead. Returns id verbatim.
 */
public function get_dependency_key(): string {
    return $this->get_id();
}

/**
 * @deprecated DOKAN_NEXT_MAJOR No-op. dependency_key is now always equal to id.
 */
public function set_dependency_key( string $dependency_key ): SettingsElement {
    return $this;
}
```

(Note: keep the public methods to avoid breaking third-party consumers, but they become no-ops.)

- [ ] **Step 4: Drop `dependency_key` from TS types**

In plugin-ui's `settings-types.ts` and dokan-lite's `settingsTypes.ts`, remove the field. TS compiler will catch any remaining consumers — fix each by reading `id` instead.

- [ ] **Step 5: Drop the fallback line from Task 2 (now redundant)**

In plugin-ui's `settings-formatter.ts`, remove the `child.dependency_key = child.dependency_key || child.id;` lines now that nothing reads `dependency_key`.

- [ ] **Step 6: Drop the residual docblock references in `SettingsRegistry.php`**

The class docblock and `generate_keys()` docblock currently explain why `dependency_key` isn't generated. With `dependency_key` gone entirely, those notes can be removed; replace with one line: `// dependency_key was removed in DOKAN_NEXT_MAJOR — use field id directly.`

- [ ] **Step 7: Run the full PHP + plugin-ui test suites**

Both must be green.

- [ ] **Step 8: Commit (two commits — one per repo)**

```bash
# dokan-lite
git add includes/Abstracts/SettingsElement.php \
        includes/Admin/Settings/Schema/SettingsRegistry.php \
        src/admin/dashboard/utils/settingsTypes.ts \
        tests/php/src/Abstracts/SettingsElementTest.php
git commit -m "refactor(settings): drop dependency_key from schema; getter/setter become deprecated no-ops"

# plugin-ui (separate repo)
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
git add src/components/settings/
git commit -m "refactor(settings): drop dependency_key from schema types and formatter"
```

---

## Task 7: Documentation pass

**Files:**
- Modify: `docs/settings/extending.md` (developer guide from the CSV migration plan)
- Modify (plugin-ui): `CLAUDE.md`, `DEVELOPER_GUIDE.md`
- Modify (plugin-ui): `src/DeveloperGuide.mdx`, `src/components/settings/Settings.mdx`, `src/components/settings/Settings.stories.tsx`

- [ ] **Step 1: Rewrite the "values keyed by dependency_key" passages**

In each doc, replace mentions of `dependency_key` with `id`. Add a "Migration notice" callout pointing readers from old code to the new convention.

- [ ] **Step 2: Update the Storybook story examples in plugin-ui**

If any story declares fields with `dependency_key: 'foo'`, drop that field — the formatter no longer needs it.

- [ ] **Step 3: Commit (two repos)**

```bash
# dokan-lite
git add docs/settings/extending.md
git commit -m "docs(settings): extending guide reflects dependency_key removal"

# plugin-ui
cd /Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui
git add CLAUDE.md DEVELOPER_GUIDE.md src/DeveloperGuide.mdx src/components/settings/
git commit -m "docs(settings): drop dependency_key from extending guides and stories"
```

---

## Stop conditions / escalation

- **If Task 0 surfaces dot-path show_if rules in dokan-pro:** stop and confirm with the user whether to fix Pro first or ship the compat fallback as a permanent reader. The plan assumes Pro doesn't use dot-paths; if it does, Task 5's deprecation log will be noisy.
- **If a smoke test (Task 2 Step 5 or Task 3 Step 6) shows a show_if rule no longer firing:** the formatter's overwrite was masking a bug in the rule declaration. Surface the field id + rule shape; don't try to fix in this plan.
- **If plugin-ui's vitest suite has tests that hardcode dot-path `dependency_key` values:** those tests were testing the formatter's overwrite behavior, not real semantics. Update them in the same commit as the formatter change.
- **If the REST `setExpectedDeprecated` assertion in Task 5 Step 1 fails:** the WP test harness isn't picking up `_doing_it_wrong`. Replace with a manual `did_action`/`add_action` capture on `deprecated_argument_run`.

## Done definition

- `vendor/bin/phpunit -c phpunit.xml` green (all settings tests, including new tab tests, bridge tests, REST tests, SettingsElement test).
- `cd plugin-ui && npm test` green.
- `grep -r 'dependency_key' includes/ src/` returns only:
  - The deprecated getter/setter in `SettingsElement.php` (intentional).
  - The dot-path fallback in `AdminSettingsController.php` (intentional, deprecation-logged).
  - Comments documenting the removal.
- `grep -r 'dependency_key' /path/to/plugin-ui/src` returns no live consumer code; only doc strings noting removal.
- The CSV-driven schema's feature flag (`dokan_csv_schema_enabled`) can be flipped on a smoke install and saves round-trip correctly.
- `docs/settings/extending.md` no longer mentions `dependency_key` except in a "Removed in DOKAN_NEXT_MAJOR" note.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| dokan-pro has dot-path show_if rules | Medium | Save dropdown deprecation noise | Task 0 audits; Task 5 ships compat shim |
| Third-party plugin reads `element.dependency_key` directly | Low | Broken extension UI | Deprecated getter still returns `id`; addon keeps working with a behavioral note |
| Stored state in Settings localStorage cache uses dot-path keys | Low | One-time empty-state on first load | Clear localStorage in the migration commit's release notes |
| plugin-ui ships separately from dokan-lite; consumer plugins may pin an older plugin-ui version | High | Older plugin-ui still overwrites `dependency_key` — but to `id` now too (because `dependency_key === id` server-side), so it's a no-op | Document the minimum plugin-ui version in `docs/settings/extending.md` |
| `show_if` rule with key matching multiple fields (would be impossible if ids are globally unique, but) | Low | Wrong field's value used | The per-tab test `test_no_id_collisions_within_tab` already pins this invariant; CI catches new collisions |

## Estimated effort

- Phase 0 (Discovery): 1 task, ~30 min
- Phase 1 (Tolerance): 2 tasks, ~2 hr (split across 2 repos)
- Phase 2 (Migration): 3 tasks, ~4 hr (largest task is plugin-ui consumers — 30+ `onChange` call sites)
- Phase 3 (Removal): 1 task, ~1 hr
- Phase 3.5 (Docs): 1 task, ~30 min

**Total: ~8 hours of focused work across 7 commits on dokan-lite + 3 commits on plugin-ui.**
