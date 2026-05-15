# Legacy Settings Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `LegacySettingsBridge` so legacy AJAX saves propagate into `dokan_settings`, new-UI reads fall back to legacy options for unmigrated installs, and the legacy view reflects new-UI saves — without touching the new REST write path.

**Architecture:** A single PHP class in `includes/Admin/Settings/Migration/LegacySettingsBridge.php` that harvests a `legacy_key` attribute off the post-filter schema (plus a `dokan_legacy_settings_key_mapping` filter for irregular cases), exposes three direction-explicit methods (`transform_legacy_payload_to_new`, `hydrate_new_from_legacy`, `hydrate_legacy_from_new`), and is called from three places: `SettingsRegistry::populate_values` (new read), `includes/Admin/Settings.php::save_settings_value` (legacy save), and `dokan_get_option()` in `includes/functions.php` (legacy read).

**Tech Stack:** PHP 7.4+, WordPress hooks API, PHPUnit 9.6 + Brain Monkey, League Container DI, WPCS via PHPCS.

**Spec:** `docs/superpowers/specs/2026-05-15-legacy-settings-bridge-design.md`

**Design clarification vs. spec:** the spec named `SettingsRegistry` as the bridge's dependency. The concrete source of the post-filter schema is the static `SettingsSchema::get_schema()` call (registry's `populate_values` consumes it but registry itself doesn't expose it). To avoid a circular dependency once `SettingsRegistry` consumes the bridge, the bridge calls `SettingsSchema::get_schema()` directly. Behavior unchanged.

**Pre-existing orphan tests:** `tests/php/src/Admin/Settings/LegacyTransformerTest.php`, `SettingsMapperTest.php`, and `AdminSettingsBridgingTest.php` reference classes deleted in commit `8407bdb03`. Task 11 deletes them.

---

### Task 1: Skeleton class + container registration

