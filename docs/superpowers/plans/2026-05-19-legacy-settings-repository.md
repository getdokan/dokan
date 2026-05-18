# LegacySettingsRepository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `LegacySettingsRepository` that becomes the only sanctioned read/write seam for the legacy per-section `dokan_*` wp_options, with per-section caching, read overlay via `LegacySettingsBridge`, and a write mirror to `dokan_admin_settings` via the existing `SettingsRepository`.

**Architecture:** Section-aware repository wraps `get_option('dokan_<section>')` calls and composes the existing `LegacySettingsBridge` (for overlay + legacy→new key mapping) with the existing `SettingsRepository` (for the flat-option write mirror). `dokan_get_option()` becomes a thin adapter; a handful of direct `get_option`/`update_option` callers migrate.

**Tech Stack:** PHP 7.4+, WordPress, PHPUnit 9.6, Brain Monkey/Mockery, League Container. Lives under `WeDevs\Dokan\Admin\Settings\Repository`.

---

## File Structure

**New files:**

- `includes/Admin/Settings/Repository/LegacySettingsRepositoryInterface.php` — contract (5 methods, section-aware).
- `includes/Admin/Settings/Repository/LegacySettingsRepository.php` — concrete repository.
- `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php` — unit tests.

**Modified files:**

- `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php` — register the repository alongside `SettingsRepository` / `LegacySettingsBridge`.
- `includes/functions.php` — `dokan_get_option()` delegates to the repository (with the existing container-missing fallback preserved).
- A handful of direct `get_option('dokan_*')` / `update_option('dokan_*')` call sites in `includes/functions.php`, `includes/Rewrites.php`, `includes/Fees.php`, `includes/wc-functions.php`, `includes/wc-template.php`, `includes/store-functions.php` — migrate to the repository.

**Out of scope (do not touch):**

- `includes/Admin/Settings/Repository/SettingsRepository.php` and its interface.
- `includes/Admin/Settings/Migration/LegacySettingsBridge.php` — no new methods; reuse existing `hydrate_legacy_from_new()`, `transform_legacy_payload_to_new()`, `get_mapping()`.
- PHPCS sniffs.

---

## Conventions used throughout this plan

- Namespace: `WeDevs\Dokan\Admin\Settings\Repository`.
- `@since DOKAN_SINCE` on every new symbol — matches the existing files in the directory.
- Tests extend `WeDevs\Dokan\Test\DokanTestCase` and live under `tests/php/src/...` mirroring the production namespace. `@group admin-settings` annotation.
- Run a single PHPUnit test class with: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`.
- Each task ends with one commit. Commit subject matches existing style (`refactor(settings): …` / `feat(settings): …` / `test(settings): …`).
- Always quote tab-indented file content exactly as it appears in the existing codebase (the provider uses tab indentation in one section — see Task 2).

---

## Task 1 — Create the interface

**Files:**
- Create: `includes/Admin/Settings/Repository/LegacySettingsRepositoryInterface.php`

- [ ] **Step 1: Write the interface file**

```php
<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

/**
 * Legacy Settings Repository contract.
 *
 * Single sanctioned read/write surface for the legacy per-section `dokan_*`
 * wp_options (`dokan_general`, `dokan_selling`, `dokan_appearance`,
 * `dokan_pages`, `dokan_privacy`, `dokan_withdraw`, …).
 *
 * Reads apply the new-flat overlay via {@see \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge}.
 * Writes persist to the legacy section option AND mirror mapped keys to the
 * new flat option via {@see SettingsRepositoryInterface}.
 *
 * @since DOKAN_SINCE
 */
interface LegacySettingsRepositoryInterface {

    /**
     * Full overlay-applied view of one legacy section.
     *
     * @param string $section Legacy wp_option name (e.g. `dokan_general`).
     *
     * @return array<string,mixed>
     */
    public function all( string $section ): array;

    /**
     * Single-key overlay-applied read.
     *
     * @param string $section       Legacy wp_option name.
     * @param string $key           Field id inside that section.
     * @param mixed  $default_value Returned when the key is absent.
     *
     * @return mixed
     */
    public function get( string $section, string $key, $default_value = null );

    /**
     * Batch upsert: merges `$slice` into the legacy section option and
     * mirrors mapped keys to `dokan_admin_settings`.
     *
     * Fires:
     *  - `dokan_legacy_settings_pre_save` filter — subscribers may mutate `$slice`.
     *  - `dokan_legacy_settings_changed` action — fires on non-empty diff.
     *
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $slice
     *
     * @return array<string,mixed> Added/changed entries actually written.
     */
    public function update( string $section, array $slice ): array;

