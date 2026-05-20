# Legacy Settings Repository — Design Spec

**Date:** 2026-05-18
**Status:** Approved for planning
**Scope:** Backend (PHP) only

## Goal

Provide a single read/write seam for the legacy per-section `dokan_*` wp_options (`dokan_general`, `dokan_selling`, `dokan_appearance`, `dokan_pages`, `dokan_privacy`, `dokan_withdraw`, …) so all settings access flows through a repository.

**Primary motivation:** testability and per-request caching. Not a migration step, not an enforcement project, not a deletion of the legacy bridge.

## Non-goals

- Does not modify `SettingsRepository` (owner of `dokan_admin_settings`).
- Does not delete or restructure `LegacySettingsBridge`.
- Does not add a PHPCS sniff to forbid raw legacy writes (follow-up after call-site migration).
- Does not change schema, validation, or REST behavior.
- Does not collapse legacy per-section storage into the flat option.

## Architecture

```
                    ┌──────────────────────────────┐
   callers ───────► │ LegacySettingsRepository     │
                    │  (per-section reads/writes)  │
                    └──────┬────────────────┬──────┘
                           │                │
            read overlay   │                │ write mirror
            + l→n map      ▼                ▼
                  ┌──────────────────┐  ┌────────────────────┐
                  │ LegacySettings   │  │ SettingsRepository │
                  │ Bridge           │  │ (dokan_admin_      │
                  │                  │  │  settings)         │
                  └──────────────────┘  └────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ get_option(      │
                  │  'dokan_<sec>')  │
                  └──────────────────┘
```

**Ownership:**

| Concern | Owner |
|---|---|
| Per-section legacy storage reads/writes | `LegacySettingsRepository` |
| Flat `dokan_admin_settings` storage | `SettingsRepository` (unchanged) |
| Legacy ↔ new key mapping | `LegacySettingsBridge` (unchanged + one new public method) |
| Schema, validation | `SettingsSchema` / `SchemaValidator` (unchanged) |

## Files

- `includes/Admin/Settings/Repository/LegacySettingsRepositoryInterface.php` (new)
- `includes/Admin/Settings/Repository/LegacySettingsRepository.php` (new)
- `includes/Admin/Settings/Migration/LegacySettingsBridge.php` (one new public method: `map_legacy_section_to_new`)
- `includes/DependencyManagement/ServiceProvider.php` (one new binding)
- `includes/functions.php` (`dokan_get_option` becomes a thin adapter)
- A handful of direct `get_option('dokan_*')` / `update_option('dokan_*')` callers in `functions.php`, `Rewrites.php`, `Fees.php`, `wc-functions.php`, `wc-template.php`, `store-functions.php` migrate to the repository.

## Interface

```php
namespace WeDevs\Dokan\Admin\Settings\Repository;

interface LegacySettingsRepositoryInterface {
    public function all( string $section ): array;
    public function get( string $section, string $key, $default_value = null );
    public function update( string $section, array $slice ): array;
    public function replace( string $section, array $payload ): array;
    public function flush_cache( ?string $section = null ): void;
}
```

**Notes:**
- Section-aware throughout. Parameter order is `(section, key, default)` — `dokan_get_option()` adapts from its public `(option, section, default)` order.
- `update()` returns added/changed entries (matches `SettingsRepository::update()`).
- `replace()` returns a deletion-aware diff (removed keys appear as `null`).
- No `set()` convenience — callers use `update($section, [ $key => $value ])`.

## Read path

```
get($section, $key, $default):
  return all($section)[$key] ?? $default

all($section):
  if (!isset($snapshots[$section])):
    $raw = get_option($section, []);
    $raw = is_array($raw) ? $raw : [];
    $snapshots[$section] = $bridge->hydrate_legacy_from_new($section, $raw);
  return $snapshots[$section];
```

**Overlay semantics:** identical to today's `dokan_get_option()` — the new flat option wins over the raw section value. The refactor centralizes this; it does not change semantics.

**Cache shape:** `array<string, array<string, mixed>> $snapshots` keyed by section name.

## Write path

```
update($section, $slice):
  $current = $this->all($section);                            // overlay-applied
  $slice   = apply_filters('dokan_legacy_settings_pre_save', $slice, $section, $current);
  $changed = self::diff($current, $slice);
  if (empty($changed)) return [];

  // 1. Legacy storage write
  $raw     = get_option($section, []);
  $raw     = is_array($raw) ? $raw : [];
  $merged  = array_merge($raw, $slice);
  update_option($section, $merged, true);
  $this->snapshots[$section] = $bridge->hydrate_legacy_from_new($section, $merged);

  // 2. Mirror mapped keys to dokan_admin_settings
  try {
      $flat_slice = $bridge->map_legacy_section_to_new($section, $slice);
      if (!empty($flat_slice)) {
          $new_repo->update($flat_slice);
      }
  } catch (\Throwable $e) {
      dokan_log('[LegacySettingsRepository] mirror write failed: ' . $e->getMessage());
  }

  do_action('dokan_legacy_settings_changed', $section, $changed, $current, $merged);
  return $changed;
```