**Files:**
- Create: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Modify: `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php`
- Create: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsBridgeTest extends DokanTestCase {

    public function test_class_exists_and_construct(): void {
        $bridge = new LegacySettingsBridge();
        $this->assertInstanceOf( LegacySettingsBridge::class, $bridge );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: FAIL — `Class "WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge" not found`.

- [ ] **Step 3: Write minimal class**

```php
<?php
namespace WeDevs\Dokan\Admin\Settings\Migration;

class LegacySettingsBridge {

    /**
     * Cached normalized mapping, lazily built per-request.
     *
     * @var array<string,array{option:string,field:string}>|null
     */
    private ?array $map = null;

    /**
     * Cached defaults index, built alongside the mapping.
     *
     * @var array<string,mixed>|null
     */
    private ?array $defaults = null;

    /**
     * Cached reverse index keyed by legacy option name.
     *
     * @var array<string,array<string,string>>|null
     */
    private ?array $by_option = null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: PASS.

- [ ] **Step 5: Register as shared service**

Modify `includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php`:

```php
<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSettingsServiceProvider extends BaseServiceProvider {
    protected $tags = [ 'admin-settings-service' ];

    protected $services = [
        SettingsRegistry::class,
        SchemaValidator::class,
        LegacySettingsBridge::class,
    ];

    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php \
        tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "feat(settings): scaffold LegacySettingsBridge + register service"
```

---

### Task 2: Map harvest from schema (`legacy_key` attribute)

**Files:**
- Modify: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

The bridge harvests via `apply_filters( 'dokan_get_admin_settings_schema', ... )` indirectly by calling `SettingsSchema::get_schema()`. Tests stub the filter to inject a fixture schema.

- [ ] **Step 1: Write the failing test**

Append to `LegacySettingsBridgeTest.php`:

```php
public function test_get_mapping_harvests_legacy_key_attribute(): void {
    $fixture = [
        [
            'id'         => 'banner_width',
            'type'       => 'field',
            'default'    => 400,
            'legacy_key' => 'dokan_appearance.store_banner_width',
        ],
        [
            'id'      => 'no_legacy_field',
            'type'    => 'field',
            'default' => '',
        ],
        [
            'id'   => 'not_a_field',
            'type' => 'section',
        ],
    ];

    $cb = static function () use ( $fixture ) { return $fixture; };
    add_filter( 'dokan_get_admin_settings_schema', $cb );

    $bridge = new LegacySettingsBridge();
    $map    = $bridge->get_mapping();

    remove_filter( 'dokan_get_admin_settings_schema', $cb );

    $this->assertArrayHasKey( 'banner_width', $map );
    $this->assertSame(
        [ 'option' => 'dokan_appearance', 'field' => 'store_banner_width' ],
        $map['banner_width']
    );
    $this->assertArrayNotHasKey( 'no_legacy_field', $map );
    $this->assertArrayNotHasKey( 'not_a_field', $map );
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run phpunit -- --filter test_get_mapping_harvests_legacy_key_attribute`
Expected: FAIL — `Call to undefined method ... get_mapping`.

- [ ] **Step 3: Implement `get_mapping` + private helpers**

Add to `LegacySettingsBridge`:

```php
use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;

public function get_mapping(): array {
    return $this->build_map();
}

private function build_map(): array {
    if ( $this->map !== null ) {
        return $this->map;
    }

    [ $map, $defaults ] = $this->harvest_from_schema();
    $map = apply_filters( 'dokan_legacy_settings_key_mapping', $map );
    [ $this->map, $this->by_option ] = $this->normalize( $map );
    $this->defaults = $defaults;

    return $this->map;
}

private function harvest_from_schema(): array {
    $map      = [];
    $defaults = [];
    foreach ( SettingsSchema::get_schema() as $element ) {
        if ( ( $element['type'] ?? '' ) !== 'field' ) {
            continue;
        }
        $id = $element['id'] ?? '';
        if ( '' === $id ) {
            continue;
        }
        $defaults[ $id ] = $element['default'] ?? null;

        $legacy = $element['legacy_key'] ?? null;
        if ( null === $legacy || '' === $legacy ) {
            continue;
        }
        $map[ $id ] = $legacy;
    }
    return [ $map, $defaults ];
}

private function normalize( array $map ): array {
    $normalized = [];
    $by_option  = [];

    foreach ( $map as $new_key => $address ) {
        $struct = $this->parse_address( $address );
        if ( null === $struct ) {
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( sprintf( '[LegacySettingsBridge] dropping malformed legacy_key for "%s"', $new_key ) );
            }
            continue;
        }
        $normalized[ $new_key ]                              = $struct;
        $by_option[ $struct['option'] ][ $new_key ]          = $struct['field'];
    }

    return [ $normalized, $by_option ];
}

/**
 * @param string|array $address
 * @return array{option:string,field:string}|null
 */
private function parse_address( $address ): ?array {
    if ( is_array( $address ) && isset( $address['option'], $address['field'] ) ) {
        $option = (string) $address['option'];
        $field  = (string) $address['field'];
        return ( '' !== $option && '' !== $field ) ? [ 'option' => $option, 'field' => $field ] : null;
    }
    if ( is_string( $address ) && strpos( $address, '.' ) !== false ) {
        [ $option, $field ] = explode( '.', $address, 2 );
        return ( '' !== $option && '' !== $field ) ? [ 'option' => $option, 'field' => $field ] : null;
    }
    return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run phpunit -- --filter test_get_mapping_harvests_legacy_key_attribute`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "feat(settings): harvest legacy_key attribute from schema"
```

---

### Task 3: Filter extension point + malformed entries dropped

**Files:**
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`
- (no impl change — covered by Task 2; this task verifies behavior)

- [ ] **Step 1: Write the failing tests**

```php
public function test_dokan_legacy_settings_key_mapping_filter_adds_entries(): void {
    add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );
    $cb = static function ( array $map ): array {
        $map['extra_addon_field'] = 'dokan_some_addon.extra';
        return $map;
    };
    add_filter( 'dokan_legacy_settings_key_mapping', $cb );

    $bridge = new LegacySettingsBridge();
    $map    = $bridge->get_mapping();

    remove_filter( 'dokan_legacy_settings_key_mapping', $cb );
    remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

    $this->assertSame(
        [ 'option' => 'dokan_some_addon', 'field' => 'extra' ],
        $map['extra_addon_field']
    );
}

public function test_malformed_legacy_key_is_dropped(): void {
    $fixture = [
        [ 'id' => 'good', 'type' => 'field', 'legacy_key' => 'dokan_general.foo' ],
        [ 'id' => 'no_dot', 'type' => 'field', 'legacy_key' => 'just_a_word' ],
        [ 'id' => 'empty_option', 'type' => 'field', 'legacy_key' => '.bar' ],
        [ 'id' => 'empty_field', 'type' => 'field', 'legacy_key' => 'dokan_general.' ],
    ];
    $cb = static function () use ( $fixture ) { return $fixture; };
    add_filter( 'dokan_get_admin_settings_schema', $cb );

    $bridge = new LegacySettingsBridge();
    $map    = $bridge->get_mapping();

    remove_filter( 'dokan_get_admin_settings_schema', $cb );

    $this->assertSame( [ 'good' ], array_keys( $map ) );
}
```

- [ ] **Step 2: Run tests**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: PASS (impl from Task 2 already supports this).

- [ ] **Step 3: Commit**

```bash
git add tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "test(settings): cover legacy mapping filter + malformed-entry drop"
```

---

### Task 4: `transform_legacy_payload_to_new`

**Files:**
- Modify: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

- [ ] **Step 1: Write the failing tests**

```php
public function test_transform_legacy_payload_to_new_returns_mapped_slice(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        [ 'id' => 'unrelated',    'type' => 'field', 'legacy_key' => 'dokan_general.unrelated_field',       'default' => '' ],
    ];
    $cb = static function () use ( $fixture ) { return $fixture; };
    add_filter( 'dokan_get_admin_settings_schema', $cb );

    $bridge = new LegacySettingsBridge();
    $slice  = $bridge->transform_legacy_payload_to_new(
        'dokan_appearance',
        [ 'store_banner_width' => 800, 'untracked' => 'ignored' ]
    );

    remove_filter( 'dokan_get_admin_settings_schema', $cb );

    $this->assertSame( [ 'banner_width' => 800 ], $slice );
}

public function test_transform_preserves_explicit_null_and_false(): void {
    $fixture = [
        [ 'id' => 'enable_x', 'type' => 'field', 'legacy_key' => 'dokan_general.enable_x', 'default' => false ],
        [ 'id' => 'note_x',   'type' => 'field', 'legacy_key' => 'dokan_general.note_x',   'default' => '' ],
    ];
    $cb = static function () use ( $fixture ) { return $fixture; };
    add_filter( 'dokan_get_admin_settings_schema', $cb );

    $bridge = new LegacySettingsBridge();
    $slice  = $bridge->transform_legacy_payload_to_new(
        'dokan_general',
        [ 'enable_x' => false, 'note_x' => null ]
    );

    remove_filter( 'dokan_get_admin_settings_schema', $cb );

    $this->assertSame( [ 'enable_x' => false, 'note_x' => null ], $slice );
}

public function test_transform_returns_empty_for_unmapped_option(): void {
    add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

    $bridge = new LegacySettingsBridge();
    $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_unknown', [ 'x' => 1 ] );

    remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

    $this->assertSame( [], $slice );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: FAIL — `Call to undefined method ... transform_legacy_payload_to_new`.

- [ ] **Step 3: Implement the method**

Add to `LegacySettingsBridge`:

```php
public function transform_legacy_payload_to_new( string $option_name, array $legacy_payload ): array {
    $this->build_map();
    $slice = [];
    $pairs = $this->by_option[ $option_name ] ?? [];
    foreach ( $pairs as $new_key => $old_field ) {
        if ( array_key_exists( $old_field, $legacy_payload ) ) {
            $slice[ $new_key ] = $legacy_payload[ $old_field ];
        }
    }
    return $slice;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "feat(settings): transform_legacy_payload_to_new"
```

---

### Task 5: `hydrate_new_from_legacy` with batched reads + default fallback

**Files:**
- Modify: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

- [ ] **Step 1: Write the failing tests**

```php
public function test_hydrate_new_does_not_overwrite_existing_new_values(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
    ];
    add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
    update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

    $bridge   = new LegacySettingsBridge();
    $hydrated = $bridge->hydrate_new_from_legacy( [ 'banner_width' => 200 ] );

    remove_all_filters( 'dokan_get_admin_settings_schema' );
    delete_option( 'dokan_appearance' );

    $this->assertSame( 200, $hydrated['banner_width'] );
}

public function test_hydrate_new_adopts_legacy_when_new_missing(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
    ];
    add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
    update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

    $bridge   = new LegacySettingsBridge();
    $hydrated = $bridge->hydrate_new_from_legacy( [] );

    remove_all_filters( 'dokan_get_admin_settings_schema' );
    delete_option( 'dokan_appearance' );

    $this->assertSame( 999, $hydrated['banner_width'] );
}

public function test_hydrate_new_falls_back_to_schema_default(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
    ];
    add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
    delete_option( 'dokan_appearance' );

    $bridge   = new LegacySettingsBridge();
    $hydrated = $bridge->hydrate_new_from_legacy( [] );

    remove_all_filters( 'dokan_get_admin_settings_schema' );

    $this->assertSame( 400, $hydrated['banner_width'] );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: FAIL — `Call to undefined method ... hydrate_new_from_legacy`.

- [ ] **Step 3: Implement the method**

Add to `LegacySettingsBridge`:

```php
public function hydrate_new_from_legacy( array $new_option ): array {
    $this->build_map();

    $missing_by_option = [];
    foreach ( $this->map as $new_key => $address ) {
        if ( array_key_exists( $new_key, $new_option ) ) {
            continue;
        }
        $missing_by_option[ $address['option'] ][ $new_key ] = $address['field'];
    }

    foreach ( $missing_by_option as $option_name => $pairs ) {
        $legacy = get_option( $option_name, [] );
        if ( ! is_array( $legacy ) ) {
            $legacy = [];
        }
        foreach ( $pairs as $new_key => $old_field ) {
            $new_option[ $new_key ] = array_key_exists( $old_field, $legacy )
                ? $legacy[ $old_field ]
                : $this->get_schema_default( $new_key );
        }
    }

    return $new_option;
}

private function get_schema_default( string $new_key ) {
    return $this->defaults[ $new_key ] ?? null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "feat(settings): hydrate_new_from_legacy with batched reads"
```

---

### Task 6: `hydrate_legacy_from_new` (asymmetric — overwrites legacy)

**Files:**
- Modify: `includes/Admin/Settings/Migration/LegacySettingsBridge.php`
- Modify: `tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php`

- [ ] **Step 1: Write the failing tests**

```php
public function test_hydrate_legacy_from_new_overwrites_when_new_has_value(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
    ];
    add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
    update_option( 'dokan_settings', [ 'banner_width' => 1024 ] );

    $bridge = new LegacySettingsBridge();
    $merged = $bridge->hydrate_legacy_from_new( 'dokan_appearance', [ 'store_banner_width' => 200 ] );

    remove_all_filters( 'dokan_get_admin_settings_schema' );
    delete_option( 'dokan_settings' );

    $this->assertSame( 1024, $merged['store_banner_width'] );
}

public function test_hydrate_legacy_from_new_leaves_legacy_when_new_absent(): void {
    $fixture = [
        [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
    ];
    add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
    delete_option( 'dokan_settings' );

    $bridge = new LegacySettingsBridge();
    $merged = $bridge->hydrate_legacy_from_new( 'dokan_appearance', [ 'store_banner_width' => 200 ] );

    remove_all_filters( 'dokan_get_admin_settings_schema' );

    $this->assertSame( 200, $merged['store_banner_width'] );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: FAIL — `Call to undefined method ... hydrate_legacy_from_new`.

- [ ] **Step 3: Implement the method**

Add to `LegacySettingsBridge`:

```php
public function hydrate_legacy_from_new( string $option_name, array $legacy_option ): array {
    $this->build_map();
    $new_option = get_option( 'dokan_settings', [] );
    if ( ! is_array( $new_option ) ) {
        $new_option = [];
    }
    $pairs = $this->by_option[ $option_name ] ?? [];
    foreach ( $pairs as $new_key => $old_field ) {
        if ( array_key_exists( $new_key, $new_option ) ) {
            $legacy_option[ $old_field ] = $new_option[ $new_key ];
        }
    }
    return $legacy_option;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run phpunit -- --filter LegacySettingsBridgeTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Migration/LegacySettingsBridge.php \
        tests/php/src/Admin/Settings/Migration/LegacySettingsBridgeTest.php
git commit -m "feat(settings): hydrate_legacy_from_new"
```

---

### Task 7: Wire bridge into new read path (`SettingsRegistry::populate_values`)

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsRegistry.php`
- Create: `tests/php/src/Admin/Settings/Schema/SettingsRegistryLegacyFallbackTest.php`

The bridge runs once per request: read `dokan_settings`, hand it to the bridge, use the hydrated array as the lookup source. Existing default fallback in `populate_values` becomes redundant for mapped fields but remains correct for unmapped fields.

- [ ] **Step 1: Write the failing test**

Create `tests/php/src/Admin/Settings/Schema/SettingsRegistryLegacyFallbackTest.php`:

```php
<?php
namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class SettingsRegistryLegacyFallbackTest extends DokanTestCase {

    public function test_registry_hydrates_missing_value_from_legacy_option(): void {
        $fixture = [
            [
                'id'         => 'banner_width',
                'type'       => 'field',
                'section_id' => 'appearance',
                'default'    => 400,
                'legacy_key' => 'dokan_appearance.store_banner_width',
            ],
        ];
        add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 777 ] );
        delete_option( 'dokan_settings' );

        $registry = new SettingsRegistry( new SchemaValidator(), new LegacySettingsBridge() );
        $schema   = $registry->get_schema();

        remove_all_filters( 'dokan_get_admin_settings_schema' );
        delete_option( 'dokan_appearance' );

        $field = null;
        foreach ( $schema as $element ) {
            if ( ( $element['id'] ?? '' ) === 'banner_width' ) {
                $field = $element;
                break;
            }
        }
        $this->assertNotNull( $field );
        $this->assertSame( 777, $field['value'] );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run phpunit -- --filter SettingsRegistryLegacyFallbackTest`
Expected: FAIL — registry constructor signature mismatch (no bridge param), OR field value comes back as `400` (default) instead of `777`.

- [ ] **Step 3: Modify `SettingsRegistry` constructor + `populate_values`**

Open `includes/Admin/Settings/Schema/SettingsRegistry.php`. At the top of the file add:

```php
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
```

Find the constructor (will be near the top of the class — accepts `SchemaValidator`). Change it to accept the bridge:

```php
private SchemaValidator $validator;
private LegacySettingsBridge $bridge;

public function __construct( SchemaValidator $validator, LegacySettingsBridge $bridge ) {
    $this->validator = $validator;
    $this->bridge    = $bridge;
}
```

In `populate_values()` (currently starting at line 297), replace the `$stored = get_option( 'dokan_settings', [] );` block so the bridge hydrates first:

```php
private function populate_values( array $elements ): array {
    $stored = get_option( 'dokan_settings', [] );
    if ( ! is_array( $stored ) ) {
        $stored = [];
    }
    $stored = $this->bridge->hydrate_new_from_legacy( $stored );

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

- [ ] **Step 4: Verify container resolves the new constructor arg**

`AdminSettingsServiceProvider::register()` already calls `share_with_implements_tags`, which auto-resolves constructor args from the container — no change needed because `LegacySettingsBridge` is registered (Task 1). If the container fails to resolve, surface the error here rather than working around it.

- [ ] **Step 5: Run the new test + existing registry tests**

Run: `npm run phpunit -- --filter "SettingsRegistry"`
Expected: All PASS, including the new fallback test.

- [ ] **Step 6: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsRegistry.php \
        tests/php/src/Admin/Settings/Schema/SettingsRegistryLegacyFallbackTest.php
git commit -m "feat(settings): registry hydrates missing values via LegacySettingsBridge"
```

---

### Task 8: Wire bridge into legacy AJAX save (`save_settings_value`)

**Files:**
- Modify: `includes/Admin/Settings.php`

The legacy AJAX handler at line 150 already calls `update_option( $option_name, $option_value )`. We add a follow-up: transform the sanitized payload via the bridge and merge into `dokan_settings`.

- [ ] **Step 1: Read current `save_settings_value` end-to-end**

Re-read lines 150–210 of `includes/Admin/Settings.php` to confirm the structure (the action hook order, response shape).

- [ ] **Step 2: Add bridge call after the legacy `update_option`**

Insert the following immediately after line 178 (`update_option( $option_name, $option_value );`) and before the `do_action( 'dokan_after_saving_settings', ... )` call:

```php
// Propagate to the new flat option so toggling back to the new UI reflects this save.
$bridge      = dokan_get_container()->get( \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge::class );
$new_slice   = $bridge->transform_legacy_payload_to_new( $option_name, $option_value );
if ( ! empty( $new_slice ) ) {
    $existing_new = get_option( 'dokan_settings', [] );
    if ( ! is_array( $existing_new ) ) {
        $existing_new = [];
    }
    update_option( 'dokan_settings', array_merge( $existing_new, $new_slice ), true );
}
```

`dokan_get_container()` is the standard accessor used elsewhere in the codebase. If the file does not already import `WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge`, the fully-qualified inline reference avoids touching the top-of-file use list.

- [ ] **Step 3: Add an integration test**

Create `tests/php/src/Admin/Settings/LegacyAjaxBridgePropagationTest.php`:

```php
<?php
namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacyAjaxBridgePropagationTest extends DokanTestCase {

    public function test_legacy_save_propagates_to_new_option_via_bridge(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );

        $bridge      = new LegacySettingsBridge();
        $slice       = $bridge->transform_legacy_payload_to_new(
            'dokan_appearance',
            [ 'store_banner_width' => 555 ]
        );
        $existing    = get_option( 'dokan_settings', [] );
        update_option( 'dokan_settings', array_merge( is_array( $existing ) ? $existing : [], $slice ), true );

        remove_all_filters( 'dokan_get_admin_settings_schema' );
        $stored = get_option( 'dokan_settings', [] );
        delete_option( 'dokan_settings' );

        $this->assertSame( 555, $stored['banner_width'] );
    }
}
```

(This test reproduces the controller's merge logic against the same bridge instance — it does not run the full AJAX request; that's exercised by the existing Playwright suite.)

- [ ] **Step 4: Run tests**

Run: `npm run phpunit -- --filter "LegacyAjaxBridgePropagation"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings.php \
        tests/php/src/Admin/Settings/LegacyAjaxBridgePropagationTest.php
git commit -m "feat(settings): legacy AJAX save propagates to dokan_settings via bridge"
```

---

### Task 9: Wire bridge into legacy read helper (`dokan_get_option`)

**Files:**
- Modify: `includes/functions.php`

`dokan_get_option()` at line 1066 reads the legacy per-page option. With write-through working (Task 8), legacy values stay current with legacy saves but **don't** reflect new-UI saves. This task makes legacy reads pull from `dokan_settings` when present.

- [ ] **Step 1: Write the failing test**

Create `tests/php/src/Admin/Settings/Migration/DokanGetOptionReflectsNewSettingsTest.php`:

```php
<?php
namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class DokanGetOptionReflectsNewSettingsTest extends DokanTestCase {

    public function test_dokan_get_option_returns_value_from_new_settings_when_mapped(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        add_filter( 'dokan_get_admin_settings_schema', static function () use ( $fixture ) { return $fixture; } );
        update_option( 'dokan_settings', [ 'banner_width' => 1280 ] );
        delete_option( 'dokan_appearance' );

        $value = dokan_get_option( 'store_banner_width', 'dokan_appearance', 'unused' );

        remove_all_filters( 'dokan_get_admin_settings_schema' );
        delete_option( 'dokan_settings' );

        $this->assertSame( 1280, $value );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run phpunit -- --filter DokanGetOptionReflectsNewSettings`
Expected: FAIL — returns `'unused'` (no new-settings fallback yet).

- [ ] **Step 3: Update `dokan_get_option()`**

In `includes/functions.php`, replace the function (currently lines 1066–1076) with:

```php
function dokan_get_option( $option, $section, $default_value = '' ) {
    [ $option, $section ] = dokan_admin_settings_rearrange_map( $option, $section );

    $options = get_option( $section );
    $options = is_array( $options ) ? $options : [];

    if ( function_exists( 'dokan_get_container' ) ) {
        try {
            $bridge  = dokan_get_container()->get( \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge::class );
            $options = $bridge->hydrate_legacy_from_new( $section, $options );
        } catch ( \Throwable $e ) {
            // Container not booted (very early in load) — fall back to raw legacy read.
        }
    }

    if ( isset( $options[ $option ] ) ) {
        return $options[ $option ];
    }

    return $default_value;
}
```

The `try/catch` guards against `dokan_get_option()` being called before the container is fully booted (some bootstrap paths invoke it during plugin load). The fallback is the original behavior.

- [ ] **Step 4: Run tests**

Run: `npm run phpunit -- --filter DokanGetOptionReflectsNewSettings`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/functions.php \
        tests/php/src/Admin/Settings/Migration/DokanGetOptionReflectsNewSettingsTest.php
git commit -m "feat(settings): dokan_get_option reflects new dokan_settings via bridge"
```

---

### Task 10: Pilot — add `legacy_key` to one field, end-to-end smoke

**Files:**
- Modify: `includes/Admin/Settings/Schema/SettingsSchema.php`

Pick a single low-risk field and add its `legacy_key` attribute so the wiring is exercised by the real schema, not just fixtures.

- [ ] **Step 1: Identify the pilot field**

Open `includes/Admin/Settings/Schema/SettingsSchema.php`. Locate a field on the appearance page that already exists in legacy storage. Confirm by checking `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` for the matching legacy `dokan_appearance` key.

For the example below, assume the field id is `store_banner_width` (rename to the actual id from the schema). Confirm the legacy key by searching for it in the trace report.

- [ ] **Step 2: Add the attribute**

In the relevant page helper (e.g., `appearance_page()`), find the field declaration and add:

```php
'legacy_key' => 'dokan_appearance.store_banner_width',
```

- [ ] **Step 3: Run PHPCS + the full settings test group**

```bash
composer phpcs -- includes/Admin/Settings/Schema/SettingsSchema.php
npm run phpunit -- --group admin-settings
```

Expected: PHPCS clean, all admin-settings tests PASS.

- [ ] **Step 4: Manual smoke test**

```bash
npm run env:start
npm run build
```

Then in a browser:
1. Open the new settings UI → confirm the pilot field renders with whatever value `dokan_appearance.store_banner_width` holds (or default if absent).
2. Toggle to legacy view → confirm the same value shows.
3. Change in legacy view → save → toggle to new UI → confirm new value appears.
4. Change in new UI → save → toggle to legacy → confirm new value appears.

- [ ] **Step 5: Commit**

```bash
git add includes/Admin/Settings/Schema/SettingsSchema.php
git commit -m "feat(settings): add legacy_key on pilot field (store_banner_width)"
```

---

### Task 11: Delete orphan test files referencing removed classes

**Files:**
- Delete: `tests/php/src/Admin/Settings/AdminSettingsBridgingTest.php`
- Delete: `tests/php/src/Admin/Settings/LegacyTransformerTest.php`
- Delete: `tests/php/src/Admin/Settings/SettingsMapperTest.php`

These reference `WeDevs\Dokan\Admin\Settings\LegacyTransformer`, `SettingsMapper`, and a `Settings` namespace that were deleted in commit `8407bdb03`. They cannot run.

- [ ] **Step 1: Verify the referenced classes are gone**

Run: `find includes -name "LegacyTransformer.php" -o -name "SettingsMapper.php"`
Expected: empty output.

- [ ] **Step 2: Delete the orphan tests**

```bash
git rm tests/php/src/Admin/Settings/AdminSettingsBridgingTest.php \
       tests/php/src/Admin/Settings/LegacyTransformerTest.php \
       tests/php/src/Admin/Settings/SettingsMapperTest.php
```

- [ ] **Step 3: Run full admin-settings test group**

Run: `npm run phpunit -- --group admin-settings`
Expected: all remaining tests PASS, no "class not found" errors.

- [ ] **Step 4: Commit**

```bash
git commit -m "test(settings): drop orphan tests for classes removed in 8407bdb03"
```

---

### Task 12: PHPCS pass + final test sweep

- [ ] **Step 1: Run PHPCS on every touched PHP file**

```bash
composer phpcs -- \
  includes/Admin/Settings/Migration/LegacySettingsBridge.php \
  includes/Admin/Settings/Schema/SettingsRegistry.php \
  includes/Admin/Settings/Schema/SettingsSchema.php \
  includes/Admin/Settings.php \
  includes/functions.php \
  includes/DependencyManagement/Providers/AdminSettingsServiceProvider.php
```

Expected: clean. If any violations, run `composer phpcbf -- <file>` and re-run.

- [ ] **Step 2: Run the full PHPUnit suite**

```bash
npm run phpunit
```

Expected: PASS (no regressions outside admin-settings).

- [ ] **Step 3: Commit any PHPCBF auto-fixes (if any)**

```bash
git add -A
git diff --cached --quiet || git commit -m "style(settings): PHPCS fixes from PHPCBF"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Class name + file path | Task 1 |
| Container binding (shared) | Task 1 |
| Per-field `legacy_key` harvest | Task 2 |
| Dotted-string + struct address forms | Task 2 (`parse_address`) |
| `dokan_legacy_settings_key_mapping` filter | Task 3 |
| Malformed entries dropped + logged | Tasks 2 (impl) + 3 (test) |
| Defaults index | Tasks 2 + 5 |
| `transform_legacy_payload_to_new` + `array_key_exists` semantics | Task 4 |
| `hydrate_new_from_legacy` + batched reads | Task 5 |
| `hydrate_legacy_from_new` (overwrites) | Task 6 |
| `get_mapping` introspection | Task 2 |
| New REST GET call site | Task 7 |
| Legacy AJAX save call site | Task 8 |
| Legacy read helper call site | Task 9 |
| New REST PUT — bridge NOT involved | Task 7 step 3 confirms; no PUT touched |
| Failure-mode tolerance (typo'd option, broken mapping) | Tasks 5/9 (graceful default fallback, container-boot guard) |
| Testing coverage matrix | Tasks 2/3/4/5/6/9 |

**Placeholder scan:** none — every step has concrete code or a concrete command.

**Type/name consistency:** `LegacySettingsBridge` (class), `build_map`/`harvest_from_schema`/`normalize`/`parse_address` (privates), `transform_legacy_payload_to_new`/`hydrate_new_from_legacy`/`hydrate_legacy_from_new`/`get_mapping` (publics) used consistently across all tasks. Map struct shape (`['option' => …, 'field' => …]`) consistent. Defaults index keyed by field id consistent.

**Open question for execution:** Task 10 names `store_banner_width` as the pilot field. If that field doesn't exist under that id in the current `SettingsSchema`, the executor should pick the closest equivalent (consult the trace report) and update the task's `legacy_key` value accordingly. This is a known unknown at planning time, not a placeholder — it's a deliberate executor decision because the schema is mid-flux on this branch.