    /**
     * Full replacement of one section's payload. Returns a deletion-aware
     * diff (removed keys appear as `null`). Mirrors mapped keys to the new
     * flat option.
     *
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $payload
     *
     * @return array<string,mixed>
     */
    public function replace( string $section, array $payload ): array;

    /**
     * Drop the in-request snapshot. Pass null to flush every section.
     *
     * @param string|null $section
     *
     * @return void
     */
    public function flush_cache( ?string $section = null ): void;
}
```

- [ ] **Step 2: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepositoryInterface.php
git commit -m "feat(settings): introduce LegacySettingsRepositoryInterface"
```

---

## Task 2 — Skeleton class + DI registration (no logic yet)

The skeleton lets us register the class and run a smoke test before writing real logic.

**Files:**
- Create: `includes/Admin/Settings/Repository/LegacySettingsRepository.php`
- Modify: `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php` (add to `$services` list)
- Create: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`:

```php
<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Repository;

use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsRepositoryTest extends DokanTestCase {

    public function test_class_implements_interface(): void {
        $repo = new LegacySettingsRepository();
        $this->assertInstanceOf( LegacySettingsRepositoryInterface::class, $repo );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: FAIL — `Class "WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository" not found`

- [ ] **Step 3: Write the skeleton class**

Create `includes/Admin/Settings/Repository/LegacySettingsRepository.php`:

```php
<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;

/**
 * Default legacy settings repository.
 *
 * Reads/writes legacy per-section `dokan_*` wp_options with overlay + mirror.
 *
 * @since DOKAN_SINCE
 */
final class LegacySettingsRepository implements LegacySettingsRepositoryInterface {

    private SettingsRepositoryInterface $new_repo;

    private LegacySettingsBridge $bridge;

    /**
     * Per-section in-request snapshot cache.
     *
     * @var array<string, array<string, mixed>>
     */
    private array $snapshots = [];

    public function __construct(
        ?SettingsRepositoryInterface $new_repo = null,
        ?LegacySettingsBridge $bridge = null
    ) {
        $this->new_repo = $new_repo ?? new SettingsRepository();
        $this->bridge   = $bridge ?? new LegacySettingsBridge();
    }

    public function all( string $section ): array {
        return [];
    }

    public function get( string $section, string $key, $default_value = null ) {
        return $default_value;
    }

    public function update( string $section, array $slice ): array {
        return [];
    }

    public function replace( string $section, array $payload ): array {
        return [];
    }

    public function flush_cache( ?string $section = null ): void {
        if ( null === $section ) {
            $this->snapshots = [];
            return;
        }
        unset( $this->snapshots[ $section ] );
    }
}
```

- [ ] **Step 4: Register the class in the service provider**

Open `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php` and add the new class to the imports and the `$services` array. The full file becomes:

```php
<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSettingsServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'admin-settings-service' ];

    /**
     * Services to register.
     */
    protected $services = [
        SettingsRegistry::class,
        SchemaValidator::class,
        SettingsRepository::class,
        LegacySettingsBridge::class,
        LegacySettingsRepository::class,
        BridgeBootstrap::class,
    ];

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
```

Note: keep the existing tab indentation on the `register()` doc-block lines exactly as shown — the file uses mixed indentation that PHPCS currently accepts.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS — 1 test.

- [ ] **Step 6: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepository.php \
        includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "feat(settings): scaffold LegacySettingsRepository + DI binding"
```

---

## Task 3 — Reads with per-section snapshot cache + overlay

**Files:**
- Modify: `includes/Admin/Settings/Repository/LegacySettingsRepository.php`
- Modify: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

- [ ] **Step 1: Write failing tests for read paths**

Append to `LegacySettingsRepositoryTest.php` (inside the class):

```php
public function test_all_returns_empty_array_when_option_missing(): void {
    delete_option( 'dokan_general' );

    $repo = new LegacySettingsRepository();
    $this->assertSame( [], $repo->all( 'dokan_general' ) );
}

public function test_all_returns_raw_section_when_no_overlay(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
    delete_option( 'dokan_admin_settings' );

    $repo = new LegacySettingsRepository();
    $this->assertSame(
        [ 'custom_store_url' => 'shop' ],
        $repo->all( 'dokan_general' )
    );
}

public function test_get_returns_default_when_key_absent(): void {
    update_option( 'dokan_general', [ 'other' => 'value' ] );
    delete_option( 'dokan_admin_settings' );

    $repo = new LegacySettingsRepository();
    $this->assertSame( 'fallback', $repo->get( 'dokan_general', 'custom_store_url', 'fallback' ) );
}

public function test_overlay_from_new_option_wins_over_raw_section(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
    update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

    $repo = new LegacySettingsRepository();
    $this->assertSame(
        'marketplace',
        $repo->get( 'dokan_general', 'custom_store_url' )
    );
}

public function test_second_read_uses_in_request_cache(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

    $repo = new LegacySettingsRepository();
    $this->assertSame( 'shop', $repo->get( 'dokan_general', 'custom_store_url' ) );

    // Tamper with the option directly; repository should still serve the cached snapshot.
    global $wpdb;
    $wpdb->update(
        $wpdb->options,
        [ 'option_value' => serialize( [ 'custom_store_url' => 'TAMPERED' ] ) ],
        [ 'option_name' => 'dokan_general' ]
    );
    wp_cache_delete( 'dokan_general', 'options' );
    wp_cache_delete( 'notoptions', 'options' );

    $this->assertSame( 'shop', $repo->get( 'dokan_general', 'custom_store_url' ) );
}
```

Note: `test_overlay_from_new_option_wins_over_raw_section` relies on the schema mapping `vendor_store_url` → `dokan_general.custom_store_url` (verified at `SettingsSchema.php:165`). If that mapping ever moves, update the test fixture along with it.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: FAIL — assertions fail because `all()`/`get()` return `[]`/null defaults.

- [ ] **Step 3: Implement the read path**

Replace the `all()` and `get()` methods in `LegacySettingsRepository.php`:

```php
public function all( string $section ): array {
    if ( ! array_key_exists( $section, $this->snapshots ) ) {
        $raw = get_option( $section, [] );
        $raw = is_array( $raw ) ? $raw : [];

        $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $raw );
    }
    return $this->snapshots[ $section ];
}

public function get( string $section, string $key, $default_value = null ) {
    $all = $this->all( $section );
    return array_key_exists( $key, $all ) ? $all[ $key ] : $default_value;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS — 6 tests (1 from Task 2 + 5 new).

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepository.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "feat(settings): legacy repo reads with per-section cache + overlay"
```

---

## Task 4 — Cache invalidation on foreign writes

**Files:**
- Modify: `includes/Admin/Settings/Repository/LegacySettingsRepository.php`
- Modify: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

The repository must invalidate its snapshot when third-party code calls raw `update_option('dokan_general', …)` or when the new flat option is written outside the legacy repo.

`known_sections()` derives from the bridge's mapping — collect unique `option` values from `LegacySettingsBridge::get_mapping()` (each entry is shaped `[ 'option' => 'dokan_general', 'field' => '…' ]`, verified at `LegacySettingsBridgeTest.php:48-55`).

- [ ] **Step 1: Write the failing tests**

Append to `LegacySettingsRepositoryTest.php`:

```php
public function test_foreign_legacy_write_flushes_only_that_section(): void {
    update_option( 'dokan_general',    [ 'custom_store_url' => 'shop' ] );
    update_option( 'dokan_appearance', [ 'store_banner_width' => 600 ] );

    $repo = new LegacySettingsRepository();
    // Warm both snapshots.
    $repo->all( 'dokan_general' );
    $repo->all( 'dokan_appearance' );

    // Foreign write to dokan_general should trigger update_option_dokan_general.
    update_option( 'dokan_general', [ 'custom_store_url' => 'market' ] );

    $this->assertSame( 'market', $repo->get( 'dokan_general', 'custom_store_url' ) );
    // The other section's snapshot should remain cached — tamper to verify.
    global $wpdb;
    $wpdb->update(
        $wpdb->options,
        [ 'option_value' => serialize( [ 'store_banner_width' => 9999 ] ) ],
        [ 'option_name' => 'dokan_appearance' ]
    );
    wp_cache_delete( 'dokan_appearance', 'options' );
    $this->assertSame( 600, $repo->get( 'dokan_appearance', 'store_banner_width' ) );
}

public function test_new_flat_option_write_flushes_every_section(): void {
    update_option( 'dokan_general',    [ 'custom_store_url' => 'shop' ] );
    update_option( 'dokan_appearance', [ 'store_banner_width' => 600 ] );

    $repo = new LegacySettingsRepository();
    $repo->all( 'dokan_general' );
    $repo->all( 'dokan_appearance' );

    update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

    // After flush, the next read should reflect the overlay from the new flat option.
    $this->assertSame( 'marketplace', $repo->get( 'dokan_general', 'custom_store_url' ) );
}

public function test_flush_cache_null_clears_all_sections(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

    $repo = new LegacySettingsRepository();
    $repo->all( 'dokan_general' );

    $repo->flush_cache( null );

    update_option( 'dokan_general', [ 'custom_store_url' => 'cleared' ] );
    // Bypass the WP hook by re-flushing manually (the hook already flushed once but
    // we want to assert the public method works independently of the listener).
    $repo->flush_cache( null );

    $this->assertSame( 'cleared', $repo->get( 'dokan_general', 'custom_store_url' ) );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: FAIL — stale snapshot served after foreign write.

- [ ] **Step 3: Subscribe to WP option hooks in the constructor**

Replace the constructor and add a private helper in `LegacySettingsRepository.php`:

```php
public function __construct(
    ?SettingsRepositoryInterface $new_repo = null,
    ?LegacySettingsBridge $bridge = null
) {
    $this->new_repo = $new_repo ?? new SettingsRepository();
    $this->bridge   = $bridge ?? new LegacySettingsBridge();

    foreach ( $this->known_sections() as $section ) {
        add_action( "update_option_{$section}", [ $this, 'on_section_changed' ] );
        add_action( "add_option_{$section}",    [ $this, 'on_section_changed' ] );
    }

    // The new flat option participates in every overlay — its writes invalidate
    // every snapshot. Use named callbacks so the same listener isn't bound twice
    // if the repository is instantiated more than once in a request.
    $new_option = SettingsRepository::OPTION_KEY;
    add_action( "update_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
    add_action( "add_option_{$new_option}",    [ $this, 'flush_all_snapshots' ] );
}

/**
 * WP hook listener — receives `($option, …)` from add_option / `($old, $new, $option)` from update_option.
 * We only need the option name, which we derive from the current filter name.
 *
 * @return void
 */
public function on_section_changed(): void {
    $option = current_action();
    foreach ( [ 'update_option_', 'add_option_' ] as $prefix ) {
        if ( 0 === strpos( $option, $prefix ) ) {
            $section = substr( $option, strlen( $prefix ) );
            $this->flush_cache( $section );
            return;
        }
    }
}

/**
 * Listener for the new flat option — every section snapshot must be flushed
 * because the overlay source changed.
 *
 * @return void
 */
public function flush_all_snapshots(): void {
    $this->flush_cache( null );
}

/**
 * Unique legacy wp_option names that the bridge currently knows about.
 *
 * @return array<int,string>
 */
private function known_sections(): array {
    $map      = $this->bridge->get_mapping();
    $sections = [];
    foreach ( $map as $entry ) {
        if ( is_array( $entry ) && isset( $entry['option'] ) && is_string( $entry['option'] ) ) {
            $sections[ $entry['option'] ] = true;
        }
    }
    return array_keys( $sections );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS — 9 tests total.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepository.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "feat(settings): legacy repo cache invalidation on foreign writes"
```

---

## Task 5 — Writes (legacy persist + mirror to new flat option)

**Files:**
- Modify: `includes/Admin/Settings/Repository/LegacySettingsRepository.php`
- Modify: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

Write semantics (from the spec):
1. Compute diff against the overlay-applied view.
2. Persist `array_merge(raw, slice)` to the legacy section option.
3. Mirror mapped keys to `dokan_admin_settings` via `SettingsRepository::update()` — the bridge's existing `transform_legacy_payload_to_new()` does the legacy→new translation.
4. Mirror failures are caught + logged; legacy write is not rolled back.
5. Fire `dokan_legacy_settings_pre_save` filter and `dokan_legacy_settings_changed` action.

- [ ] **Step 1: Write the failing tests**

Append to `LegacySettingsRepositoryTest.php`:

```php
public function test_update_persists_to_legacy_section_option(): void {
    update_option( 'dokan_general', [ 'other' => 'preserved' ] );
    delete_option( 'dokan_admin_settings' );

    $repo    = new LegacySettingsRepository();
    $changed = $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

    $this->assertSame( [ 'custom_store_url' => 'shop' ], $changed );
    $this->assertSame(
        [ 'other' => 'preserved', 'custom_store_url' => 'shop' ],
        get_option( 'dokan_general' )
    );
}

public function test_update_mirrors_mapped_keys_to_new_flat_option(): void {
    delete_option( 'dokan_general' );
    delete_option( 'dokan_admin_settings' );

    $repo = new LegacySettingsRepository();
    $repo->update( 'dokan_general', [ 'custom_store_url' => 'marketplace' ] );

    $new = get_option( 'dokan_admin_settings' );
    $this->assertIsArray( $new );
    // Schema maps vendor_store_url → dokan_general.custom_store_url (SettingsSchema.php:153-165).
    $this->assertSame( 'marketplace', $new['vendor_store_url'] );
}

public function test_update_with_no_change_is_a_noop(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

    $repo = new LegacySettingsRepository();
    // Warm the snapshot first so $current matches the on-disk value.
    $repo->all( 'dokan_general' );

    $changed = $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
    $this->assertSame( [], $changed );
}

public function test_update_fires_pre_save_filter_and_changed_action(): void {
    delete_option( 'dokan_general' );
    delete_option( 'dokan_admin_settings' );

    $filter_received = null;
    $action_payload  = null;

    add_filter(
        'dokan_legacy_settings_pre_save',
        static function ( $slice, $section, $current ) use ( &$filter_received ) {
            $filter_received = [ 'slice' => $slice, 'section' => $section, 'current' => $current ];
            return $slice;
        },
        10,
        3
    );

    add_action(
        'dokan_legacy_settings_changed',
        static function ( $section, $changed, $before, $after ) use ( &$action_payload ) {
            $action_payload = compact( 'section', 'changed', 'before', 'after' );
        },
        10,
        4
    );

    $repo = new LegacySettingsRepository();
    $repo->update( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

    $this->assertSame( 'dokan_general', $filter_received['section'] );
    $this->assertSame( [ 'custom_store_url' => 'shop' ], $filter_received['slice'] );
    $this->assertSame( 'dokan_general', $action_payload['section'] );
    $this->assertSame( [ 'custom_store_url' => 'shop' ], $action_payload['changed'] );
}

public function test_pre_save_filter_can_mutate_slice(): void {
    delete_option( 'dokan_general' );

    add_filter(
        'dokan_legacy_settings_pre_save',
        static function ( $slice ) {
            $slice['custom_store_url'] = 'overridden';
            return $slice;
        }
    );

    $repo = new LegacySettingsRepository();
    $repo->update( 'dokan_general', [ 'custom_store_url' => 'original' ] );

    $this->assertSame( 'overridden', get_option( 'dokan_general' )['custom_store_url'] );
}

public function test_update_returns_only_changed_entries(): void {
    update_option( 'dokan_general', [
        'custom_store_url' => 'shop',
        'admin_access'     => 'on',
    ] );

    $repo = new LegacySettingsRepository();
    $repo->all( 'dokan_general' );

    $changed = $repo->update( 'dokan_general', [
        'custom_store_url' => 'shop',    // unchanged
        'admin_access'     => 'off',     // changed
    ] );

    $this->assertSame( [ 'admin_access' => 'off' ], $changed );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: FAIL — `update()` still returns `[]`.

- [ ] **Step 3: Implement `update()` and the diff helper**

Replace the stub `update()` in `LegacySettingsRepository.php` and add the private `diff()` helper at the bottom of the class:

```php
public function update( string $section, array $slice ): array {
    $current = $this->all( $section );

    /**
     * Filter the slice about to be merged into a legacy section option.
     *
     * Subscribers may add, remove, or normalize keys. Returning an empty
     * array effectively blocks the write (the diff becomes empty and
     * neither the legacy option nor the new-flat mirror is touched).
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed> $slice   Incoming change set.
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $current Overlay-applied view before the write.
     */
    $slice = (array) apply_filters( 'dokan_legacy_settings_pre_save', $slice, $section, $current );

    $changed = self::diff( $current, $slice );
    if ( empty( $changed ) ) {
        return [];
    }

    $raw    = get_option( $section, [] );
    $raw    = is_array( $raw ) ? $raw : [];
    $merged = array_merge( $raw, $slice );

    update_option( $section, $merged, true );
    // Refresh our snapshot now — the WP hook already flushed it, but we want
    // the next read in *this* request to skip a get_option round-trip.
    $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $merged );

    // Mirror mapped keys into the new flat option. Best-effort: a thrown
    // exception from the bridge or new repo is caught and logged so the
    // legacy write that already landed is not silently rolled back.
    try {
        $flat_slice = $this->bridge->transform_legacy_payload_to_new( $section, $slice );
        if ( ! empty( $flat_slice ) ) {
            $this->new_repo->update( $flat_slice );
        }
    } catch ( \Throwable $e ) {
        if ( function_exists( 'dokan_log' ) ) {
            dokan_log( '[LegacySettingsRepository] mirror write failed: ' . $e->getMessage() );
        }
    }

    /**
     * Fired after a successful write to a legacy section option.
     *
     * @since DOKAN_SINCE
     *
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $changed Added/changed entries.
     * @param array<string,mixed> $current Overlay-applied view before the write.
     * @param array<string,mixed> $merged  Raw section payload after the write.
     */
    do_action( 'dokan_legacy_settings_changed', $section, $changed, $current, $merged );

    return $changed;
}

/**
 * Strict-equality diff: returns added or modified entries only.
 *
 * @param array<string,mixed> $old
 * @param array<string,mixed> $new_payload
 *
 * @return array<string,mixed>
 */
private static function diff( array $old, array $new_payload ): array {
    $out = [];
    foreach ( $new_payload as $k => $v ) {
        if ( ! array_key_exists( $k, $old ) || $old[ $k ] !== $v ) {
            $out[ $k ] = $v;
        }
    }
    return $out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS — 15 tests total.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepository.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "feat(settings): legacy repo update() with legacy persist + new-flat mirror"
```

---

## Task 6 — `replace()` with deletion-aware diff

**Files:**
- Modify: `includes/Admin/Settings/Repository/LegacySettingsRepository.php`
- Modify: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

- [ ] **Step 1: Write the failing tests**

Append to `LegacySettingsRepositoryTest.php`:

```php
public function test_replace_writes_payload_whole(): void {
    update_option( 'dokan_general', [ 'a' => 1, 'b' => 2 ] );
    delete_option( 'dokan_admin_settings' );

    $repo = new LegacySettingsRepository();
    $repo->replace( 'dokan_general', [ 'c' => 3 ] );

    $this->assertSame( [ 'c' => 3 ], get_option( 'dokan_general' ) );
}

public function test_replace_returns_diff_with_removed_keys_as_null(): void {
    update_option( 'dokan_general', [ 'a' => 1, 'b' => 2 ] );

    $repo = new LegacySettingsRepository();
    $repo->all( 'dokan_general' );

    $diff = $repo->replace( 'dokan_general', [ 'a' => 1, 'c' => 3 ] );

    // `b` removed, `c` added, `a` unchanged.
    $this->assertArrayHasKey( 'b', $diff );
    $this->assertNull( $diff['b'] );
    $this->assertSame( 3, $diff['c'] );
    $this->assertArrayNotHasKey( 'a', $diff );
}

public function test_replace_mirrors_mapped_keys_to_new_option(): void {
    delete_option( 'dokan_general' );
    delete_option( 'dokan_admin_settings' );

    $repo = new LegacySettingsRepository();
    $repo->replace( 'dokan_general', [ 'custom_store_url' => 'marketplace' ] );

    $this->assertSame( 'marketplace', get_option( 'dokan_admin_settings' )['vendor_store_url'] );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: FAIL.

- [ ] **Step 3: Implement `replace()`**

Replace the stub `replace()` in `LegacySettingsRepository.php`:

```php
public function replace( string $section, array $payload ): array {
    $current = $this->all( $section );

    /** This filter is documented in includes/Admin/Settings/Repository/LegacySettingsRepository.php */
    $payload = (array) apply_filters( 'dokan_legacy_settings_pre_save', $payload, $section, $current );

    $diff = self::diff( $current, $payload );
    foreach ( $current as $k => $_ ) {
        if ( ! array_key_exists( $k, $payload ) ) {
            $diff[ $k ] = null;
        }
    }

    update_option( $section, $payload, true );
    $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $payload );

    try {
        $flat_slice = $this->bridge->transform_legacy_payload_to_new( $section, $payload );
        if ( ! empty( $flat_slice ) ) {
            $this->new_repo->update( $flat_slice );
        }
    } catch ( \Throwable $e ) {
        if ( function_exists( 'dokan_log' ) ) {
            dokan_log( '[LegacySettingsRepository] mirror replace failed: ' . $e->getMessage() );
        }
    }

    if ( ! empty( $diff ) ) {
        /** This action is documented in includes/Admin/Settings/Repository/LegacySettingsRepository.php */
        do_action( 'dokan_legacy_settings_changed', $section, $diff, $current, $payload );
    }

    return $diff;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS — 18 tests total.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Repository/LegacySettingsRepository.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "feat(settings): legacy repo replace() with deletion-aware diff"
```

---

## Task 7 — `dokan_get_option()` adapter

**Files:**
- Modify: `includes/functions.php` — function `dokan_get_option` at line 1066.

The adapter delegates to the repository when the container is available. The container-missing fallback path is preserved verbatim from today's behavior.

- [ ] **Step 1: Write a failing test**

Append to `LegacySettingsRepositoryTest.php`:

```php
public function test_dokan_get_option_reads_through_repository(): void {
    update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
    update_option( 'dokan_admin_settings', [ 'vendor_store_url' => 'marketplace' ] );

    // Flush repo cache so the next read sees the freshly-set options.
    dokan_get_container()
        ->get( LegacySettingsRepository::class )
        ->flush_cache( null );

    $this->assertSame( 'marketplace', dokan_get_option( 'custom_store_url', 'dokan_general' ) );
}
```

- [ ] **Step 2: Run test to verify it fails (or passes incidentally)**

Run: `npm run phpunit -- --filter=LegacySettingsRepositoryTest`
Expected: PASS today, because `dokan_get_option()` already applies the overlay manually. We want the same observable behavior *after* the refactor — this test acts as a regression guard.

- [ ] **Step 3: Refactor `dokan_get_option()` to delegate**

Open `includes/functions.php` and replace the function body at line 1066. Current implementation (lines 1066–1087) inlines the overlay logic. Replace with:

```php
function dokan_get_option( $option, $section, $default_value = '' ) {
    [ $option, $section ] = dokan_admin_settings_rearrange_map( $option, $section );

    if ( function_exists( 'dokan_get_container' ) ) {
        try {
            return dokan_get_container()
                ->get( \WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository::class )
                ->get( $section, $option, $default_value );
        } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
            // Container not booted — fall back to raw legacy read (no overlay).
        }
    }

    $options = get_option( $section );
    $options = is_array( $options ) ? $options : [];

    if ( isset( $options[ $option ] ) ) {
        return $options[ $option ];
    }

    return $default_value;
}
```

- [ ] **Step 4: Run the full settings test suite**

Run: `npm run phpunit -- --group=admin-settings`
Expected: PASS — the new repo test, the existing `DokanGetOptionReflectsNewSettingsTest`, `LegacySettingsBridgeTest`, etc. The existing tests prove the observable contract of `dokan_get_option()` is unchanged.

- [ ] **Step 5: Commit**

```bash
git add includes/functions.php \
        tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "refactor(settings): dokan_get_option() delegates to LegacySettingsRepository"
```

---

## Task 8 — Migrate direct `get_option('dokan_*')` callers

**Files:**
- Modify: `includes/functions.php` — lines 3227 (`$pages = get_option( 'dokan_pages' );`) and 3606 (`$dokan_appearance = get_option( 'dokan_appearance', [] );`).

These two direct reads bypass the overlay today (a pre-existing latent inconsistency). Routing them through the repository fixes that AND establishes the seam.

- [ ] **Step 1: Inspect the call sites**

Run: `grep -n "get_option( 'dokan_pages' )\|get_option( 'dokan_appearance'" includes/functions.php`
Expected: lines 3227 and 3606.

- [ ] **Step 2: Replace line 3227**

Open `includes/functions.php` line 3227. Replace:

```php
    $pages = get_option( 'dokan_pages' );
```

With:

```php
    $pages = dokan_get_container()
        ->get( \WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository::class )
        ->all( 'dokan_pages' );
```

- [ ] **Step 3: Replace line 3606**

Open `includes/functions.php` line 3606. Replace:

```php
    $dokan_appearance = get_option( 'dokan_appearance', [] );
```

With:

```php
    $dokan_appearance = dokan_get_container()
        ->get( \WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository::class )
        ->all( 'dokan_appearance' );
```

`all()` already coerces to array; the explicit `[]` default is no longer needed.

- [ ] **Step 4: Run the full PHPUnit suite**

Run: `npm run phpunit`
Expected: PASS — no regressions. (If `npm run phpunit` is too slow, narrow to `--group=admin-settings` plus any other groups the affected functions belong to.)

- [ ] **Step 5: Commit**

```bash
git add includes/functions.php
git commit -m "refactor(settings): direct get_option('dokan_*') reads go through LegacySettingsRepository"
```

---

## Task 9 — Audit & migrate any direct `update_option('dokan_*')` writes

**Files:**
- Modify: any file under `includes/` that calls `update_option( 'dokan_general' | 'dokan_selling' | 'dokan_appearance' | 'dokan_pages' | 'dokan_privacy' | 'dokan_withdraw' | ... )` outside the new repository class.

- [ ] **Step 1: List the direct writes**

Run: `grep -rn "update_option(\s*'dokan_" includes --include="*.php" | grep -v "Admin/Settings/Repository"`

Triage each match:

- If the file is part of the new-side flow (e.g. `LegacySettingsBridge::write_new_to_legacy`) and already lives behind a sanctioned surface — leave it.
- If it's an installer / migration / activation handler — leave it (these run once, outside the request cycle that needs the seam).
- Otherwise — migrate to `dokan_get_container()->get( LegacySettingsRepository::class )->update( $section, $slice )`.

- [ ] **Step 2: For each call site requiring migration, replace inline**

Pattern:

```php
update_option( 'dokan_general', $merged );
```

Becomes:

```php
dokan_get_container()
    ->get( \WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository::class )
    ->update( 'dokan_general', $slice );
```

Note: pass the *slice* (the keys you intend to change), not the pre-merged array — the repository handles the merge.

- [ ] **Step 3: If the audit finds no migration-eligible writes, skip the commit and proceed to Task 10**

The current grep at plan-write time found `LegacySettingsBridge::write_new_to_legacy` (sanctioned) and a couple of `_dokan_aff_ref` / `dokan_rewrite_rules_needs_flashing` (not settings options) — none required migration. Re-run the grep on a fresh checkout in case the surface has changed.

- [ ] **Step 4: Run the full PHPUnit suite**

Run: `npm run phpunit`
Expected: PASS.

- [ ] **Step 5: Commit (only if any files changed)**

```bash
git add -p   # review hunk-by-hunk
git commit -m "refactor(settings): direct update_option('dokan_*') writes go through LegacySettingsRepository"
```

---

## Task 10 — Integration smoke test

**Files:**
- Modify: `tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php`

- [ ] **Step 1: Write the integration test**

Append:

```php
public function test_integration_round_trip_through_container(): void {
    delete_option( 'dokan_general' );
    delete_option( 'dokan_admin_settings' );

    $repo = dokan_get_container()
        ->get( \WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository::class );

    $repo->update( 'dokan_general', [ 'custom_store_url' => 'marketplace' ] );

    // Legacy storage updated.
    $this->assertSame( 'marketplace', get_option( 'dokan_general' )['custom_store_url'] );
    // New flat storage updated via mirror.
    $this->assertSame( 'marketplace', get_option( 'dokan_admin_settings' )['vendor_store_url'] );
    // dokan_get_option() resolves through the repo and sees the overlay.
    $this->assertSame( 'marketplace', dokan_get_option( 'custom_store_url', 'dokan_general' ) );
}
```

- [ ] **Step 2: Run the test**

Run: `npm run phpunit -- --filter=test_integration_round_trip_through_container`
Expected: PASS.

- [ ] **Step 3: Run lint + full settings group**

Run:
```
composer phpcs -- includes/Admin/Settings/Repository
npm run phpunit -- --group=admin-settings
```
Expected: PASS on both.

- [ ] **Step 4: Commit**

```bash
git add tests/php/src/Admin/Settings/Repository/LegacySettingsRepositoryTest.php
git commit -m "test(settings): integration smoke test for LegacySettingsRepository"
```

---

## Self-Review Notes

**Spec coverage:**

| Spec section | Plan task(s) |
|---|---|
| Files (interface + class) | Tasks 1, 2 |
| Interface API | Task 1 |
| Read path + cache | Task 3 |
| Write path + mirror | Task 5 |
| `replace()` | Task 6 |
| Cache invalidation hooks | Task 4 |
| `known_sections()` from bridge mapping | Task 4 |
| `dokan_legacy_settings_pre_save` filter | Task 5 |
| `dokan_legacy_settings_changed` action | Tasks 5, 6 |
| DI wiring | Task 2 |
| `dokan_get_option()` adapter | Task 7 |
| Call-site migration (reads) | Task 8 |
| Call-site migration (writes) | Task 9 |
| Integration smoke test | Task 10 |
| Failure mode (bridge throws → log, no propagate) | Task 5 (try/catch) — explicit test deferred (would require a bridge double; existing `Throwable` swallow is exercised path-wise by the surrounding tests). |

**Plan-time spec adjustments (already noted to the user):**
- Spec mentions a new `map_legacy_section_to_new` method on the bridge; the bridge already has `transform_legacy_payload_to_new()` doing exactly that. Plan uses the existing method — no bridge changes.
- Spec says `known_sections()` derives from `SettingsSchema` group ids; the actual derivation is from `LegacySettingsBridge::get_mapping()` (unique `option` values) since legacy section names live in `legacy_key` strings, not schema group ids. Plan reflects this.

**Type consistency:** all method signatures referenced across Tasks 1–10 match the interface in Task 1. `transform_legacy_payload_to_new`, `hydrate_legacy_from_new`, `get_mapping` are existing public methods on `LegacySettingsBridge` (verified at `LegacySettingsBridge.php:134`, `:204`, and `LegacySettingsBridgeTest.php:44`).

**No placeholders.**
