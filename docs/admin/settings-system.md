# Dokan Admin Settings System

This document explains how the new Admin Settings system works, how to create pages, sub‑pages, sections, and fields, how to extend it from third‑party plugins, and how the legacy↔new conversion layer keeps backward compatibility.

## Table of Contents
- [Overview](#overview)
- [Concepts and storage](#concepts-and-storage)
  - [Elements](#elements)
  - [Storage](#storage)
  - [Paths (dot notation)](#paths-dot-notation)
- [Reading and writing values](#reading-and-writing-values)
  - [Programmatic read (per page)](#programmatic-read-per-page)
  - [Programmatic write (multi-page)](#programmatic-write-multi-page)
- [Creating a new Page](#creating-a-new-page)
- [Registering your page](#registering-your-page)
  - [A) Service Provider (preferred in Dokan core)](#a-service-provider-preferred-in-dokan-core)
  - [B) Pages filter](#b-pages-filter)
- [Extending or integrating from a third‑party plugin](#extending-or-integrating-from-a-thirdparty-plugin)
- [Legacy ↔ New conversion layer (mapper + transformer)](#legacy-↔-new-conversion-layer-mapper--transformer)
  - [Adding mappings (third‑party)](#adding-mappings-thirdparty)
- [Populating new storage from legacy values (one‑time fallback)](#populating-new-storage-from-legacy-values-one-time-fallback)
- [Reference](#reference)
  - [Classes](#classes)
  - [Filters](#filters)
  - [Actions](#actions)
- [Tips](#tips)

## Overview
The Admin Settings system is a structured, extensible configuration framework for Dokan. It models settings as a hierarchy:

Page → Sub Page → Section → Field

Each element is an object (SettingsElement) that can render a schema for the admin UI and store values in WordPress options (or user meta, if desired). The new system ships with a compatibility bridge so the previous settings endpoints keep working while the system stores and reads from the new data source.

## Concepts and storage

### Elements
- Page: A top‑level settings page (for example: general, appearance, product). Implements Pages\AbstractPage (extends Abstracts\Settings).
- Sub Page: A grouping under a page to organize sections (created via ElementFactory::sub_page()).
- Section: Groups related fields (ElementFactory::section()).
- Field: The actual setting input (ElementFactory::field() and other specialized builders like field_group, customize_radio, etc.).

### Storage
- By default, each page persists to a dedicated wp_option key: dokan_settings_{pageId}.
- Internals accept both wrapped and unwrapped shapes. For example, GeneralPage (id "general") can read:
  - Wrapped: get_option('dokan_settings_general') returns [ 'general' => [ ...page values... ] ]
  - Unwrapped: get_option('dokan_settings_general') returns just [ ...page values... ]
  The page automatically unwraps when needed via Abstracts\Settings::get_data().

### Paths (dot notation)
- Values are nested and can be accessed with dot paths, for example: general.marketplace.marketplace_settings.vendor_store_url

## Reading and writing values

### Programmatic read (per page)
Each page class extends Abstracts\Settings and inherits a static get_option($dotPath, $default) helper, targeted at that page’s storage.

Example (for GeneralPage):

```php
$value = \WeDevs\Dokan\Admin\Settings\Pages\GeneralPage::get_option(
    'marketplace.marketplace_settings.vendor_store_url',
    'store'
);
```

### Programmatic write (multi-page)
Use the Admin Settings manager to save a batch of values across pages. Partial updates are supported: provide only the subtree you want to modify; validation and sanitize routines apply only to the fields present in your payload.

```php
$data = [
    'general' => [
        'marketplace' => [
            'marketplace_settings' => [
                'vendor_store_url' => 'store',
            ],
        ],
    ],
];

dokan_get_container()
    ->get(\WeDevs\Dokan\Admin\Settings\Settings::class)
    ->save($data);
```

## Creating a new Page
Create a class extending `WeDevs\Dokan\Admin\Settings\Pages\AbstractPage`. Implement:
- `protected $id = 'your_page_id';`
- `protected $storage_key = 'dokan_settings_your_page_id';`
- `register()`, `scripts()`, `styles()`, `settings()` as needed (may return empty arrays if unused).
- `describe_settings()`: build your sub‑pages, sections, and fields with `ElementFactory`.

Example skeleton:

```php
<?php
namespace MyVendor\MyPlugin;

use WeDevs\Dokan\Admin\Settings\Pages\AbstractPage;
use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class MyCustomPage extends AbstractPage {
    protected $id = 'my_custom';
    protected int $priority = 250; // controls sort order in UI
    protected $storage_key = 'dokan_settings_my_custom';

    public function register() {}
    public function scripts(): array { return []; }
    public function styles(): array { return []; }
    public function settings(): array { return []; }

    public function describe_settings(): void {
        $this
            ->set_title(__('My Custom', 'my-textdomain'))
            ->set_description(__('Custom settings page example.', 'my-textdomain'))
            ->add(
                ElementFactory::sub_page('general')
                    ->set_title(__('General', 'my-textdomain'))
                    ->set_description(__('General configurations.', 'my-textdomain'))
                    ->add(
                        ElementFactory::section('main')
                            ->add(
                                ElementFactory::field('enabled', 'switch')
                                    ->set_title(__('Enable feature', 'my-textdomain'))
                                    ->set_enable_state(__('Enabled', 'my-textdomain'), 'on')
                                    ->set_disable_state(__('Disabled', 'my-textdomain'), 'off')
                                    ->set_default('off')
                            )
                            ->add(
                                ElementFactory::field('title', 'text')
                                    ->set_title(__('Title', 'my-textdomain'))
                                    ->set_placeholder(__('Enter title...', 'my-textdomain'))
                            )
                    )
            );
    }
}
```

## Registering your page
There are two common ways to make your page available to the system.

### A) Service Provider (preferred in Dokan core)
Dokan registers default pages via `WeDevs\Dokan\DependencyManagement\Providers\AdminSettingsServiceProvider`.

Third parties can hook the list before registration:

```php
add_filter('dokan_admin_settings_services', function(array $services) {
    $services[] = \MyVendor\MyPlugin\MyCustomPage::class;
    return $services;
});
```

### B) Pages filter
Provide a ready instance via the pages filter:

```php
add_filter('dokan_admin_settings_pages', function(array $pages) {
    $pages[] = dokan_get_container()->get(\MyVendor\MyPlugin\MyCustomPage::class);
    return $pages;
});
```

## Extending or integrating from a third‑party plugin
- Add a brand new page: Use either approach above.
- Add a sub‑page/section/fields to your own page: do it in your page’s `describe_settings()` with `ElementFactory`.
- Modify existing pages from the outside: Prefer adding your own page to keep responsibilities clear. If you must alter data on an existing page, you may use populate filters (see below) to filter a page’s populated schema. Note that UI builders reflect the populated schema, but altering storage shape should be done carefully to avoid mismatches.
- Programmatic read/write of existing pages: Use that page class’s static `get_option()` for reads or the Admin Settings manager for multi‑page writes (partial updates allowed).

## Legacy ↔ New conversion layer (mapper + transformer)
To preserve backward compatibility, Dokan ships with a settings key mapper and value transformer that bridge the legacy flat settings arrays with the new hierarchical storage.

- SettingsMapper (`includes/Admin/Settings/SettingsMapper.php`)
  - Purpose: Map legacy keys (`section.field`) to new keys (`Page.SubPage.Section.Field`) and vice versa.
  - Third‑party extension: Add your own mappings with the `dokan_settings_mapper_map` filter.
  - Helpers: `set_value_by_path(&$array, 'a.b.c', $value)` and `get_value_by_path($array, 'a.b.c', $default)` to work with nested arrays.

- LegacyTransformer (`includes/Admin/Settings/LegacyTransformer.php`)
  - Transforms new → old and old → new values using the mapper.
  - Usage:

```php
$t = new \WeDevs\Dokan\Admin\Settings\LegacyTransformer();
$legacy = $t->transform(['from' => 'new', 'data' => $pagesValues]);
$new    = $t->transform(['from' => 'old', 'data' => $legacyArrays]);
```

- Legacy Admin endpoints bridging (`includes/Admin/Settings.php`)
  - `get_settings_value()`: sources values from the new storage, converts to legacy structure, and merges with existing legacy options for unmapped fields.
  - `save_settings_value()`: converts posted legacy arrays to the new hierarchical structure, then saves via the new Settings manager. If a field is not mapped, it falls back to legacy `update_option` for that section.

### Adding mappings (third‑party)
Example: legacy `dokan_general.custom_store_url` → new `general.marketplace.marketplace_settings.vendor_store_url`

```php
add_filter('dokan_settings_mapper_map', function(array $map) {
    $map['dokan_general.custom_store_url'] = 'general.marketplace.marketplace_settings.vendor_store_url';
    return $map;
});
```

If you have your own legacy options that you want bridged to a new page you provide, add entries similarly. The reverse map is derived automatically.

## Populating new storage from legacy values (one‑time fallback)
- Behavior: On admin settings read, Dokan populates new storage from legacy options only for missing/blank mapped keys. This happens in `WeDevs\Dokan\Admin\Settings::ensure_new_settings_populated_from_legacy()`.
- Rule: Existing non‑blank new values are not overwritten. After initial population, new storage is the source of truth.
- Storage shape written during population: The system writes with a page wrapper under the same option (for example, `update_option('dokan_settings_general', ['general' => ...])`). Pages automatically unwrap during reads.

## Reference

### Classes
- `WeDevs\Dokan\Admin\Settings\Settings`: Admin Settings manager (`get_pages`, `save`, `settings`, `scripts`, `styles`).
- `WeDevs\Dokan\Admin\Settings\Pages\AbstractPage`: Base for pages (extends `Abstracts\Settings`, which provides storage, `get_option`, `save`, etc.).
- `WeDevs\Dokan\Abstracts\Settings`: Storage, validation, sanitize, and lifecycle utilities.
- `WeDevs\Dokan\Abstracts\SettingsElement`: Base element with children support and populate/sanitize/validate hooks.
- `WeDevs\Dokan\Admin\Settings\Elements\ElementFactory`: Fluent builders for sub pages, sections, and fields.
- `WeDevs\Dokan\Admin\Settings\SettingsMapper`: Maps legacy↔new keys and provides dot‑path helpers.
- `WeDevs\Dokan\Admin\Settings\LegacyTransformer`: Converts arrays between legacy and new structures.
- `WeDevs\Dokan\Admin\Settings` (legacy controller): Bridges old endpoints to the new storage and handles one‑time population from legacy options.

### Filters
- `dokan_admin_settings_services`: Add your page class to Dokan’s DI registration list.
- `dokan_admin_settings_pages`: Add/alter the array of page instances.
- `dokan_admin_settings_pages_mapper`: Filter the pages mapper payload for frontend.
- `dokan_settings_mapper_map`: Extend/override the legacy↔new key mapping array.
- `{hook_key}_populate`: Generic populate filter for a SettingsElement. For pages, `hook_key` usually equals its storage key (for example, `dokan_settings_general_populate`). Use with care to avoid breaking shape.

### Actions
- `dokan_settings_after_save_{storage_key}`: Fired after a page’s values are saved (for example, `dokan_settings_after_save_dokan_settings_general`).
- `dokan_before_saving_settings` / `dokan_after_saving_settings`: Legacy controller actions around saving a legacy section.

## Tips
- Prefer adding new functionality as a dedicated Page (with one or more sub‑pages) rather than mutating core pages.
- When bridging your own legacy options to a new page, always add mapper entries so both reads and writes flow through the new storage.
- Take advantage of partial updates: your save payload can include only the fields you need to change.
- Use the provided PHPUnit tests in `tests/php/src/Admin/Settings` as living examples of mapping and bridging behavior.