`replace()` follows the same shape, writes `$payload` whole, and computes a deletion-aware diff.

**Why both writes:** legacy-only writes are silently shadowed by the overlay; mirror-only writes leave the legacy section option stale for any third-party code still reading it directly. Both keeps the two stores coherent; the new flat option remains source-of-truth for the overlay.

**Failure mode:** if the bridge mapping throws, the legacy write has already landed. The mirror call is caught + logged; the read overlay reconciles on the next access once the new option catches up. No exception propagates to the caller.

## Cache invalidation

Constructor subscribes:

- For each section in `known_sections()`: `update_option_<section>` and `add_option_<section>` → flush that section's snapshot.
- `update_option_dokan_admin_settings` and `add_option_dokan_admin_settings` → flush **all** section snapshots (the overlay source changed).

`flush_cache(null)` clears every section.

**`known_sections()` source:** derived from `SettingsSchema` group ids. Single source of truth, no hardcoded list.

**Known gap (accepted):** sections added at runtime via the `dokan_settings_sections` filter *after* the repository constructs will not get cache-invalidation listeners. Documented in the class docblock. Callers using late-bound custom sections are responsible for calling `flush_cache($section)` themselves if they bypass the repository for writes.

## Hooks introduced

| Hook | Type | Signature |
|---|---|---|
| `dokan_legacy_settings_pre_save` | filter | `( array $slice, string $section, array $current )` |
| `dokan_legacy_settings_changed` | action | `( string $section, array $changed, array $current, array $merged )` |

## DI wiring

```php
// ServiceProvider
$this->getContainer()->add(
    LegacySettingsRepositoryInterface::class,
    LegacySettingsRepository::class
)->addArgument(SettingsRepositoryInterface::class)
 ->addArgument(LegacySettingsBridge::class);
```

Exposed via the magic getter as `dokan()->legacy_settings`.

## `dokan_get_option()` adapter

```php
function dokan_get_option( $option, $section, $default_value = '' ) {
    [ $option, $section ] = dokan_admin_settings_rearrange_map( $option, $section );

    if ( function_exists( 'dokan_get_container' ) ) {
        try {
            return dokan_get_container()
                ->get( LegacySettingsRepositoryInterface::class )
                ->get( $section, $option, $default_value );
        } catch ( \Throwable $e ) {
            // Container not booted — fall through to raw read.
        }
    }

    $options = get_option( $section );
    $options = is_array( $options ) ? $options : [];
    return $options[ $option ] ?? $default_value;
}
```

The container-missing fallback preserves the current early-boot safety net (no overlay, no cache — same as today's fallback path).

## Call-site migration

- Direct `get_option('dokan_*')` reads in `functions.php` (lines 3227, 3606, etc.) migrate to `dokan()->legacy_settings->all($section)` — they pick up the overlay for free (currently they don't, which is a latent inconsistency this fixes).
- Direct `update_option('dokan_*', …)` writes migrate to `dokan()->legacy_settings->update($section, $slice)`.

## Testing

Unit tests at `tests/php/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`:

1. Read — raw section, no new-flat value.
2. Read — overlay wins.
3. Read cache — repeat `get()` hits `get_option` once.
4. Write — legacy section option persisted.
5. Write — mirror fires with bridge-mapped flat slice.
6. Write — empty diff is a no-op (zero `update_option` calls).
7. Write — bridge mapping throws → legacy write lands, mirror swallowed + logged, no exception.
8. `replace()` returns deletion-aware diff.
9. Cache invalidation — foreign legacy write flushes only that section.
10. Cache invalidation — `update_option_dokan_admin_settings` flushes all sections.
11. `flush_cache(null)` clears every section.
12. Filter `dokan_legacy_settings_pre_save` can mutate the slice.
13. Action `dokan_legacy_settings_changed` fires with `(section, changed, before, after)`.

One integration smoke test under wp-env: round-trip a write through `dokan()->legacy_settings->update(...)` and assert both `get_option('dokan_general')` and `get_option('dokan_admin_settings')` reflect the change.

## Risks

1. **Early-boot calls** — covered by the container-missing fallback in the adapter.
2. **Late-bound sections via filter** — accepted gap, documented.
3. **Write amplification** — every legacy write triggers two `update_option` calls. Settings writes are rare; acceptable.
4. **WP option hook timing** — listeners only flush the in-request snapshot; next read picks up the fresh value. Safe.

## Rollout

One PR, no feature flag (read overlay already exists; write mirror is additive):

1. Add interface, class, DI binding, unit tests.
2. Flip `dokan_get_option()` to delegate.
3. Migrate the handful of direct `get_option('dokan_*')` / `update_option('dokan_*')` callers.
4. Run PHPUnit + Playwright smoke.
