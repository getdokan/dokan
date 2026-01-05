# Plugin Settings

A reusable WordPress settings framework for building admin settings pages with React and PHP.

## Features

- 🎯 **Type-safe** - Full TypeScript support
- 🔌 **Extensible** - Easy to add custom field types
- 📦 **Modular** - Use only what you need
- 🎨 **Configurable** - Customize namespaces, hooks, and storage
- 🔄 **Dependency System** - Fields can depend on other fields
- 🔍 **Search** - Built-in search functionality

## Installation

### PHP (Composer)

```bash
composer require wedevs/plugin-settings
```

### JavaScript (npm)

```bash
npm install @wedevs/plugin-settings
```

## Quick Start

### Backend (PHP)

```php
use WeDevs\PluginSettings\SettingsManager;
use WeDevs\PluginSettings\Pages\AbstractPage;
use WeDevs\PluginSettings\Elements\ElementFactory;

// 1. Create a settings page
class MySettingsPage extends AbstractPage {
    protected string $id = 'my-settings';
    protected string $storage_key = 'my_plugin_settings';

    public function describe_settings(): void {
        $this
            ->set_title('My Settings')
            ->add(
                ElementFactory::sub_page('general')
                    ->set_title('General')
                    ->add(
                        ElementFactory::section('site_settings')
                            ->add(
                                ElementFactory::field('site_name', 'text')
                                    ->set_title('Site Name')
                                    ->set_default('My Site')
                            )
                            ->add(
                                ElementFactory::field('enable_feature', 'switch')
                                    ->set_title('Enable Feature')
                                    ->set_default('off')
                            )
                    )
            );
    }
}

// 2. Initialize the manager
$manager = new SettingsManager([
    'namespace' => 'my-plugin',
    'rest_namespace' => 'my-plugin/v1',
    'hook_prefix' => 'my_plugin_settings',
]);

// 3. Register your page
$page = new MySettingsPage();
$page->register_hooks();

// 4. Register REST routes
add_action('rest_api_init', function() use ($manager) {
    $controller = new \WeDevs\PluginSettings\REST\SettingsController(
        $manager,
        'my-plugin/v1'
    );
    $controller->register_routes();
});
```

### Frontend (TypeScript/React)

```typescript
import { createSettingsStore } from '@wedevs/plugin-settings';
import { useSelect, useDispatch } from '@wordpress/data';

// 1. Create the store
const STORE_NAME = 'my-plugin/settings';
const settingsStore = createSettingsStore({
    storeName: STORE_NAME,
    restEndpoint: '/my-plugin/v1/settings',
});

// 2. Use in your component
function MySettingsPage() {
    const { settings, loading, needSaving } = useSelect(
        (select) => ({
            settings: select(STORE_NAME).getSettings(),
            loading: select(STORE_NAME).getLoading(),
            needSaving: select(STORE_NAME).getNeedSaving(),
        }),
        []
    );

    const dispatch = useDispatch();

    const saveSettings = () => {
        dispatch(STORE_NAME).saveSettings(settings);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Render your settings UI */}
            {needSaving && (
                <button onClick={saveSettings}>Save</button>
            )}
        </div>
    );
}
```

## Available Field Types

| Type | PHP Class | Description |
|------|-----------|-------------|
| `text` | `Text` | Single-line text input |
| `number` | `Number` | Numeric input with min/max |
| `select` | `Select` | Dropdown select |
| `switch` | `Switcher` | Toggle switch |
| `checkbox` | `Checkbox` | Checkbox input |
| `radio` | `Radio` | Radio button group |
| `textarea` | `TextArea` | Multi-line text |
| `password` | `Password` | Password input |

## Adding Custom Field Types

### PHP

```php
use WeDevs\PluginSettings\Elements\Fields\BaseField;

class MyCustomField extends BaseField {
    protected string $variant = 'my_custom';

    public function data_validation($data): bool {
        return true; // Your validation
    }

    public function sanitize_element($data) {
        return sanitize_text_field($data);
    }

    public function escape_element($data) {
        return esc_attr($data);
    }
}

// Register the field type
\WeDevs\PluginSettings\Elements\Field::register_field_type(
    'my_custom',
    MyCustomField::class
);
```

### TypeScript

```typescript
// Register custom field component
import { registerField } from '@wedevs/plugin-settings';

const MyCustomField = ({ element, onValueChange }) => {
    return (
        <input
            type="text"
            value={element.value || ''}
            onChange={(e) => onValueChange({ ...element, value: e.target.value })}
        />
    );
};

registerField('my_custom', MyCustomField);
```

## Dependencies

Fields can depend on other fields to show/hide or modify their state:

```php
ElementFactory::field('api_key', 'text')
    ->set_title('API Key')
    ->add_dependency(
        'general.enable_api',  // Key path
        'on',                   // Expected value
        true,                   // Apply to self
        'display',              // Attribute to modify
        'show',                 // Effect
        '=='                    // Comparison operator
    );
```

## Hooks & Filters

### PHP

- `{hook_prefix}_pages` - Filter registered pages
- `{hook_prefix}_pages_data` - Filter pages data for frontend
- `{hook_prefix}_settings_saved` - Action after saving settings
- `{hook_prefix}_rest_settings_response` - Filter REST response
- `settings_framework_field_map` - Filter field type mapping

### JavaScript

- `{filterPrefix}_settings_before_save` - Before saving settings
- `{filterPrefix}_settings_after_save` - After saving settings

## Configuration Options

```php
$manager = new SettingsManager([
    // Unique namespace for your plugin
    'namespace' => 'my-plugin',
    
    // REST API namespace
    'rest_namespace' => 'my-plugin/v1',
    
    // Prefix for all hooks and filters
    'hook_prefix' => 'my_plugin_settings',
]);
```

## License

GPL-2.0-or-later

